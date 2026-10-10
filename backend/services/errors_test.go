package services

import (
	"bytes"
	"encoding/json"
	"errors"
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

// captureLogRecord swaps in a temporary JSON log handler for the duration of
// fn, which must produce exactly one log line, and returns it decoded.
func captureLogRecord(t *testing.T, fn func()) map[string]any {
	t.Helper()
	var buf bytes.Buffer
	prev := slog.Default()
	slog.SetDefault(slog.New(slog.NewJSONHandler(&buf, nil)))
	defer slog.SetDefault(prev)

	fn()

	var record map[string]any
	if err := json.Unmarshal(buf.Bytes(), &record); err != nil {
		t.Fatalf("failed to decode log record: %v\nraw: %s", err, buf.String())
	}
	return record
}

func TestHandleHttpError_GenericErrorIs500(t *testing.T) {
	wantStatus := http.StatusInternalServerError
	wantLevel := slog.LevelError.String()

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, testPath, nil)

	record := captureLogRecord(t, func() {
		HandleHttpError(rec, req, testBoomErr)
	})

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

	if level, _ := record["level"].(string); level != wantLevel {
		t.Errorf("got log level %q, want %q", level, wantLevel)
	}
}

func TestHandleHttpError_ServiceErrorUsesItsOwnStatus(t *testing.T) {
	wantStatus := http.StatusBadRequest
	wantLevel := slog.LevelWarn.String()

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, testPath, nil)

	record := captureLogRecord(t, func() {
		HandleHttpError(rec, req, NewValidationServiceError(testValidationErr, testValidationMsg))
	})

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

	if level, _ := record["level"].(string); level != wantLevel {
		t.Errorf("got log level %q, want %q", level, wantLevel)
	}
}

func TestHandleHttpError_IncludesRequestID(t *testing.T) {
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, testPath, nil)
	req = req.WithContext(WithRequestID(req.Context(), testRequestId))

	record := captureLogRecord(t, func() {
		HandleHttpError(rec, req, testBoomErr)
	})

	if got, _ := record["request_id"].(string); got != testRequestId {
		t.Errorf("got request_id %q, want %q", got, testRequestId)
	}
}
