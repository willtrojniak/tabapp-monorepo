package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/willtrojniak/tabapp-monorepo/services"
)

const requestIdHeader = "X-Request-Id"

func TestResponseWriter_DefaultsTo200OnWrite(t *testing.T) {
	wantStatus := http.StatusOK

	rec := httptest.NewRecorder()
	rw := wrapResponseWriter(rec)

	if _, err := rw.Write([]byte("hello")); err != nil {
		t.Fatalf("unexpected error writing: %v", err)
	}

	if rw.Code() != wantStatus {
		t.Errorf("got status %d, want %d", rw.Code(), wantStatus)
	}
}

func TestResponseWriter_FirstWriteHeaderWins(t *testing.T) {
	firstStatus := http.StatusNotFound
	secondStatus := http.StatusInternalServerError

	rec := httptest.NewRecorder()
	rw := wrapResponseWriter(rec)

	rw.WriteHeader(firstStatus)
	rw.WriteHeader(secondStatus)

	if rw.Code() != firstStatus {
		t.Errorf("got status %d, want %d", rw.Code(), firstStatus)
	}
	if rec.Code != firstStatus {
		t.Errorf("underlying recorder got status %d, want %d", rec.Code, firstStatus)
	}
}

func TestRequestIDMiddleware_SetsHeaderAndContext(t *testing.T) {
	var sawId string
	var sawOk bool

	handler := RequestIDMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sawId, sawOk = services.RequestIDFromContext(r.Context())
	}))

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	handler(rec, req)

	headerId := rec.Header().Get(requestIdHeader)
	if headerId == "" {
		t.Fatalf("expected %s header to be set", requestIdHeader)
	}
	if !sawOk {
		t.Fatal("expected downstream handler to see a request id in context")
	}
	if sawId != headerId {
		t.Errorf("context id %q does not match response header id %q", sawId, headerId)
	}
}

func TestRequestIDMiddleware_UniquePerRequest(t *testing.T) {
	handler := RequestIDMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))

	rec1 := httptest.NewRecorder()
	handler(rec1, httptest.NewRequest(http.MethodGet, "/", nil))

	rec2 := httptest.NewRecorder()
	handler(rec2, httptest.NewRequest(http.MethodGet, "/", nil))

	id1 := rec1.Header().Get(requestIdHeader)
	id2 := rec2.Header().Get(requestIdHeader)
	if id1 == "" || id2 == "" {
		t.Fatal("expected both requests to get an id")
	}
	if id1 == id2 {
		t.Errorf("expected different request ids, got the same value %q for both", id1)
	}
}
