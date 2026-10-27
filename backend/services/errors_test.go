package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
)

const (
	testPath      = "/widgets"
	testRequestId = "req-xyz"
)

var (
	testBoomErr       = errors.New("boom")
	testValidationMsg = "name is required"
	testValidationErr = errors.New("bad field")
)

type errorResponseBody struct {
	Msg  string `json:"msg"`
	Data string `json:"data"`
}

// newTestErrorHandler returns an ErrorHandler whose logs land in the
// returned buffer, decodable as a single JSON record per call to Handle.
func newTestErrorHandler() (*ErrorHandler, *bytes.Buffer) {
	var buf bytes.Buffer
	jsonHandler := slog.NewJSONHandler(&buf, &slog.HandlerOptions{Level: slog.LevelDebug})
	return NewErrorHandler(slog.New(NewRequestIDHandler(jsonHandler))), &buf
}

func decodeLogRecord(t *testing.T, buf *bytes.Buffer) map[string]any {
	t.Helper()
	var record map[string]any
	if err := json.Unmarshal(buf.Bytes(), &record); err != nil {
		t.Fatalf("failed to decode log record: %v\nraw: %s", err, buf.String())
	}
	return record
}

func TestHandleHttpError_GenericErrorIs500(t *testing.T) {
	wantStatus := http.StatusInternalServerError
	wantLevel := slog.LevelError.String()

	eh, buf := newTestErrorHandler()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, testPath, nil)

	eh.Handle(rec, req, testBoomErr)

	if rec.Code != wantStatus {
		t.Errorf("got status %d, want %d", rec.Code, wantStatus)
	}

	var body errorResponseBody
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}
	if body.Msg != http.StatusText(wantStatus) {
		t.Errorf("got msg %q, want %q", body.Msg, http.StatusText(wantStatus))
	}

	record := decodeLogRecord(t, buf)
	if level, _ := record["level"].(string); level != wantLevel {
		t.Errorf("got log level %q, want %q", level, wantLevel)
	}
}

func TestHandleHttpError_ServiceErrorUsesItsOwnStatus(t *testing.T) {
	wantStatus := http.StatusBadRequest
	wantLevel := slog.LevelDebug.String()

	eh, buf := newTestErrorHandler()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, testPath, nil)

	eh.Handle(rec, req, NewValidationServiceError(testValidationErr, testValidationMsg))

	if rec.Code != wantStatus {
		t.Errorf("got status %d, want %d", rec.Code, wantStatus)
	}

	var body errorResponseBody
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}
	if body.Data != testValidationMsg {
		t.Errorf("got data %q, want %q", body.Data, testValidationMsg)
	}

	record := decodeLogRecord(t, buf)
	if level, _ := record["level"].(string); level != wantLevel {
		t.Errorf("got log level %q, want %q", level, wantLevel)
	}
}

func TestHandleHttpError_WrappedServiceErrorKeepsItsStatus(t *testing.T) {
	wantStatus := http.StatusNotFound

	eh, _ := newTestErrorHandler()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, testPath, nil)

	eh.Handle(rec, req, fmt.Errorf("get widget: %w", NewNotFoundServiceError(testBoomErr)))

	if rec.Code != wantStatus {
		t.Errorf("got status %d, want %d", rec.Code, wantStatus)
	}
}

func TestHandleHttpError_ServiceErrorWithoutCause(t *testing.T) {
	wantStatus := http.StatusUnsupportedMediaType

	eh, buf := newTestErrorHandler()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, testPath, nil)

	eh.Handle(rec, req, NewServiceError(nil, wantStatus, nil))

	if rec.Code != wantStatus {
		t.Errorf("got status %d, want %d", rec.Code, wantStatus)
	}

	record := decodeLogRecord(t, buf)
	if got, _ := record["err"].(string); got != http.StatusText(wantStatus) {
		t.Errorf("got err %q, want %q", got, http.StatusText(wantStatus))
	}
}

func TestHandleHttpError_IncludesRequestID(t *testing.T) {
	eh, buf := newTestErrorHandler()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, testPath, nil)
	req = req.WithContext(WithRequestID(req.Context(), testRequestId))

	eh.Handle(rec, req, testBoomErr)

	record := decodeLogRecord(t, buf)
	if got, _ := record["request_id"].(string); got != testRequestId {
		t.Errorf("got request_id %q, want %q", got, testRequestId)
	}
}
