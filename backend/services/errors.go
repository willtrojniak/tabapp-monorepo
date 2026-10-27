package services

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type HTTPError interface {
	Data() interface{}
	Msg() string
	StatusCode() int
	error
}

func writeHttpError(w http.ResponseWriter, e HTTPError) {
	w.WriteHeader(e.StatusCode())
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(
		struct {
			Msg  string      `json:"msg"`
			Data interface{} `json:"data"`
		}{Msg: e.Msg(), Data: e.Data()})

}

type HTTPErrorHandler func(http.ResponseWriter, *http.Request, error)

type ErrorHandler struct {
	logger *slog.Logger
}

func NewErrorHandler(logger *slog.Logger) *ErrorHandler {
	return &ErrorHandler{logger: logger}
}

func (h *ErrorHandler) Handle(w http.ResponseWriter, r *http.Request, err error) {
	var httpErr HTTPError
	switch e := err.(type) {
	case HTTPError:
		httpErr = e
	default:
		httpErr = NewInternalServiceError(err)
	}

	attrs := []any{
		"method", r.Method,
		"path", r.URL.Path,
		"status", httpErr.StatusCode(),
		"err", err,
	}
	if httpErr.StatusCode() >= 500 {
		h.logger.ErrorContext(r.Context(), "Request failed", attrs...)
	} else {
		h.logger.DebugContext(r.Context(), "Request failed", attrs...)
	}

	writeHttpError(w, httpErr)
}

type ServiceError struct {
	data interface{}
	msg  string
	code int
	err  error
}

func NewInternalServiceError(err error) *ServiceError {
	return NewServiceError(err, http.StatusInternalServerError, nil)
}

func NewUnauthenticatedServiceError(err error) *ServiceError {
	return NewServiceError(err, http.StatusUnauthorized, nil)
}

func NewUnauthorizedServiceError(err error) *ServiceError {
	return NewServiceError(err, http.StatusForbidden, nil)
}

func NewDataConflictServiceError(err error) *ServiceError {
	return NewServiceError(err, http.StatusConflict, nil)
}

func NewNotFoundServiceError(err error) *ServiceError {
	return NewServiceError(err, http.StatusNotFound, nil)
}

type ValidationError struct {
	Value interface{}
	Error string
}
type ValidationErrors map[string]ValidationError

func NewValidationServiceError(err error, parsingErrors interface{}) *ServiceError {
	return NewServiceError(err, http.StatusBadRequest, parsingErrors)
}

func NewServiceError(err error, code int, data interface{}) *ServiceError {
	return &ServiceError{err: err, code: code, msg: http.StatusText(code), data: data}
}

func (e *ServiceError) StatusCode() int {
	return e.code
}

func (e *ServiceError) Msg() string {
	return e.msg
}

func (e *ServiceError) Data() interface{} {
	return e.data
}

func (e *ServiceError) Error() string {
	if e.err == nil {
		return e.msg
	}
	return e.err.Error()
}

func (e *ServiceError) Unwrap() error {
	return e.err
}
