package user

import (
	"encoding/json"
	"net/http"

	"github.com/willtrojniak/tabapp-monorepo/models"
	"github.com/willtrojniak/tabapp-monorepo/services/sessions"
)

const userIdPath = "userId"

func (h *Handler) RegisterRoutes(router *http.ServeMux) {
	h.logger.Info("Registering user routes")
	sessionMux := h.sessions.NewSessionServeMux(sessions.HandleHTTPSessionError)
	router.Handle("", sessionMux)

	sessionMux.HandleFunc("GET /users", h.handleGetUser)
	sessionMux.HandleFunc("PATCH /users", h.handleUpdateUser)

}

func (h *Handler) handleGetUser(w http.ResponseWriter, r *http.Request, session *sessions.AuthedSession) {
	h.logger.Debug("Handling get user")
	user, err := h.GetUser(r.Context(), session)
	if err != nil {
		h.handleError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
	return
}

func (h *Handler) handleUpdateUser(w http.ResponseWriter, r *http.Request, session *sessions.AuthedSession) {
	h.logger.Debug("Handling Update User")
	data := models.UserUpdate{}
	err := models.ReadRequestJson(r, &data)
	if err != nil {
		h.handleError(w, err)
		return
	}
	if *data.PreferredName == "" {
		data.PreferredName = nil
	}

	err = h.UpdateUser(r.Context(), session, session.UserId, &data)
	if err != nil {
		h.handleError(w, err)
		return
	}
}
