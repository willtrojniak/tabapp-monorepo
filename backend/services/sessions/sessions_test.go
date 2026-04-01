package sessions

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"
	"time"

	"github.com/willtrojniak/tabapp-monorepo/cache"
)

func TestEmptySession(t *testing.T) {
	requestMethod := "GET"
	requestTarget := "https://google.com"

	r := httptest.NewRequest(requestMethod, requestTarget, nil)
	if id, ok := getSessionIdFromRequest(r); ok {
		t.Errorf("No error retreiving session id <%s> from request", id)
	}
}

func TestSaveSessionToStore(t *testing.T) {
	cacheImpl := cache.NewMemoryCache()
	ttl := 2 * time.Minute
	sessions := NewSessionsManager(cacheImpl, ttl, ttl, nil)

	sId := "xyz"
	s := Session{
		Id: sId,
		data: sessionData{
			UserId:    "uid",
			CSRFToken: "csrf",
			Ip:        "10.0.0.127",
		},
	}

	err := sessions.saveSessionToStore(context.Background(), &s)
	if err != nil {
		t.Errorf("Failed to save session to session store: %s", err)
	}

	result, err := sessions.getSessionFromStore(context.Background(), sId)
	if err != nil {
		t.Errorf("Failed to retreive saved session from store: %s", err)
	}

	if !reflect.DeepEqual(s, *result) {
		t.Errorf("Original session is not equal to retreived session")
	}
}

func TestSaveSessionToResponse(t *testing.T) {
	cacheImpl := cache.NewMemoryCache()
	ttl := 2 * time.Minute
	sessions := NewSessionsManager(cacheImpl, ttl, ttl, nil)

	sId := "xyz"
	s := Session{
		Id: sId,
		data: sessionData{
			UserId:    "uid",
			CSRFToken: "csrf",
			Ip:        "10.0.0.127",
		},
	}

	writer := httptest.NewRecorder()
	sessions.saveSessionToResponse(writer, &s)
	res := writer.Result()
	cookies := res.Cookies()
	if len(cookies) == 0 {
		t.Errorf("No cookies set on response when 1 expected")
		t.FailNow()
	}

	for _, cookie := range cookies {
		if cookie.Name == session_cookie {
			if cookie.Value != sId {
				t.Errorf("Cookie session id did not match")
			}
			if cookie.MaxAge != int(ttl.Seconds()) {
				t.Errorf("Cookie ttl did not match")
			}
			return
		}
	}
	t.Logf("No session cookie found")

	csrf_resp := res.Header.Get(csrf_header)
	if csrf_resp != s.data.CSRFToken {
		t.Errorf("CSRF Token did not match")
	}
}

func TestRetrieveExpiredSession(t *testing.T) {
	cacheImpl := cache.NewMemoryCache()
	ttl := 500 * time.Millisecond
	sessions := NewSessionsManager(cacheImpl, ttl, ttl, nil)

	sId := "xyz"
	s := Session{
		Id: sId,
		data: sessionData{
			UserId:    "",
			CSRFToken: "csrf",
			Ip:        "10.0.0.127",
		},
	}

	err := sessions.saveSessionToStore(context.Background(), &s)
	if err != nil {
		t.Errorf("Failed to save session to session store: %s", err)
	}
	time.Sleep(time.Second)

	result, err := sessions.getSessionFromStore(context.Background(), sId)
	if err == nil || result != nil {
		t.Errorf("Retrieved session when should have expired")
	}
}

func TestCSRFMismatch(t *testing.T) {
	cacheImpl := cache.NewMemoryCache()
	ttl := 2 * time.Minute
	sessions := NewSessionsManager(cacheImpl, ttl, ttl, nil)

	request := httptest.NewRequest("POST", "/", nil)
	ip := readUserIP(request)

	sId := "xyz"
	storedSession := Session{
		Id: sId,
		data: sessionData{
			UserId:    "uid",
			CSRFToken: "csrf",
			Ip:        ip,
		},
	}

	requestSession := Session{
		Id: sId,
		data: sessionData{
			UserId:    "uid",
			CSRFToken: "abc",
			Ip:        ip,
		},
	}

	err := sessions.saveSessionToStore(context.Background(), &storedSession)
	if err != nil {
		t.Errorf("Failed to save session to session store: %s", err)
	}

	httpHandler := http.NewServeMux()
	httpHandler.HandleFunc("POST /", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handleFunc := sessions.RequireCSRFToken(httpHandler)
	responseWriter := httptest.NewRecorder()
	request.AddCookie(sessions.generateSessionCookie(&requestSession))

	err = handleFunc(responseWriter, request)
	if err == nil {
		t.Errorf("No error for mismatched CSRF tokens")
	}

	if !errors.Is(err, ErrCSRFMismatch) {
		t.Errorf("Error is not of expected ErrCSRFMismatch")
	}
}
