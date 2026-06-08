package services

import "net/http"

type HttpErrorHandler func(HttpHandlerErrorFn) http.HandlerFunc

type ErrorHandlerMux interface {
	HandleFunc(pattern string, fn HttpHandlerErrorFn)
	ServeHTTP(w http.ResponseWriter, r *http.Request)
}

type HttpHandlerErrorFn func(http.ResponseWriter, *http.Request) error
