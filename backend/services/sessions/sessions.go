package sessions

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"slices"

	"github.com/willtrojniak/tabapp-monorepo/cache"
	"github.com/willtrojniak/tabapp-monorepo/models"
	"github.com/willtrojniak/tabapp-monorepo/services"
	"github.com/willtrojniak/tabapp-monorepo/util"
)

const (
	session_cookie = "session"
	csrf_header    = "X-CSRF-TOKEN"
	csrf_field     = "xcsrftoken"
)

var (
	safe_methods = []string{"GET", "HEAD", "OPTIONS", "TRACE"}
)

type sessionData struct {
	UserId    string
	CSRFToken string
	Ip        string
}

type Session struct {
	data sessionData
	Id   string
}

type AuthedSession struct {
	Id     string
	UserId string
}

type Handler struct {
	store     cache.Cache
	authTTL   time.Duration
	unauthTTL time.Duration
}

var ErrSessionNotAuthed = SessionNotAuthedError{}
var ErrNoSession = NoSessionError{}
var ErrNoCSRFToken = NoCSRFTokenError{}
var ErrCSRFMismatch = CSRFMismatchError{}
var ErrIpMismatch = IpMismatchError{}

type SessionNotAuthedError struct{}
type NoSessionError struct{}
type NoCSRFTokenError struct{}
type CSRFMismatchError struct {
	stored string
	seen   string
}
type IpMismatchError struct{}

func (e SessionNotAuthedError) Error() string {
	return "Session not authenticated"
}

func (e NoSessionError) Error() string {
	return "No session data"
}

func (e NoCSRFTokenError) Error() string {
	return "No CSRF token"
}

func (e CSRFMismatchError) Error() string {
	return fmt.Sprintf("Request CSRF Token (%s) did not match stored (%s)", e.seen, e.stored)
}

func (e CSRFMismatchError) Is(target error) bool {
	return target == ErrCSRFMismatch
}

func (e IpMismatchError) Error() string {
	return "Ip mismatch on session"
}

func NewSessionsManager(store cache.Cache, authTTL time.Duration, unauthTTL time.Duration, h services.HTTPErrorHandler) *Handler {

	return &Handler{
		store:     store,
		authTTL:   authTTL,
		unauthTTL: unauthTTL,
	}
}

func (s *Handler) SetNewSession(w http.ResponseWriter, r *http.Request, user *models.User) (*Session, error) {
	ip := readUserIP(r)

	session, err := newSessionFromUser(ip, user)
	if err != nil {
		slog.Warn("Error while creating new session.")
		return nil, err
	}

	err = s.saveSessionToStore(r.Context(), session)
	if err != nil {
		return nil, err
	}

	if oldSessionId, ok := getSessionIdFromRequest(r); ok {
		// The client has a previous saved session
		err := s.store.Delete(r.Context(), oldSessionId)
		if err != nil {
			slog.Warn("Failed to delete old session from store.", "sessionId", oldSessionId, "error", err)
		}
	}

	s.saveSessionToResponse(w, session)

	slog.Debug("Session created", "sessionId", session.Id)

	return session, nil
}

func (s *Handler) GetSession(r *http.Request) (*Session, error) {
	sessionId, ok := getSessionIdFromRequest(r)
	if !ok {
		return nil, ErrNoSession
	}

	session, err := s.getSessionFromStore(r.Context(), sessionId)
	if err != nil {
		return nil, err
	}

	if session.data.Ip != readUserIP(r) {
		slog.Warn("Attempted to access session with different ip", "stored-ip", session.data.Ip, "request-ip", readUserIP(r))
		return nil, ErrIpMismatch
	}

	return session, nil
}

func (s *Handler) WithAuthedSession(next func(w http.ResponseWriter, r *http.Request, session *AuthedSession)) services.HttpHandlerErrorFn {
	return func(w http.ResponseWriter, r *http.Request) error {
		session, err := s.GetSession(r)
		if err != nil {
			return err
		}

		authed, ok := session.Authed()
		if !ok {
			return ErrSessionNotAuthed
		}

		next(w, r, authed)
		return nil
	}
}

func (s *Handler) RequireCSRFToken(next http.Handler) services.HttpHandlerErrorFn {
	return func(w http.ResponseWriter, r *http.Request) error {
		requestToken := getCSRFTokenFromRequest(r)
		safeMethod := slices.Contains(safe_methods, r.Method)

		session, sessionErr := s.GetSession(r)
		validSession := sessionErr == nil

		// Make sure header has token on future requests
		if validSession {
			s.saveSessionToResponse(w, session)
		} else {
			// Create a new anonymous session if there is no active session
			s.SetNewSession(w, r, nil)
		}

		if !safeMethod {
			if !validSession {
				return ErrNoCSRFToken
			}

			if requestToken != session.data.CSRFToken {
				return CSRFMismatchError{
					stored: session.data.CSRFToken,
					seen:   requestToken,
				}
			}
		}

		next.ServeHTTP(w, r)
		return nil
	}
}

func newSessionFromUser(ip string, user *models.User) (*Session, error) {
	id, err := util.RandString(32)
	if err != nil {
		return nil, err
	}

	csrf, err := util.RandString(32)
	if err != nil {
		return nil, err
	}

	userId := ""
	if user != nil {
		userId = user.Id
	}

	return &Session{
		Id: id,
		data: sessionData{
			UserId:    userId,
			CSRFToken: csrf,
			Ip:        ip,
		},
	}, nil
}

func (s *Handler) generateSessionCookie(session *Session) *http.Cookie {
	return &http.Cookie{
		Name:     session_cookie,
		Value:    session.Id,
		MaxAge:   int(s.ttl(session).Seconds()),
		Secure:   true,
		HttpOnly: true,
		Path:     "/",
		SameSite: 4,
	}
}

func (s *Handler) saveSessionToResponse(w http.ResponseWriter, session *Session) {

	c := s.generateSessionCookie(session)
	http.SetCookie(w, c)
	w.Header().Set(csrf_header, session.data.CSRFToken)
}

func (s *Handler) saveSessionToStore(ctx context.Context, session *Session) error {
	data, err := json.Marshal(session.data)
	if err != nil {
		slog.Warn("Failed to marshal session data.", "sessionId", session.Id)
		return err
	}

	err = s.store.Set(ctx, session.Id, data, s.ttl(session))
	if err != nil {
		slog.Warn("Failed to save session to store.", "sessionId", session.Id)
		return err
	}

	return nil
}

func getSessionIdFromRequest(r *http.Request) (string, bool) {
	cookie, err := r.Cookie(session_cookie)
	if err != nil {
		return "", false
	}
	return cookie.Value, true
}

func (s *Handler) getSessionFromStore(ctx context.Context, id string) (*Session, error) {
	data, err := s.store.Get(ctx, id)
	if err != nil {
		switch {
		case errors.Is(err, cache.ErrNotFound):
			return nil, ErrNoSession
		default:
			return nil, err
		}
	}

	session := &Session{
		Id: id,
	}
	err = json.Unmarshal(data, &session.data)
	if err != nil {
		return nil, err
	}

	return session, nil
}

// Convert a general session into an authenticated one
//
// Returns an error of type ErrSessionNotAuthed if the session
// can not be authenticated
func (s *Session) Authed() (*AuthedSession, bool) {
	if s.data.UserId == "" {
		return nil, false
	}
	return &AuthedSession{Id: s.Id, UserId: s.data.UserId}, true
}

func (s *Handler) ttl(session *Session) time.Duration {
	if _, ok := session.Authed(); ok {
		return s.authTTL
	}
	return s.unauthTTL
}

func readUserIP(r *http.Request) string {
	addr := r.RemoteAddr
	ip := strings.Split(addr, ":")[0]
	return ip
}

func getCSRFTokenFromRequest(r *http.Request) string {
	token := r.Header.Get(csrf_header)
	if token != "" {
		return token
	}

	token = r.PostFormValue(csrf_field)
	if token != "" {
		return token
	}

	return ""
}

type AuthedSessionServeMux struct {
	mux          *http.ServeMux
	sessions     *Handler
	errHandlerFn services.HttpErrorHandler
}

func (h *Handler) NewAuthedSessionServeMux(errorHandler services.HttpErrorHandler) *AuthedSessionServeMux {
	return &AuthedSessionServeMux{
		mux:          http.NewServeMux(),
		sessions:     h,
		errHandlerFn: errorHandler,
	}
}

func (mux *AuthedSessionServeMux) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	mux.mux.ServeHTTP(w, r)
}

func (mux *AuthedSessionServeMux) HandleFunc(pattern string, next func(w http.ResponseWriter, r *http.Request, session *AuthedSession)) {
	mux.mux.Handle(
		pattern,
		mux.errHandlerFn(mux.sessions.WithAuthedSession(next)),
	)
}

func HandleHTTPSessionError(next services.HttpHandlerErrorFn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := next(w, r)
		if err == nil {
			return
		}

		switch {
		case errors.Is(err, ErrNoSession), errors.Is(err, ErrSessionNotAuthed), errors.Is(err, ErrIpMismatch):
			services.HandleHttpError(w, services.NewUnauthenticatedServiceError(err))
			return
		case errors.Is(err, ErrCSRFMismatch), errors.Is(err, ErrNoCSRFToken):
			services.HandleHttpError(w, services.NewServiceError(err, http.StatusForbidden, nil))
			return
		default:
			services.HandleHttpError(w, services.NewInternalServiceError(err))
			return
		}
	}
}
