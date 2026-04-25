package http

import (
	"encoding/json"
	"errors"
	stdhttp "net/http"

	"github.com/nyasha-hama/titlechain/services/api/internal/pilot"
)

const pilotSessionCookie = "titlechain_pilot_session"

type pilotAuthHandler struct {
	service pilot.Service
}

func newPilotAuthHandler(service pilot.Service) pilotAuthHandler {
	return pilotAuthHandler{service: service}
}

func (h pilotAuthHandler) signIn(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	var req pilot.SignInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, stdhttp.StatusBadRequest, map[string]string{"error": "invalid json body"})
		return
	}
	session, err := h.service.SignIn(r.Context(), req)
	if err != nil {
		status := stdhttp.StatusUnauthorized
		if errors.Is(err, pilot.ErrForbidden) {
			status = stdhttp.StatusForbidden
		}
		respondJSON(w, status, map[string]string{"error": "invalid email or password"})
		return
	}
	stdhttp.SetCookie(w, &stdhttp.Cookie{
		Name:     pilotSessionCookie,
		Value:    session.Token,
		Path:     "/",
		Expires:  session.ExpiresAt,
		HttpOnly: true,
		SameSite: stdhttp.SameSiteLaxMode,
	})
	respondJSON(w, stdhttp.StatusOK, session.User)
}

func (h pilotAuthHandler) signOut(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	if cookie, err := r.Cookie(pilotSessionCookie); err == nil {
		_ = h.service.SignOut(r.Context(), cookie.Value)
	}
	stdhttp.SetCookie(w, &stdhttp.Cookie{Name: pilotSessionCookie, Value: "", Path: "/", MaxAge: -1, HttpOnly: true})
	respondJSON(w, stdhttp.StatusOK, map[string]string{"status": "signed_out"})
}

func (h pilotAuthHandler) me(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	user, ok := pilotCurrentUser(h.service, w, r)
	if !ok {
		return
	}
	respondJSON(w, stdhttp.StatusOK, user)
}

func pilotCurrentUser(svc pilot.Service, w stdhttp.ResponseWriter, r *stdhttp.Request) (pilot.User, bool) {
	cookie, err := r.Cookie(pilotSessionCookie)
	if err != nil {
		respondJSON(w, stdhttp.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return pilot.User{}, false
	}
	user, err := svc.CurrentUser(r.Context(), cookie.Value)
	if err != nil {
		status := stdhttp.StatusUnauthorized
		if errors.Is(err, pilot.ErrForbidden) {
			status = stdhttp.StatusForbidden
		}
		respondJSON(w, status, map[string]string{"error": "unauthorized"})
		return pilot.User{}, false
	}
	return user, true
}

func respondJSON(w stdhttp.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
