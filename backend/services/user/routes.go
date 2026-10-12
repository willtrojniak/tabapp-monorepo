package user

import (
	"encoding/json"
	"net/http"

	"github.com/willtrojniak/tabapp-monorepo/models"
	"github.com/willtrojniak/tabapp-monorepo/services/sessions"
)

const userIdPath = "userId"

func (h *Handler) RegisterRoutes(router *http.ServeMux) {
	sessionMux := h.sessions.NewAuthedSessionServeMux(sessions.HandleHTTPSessionError(h.handleError))
	router.Handle("/users", sessionMux)
	router.Handle("/users/", sessionMux)

	sessionMux.HandleFunc("GET /users", h.handleGetUser)
	sessionMux.HandleFunc("PATCH /users", h.handleUpdateUser)

}

func (h *Handler) handleGetUser(w http.ResponseWriter, r *http.Request, session *sessions.AuthedSession) {
	user, err := h.GetUser(r.Context(), session)
	if err != nil {
		h.handleError(w, r, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
	return
}

func (h *Handler) handleUpdateUser(w http.ResponseWriter, r *http.Request, session *sessions.AuthedSession) {
	data := models.UserUpdate{}
	err := models.ReadRequestJson(r, &data, h.logger)
	if err != nil {
		h.handleError(w, r, err)
		return
	}
	if *data.PreferredName == "" {
		data.PreferredName = nil
	}

	err = h.UpdateUser(r.Context(), session, session.UserId, &data)
	if err != nil {
		h.handleError(w, r, err)
		return
	}
}
