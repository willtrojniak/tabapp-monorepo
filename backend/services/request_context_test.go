package services

import (
	"context"
	"testing"
)

func TestRequestIDFromContext_NotPresent(t *testing.T) {
	if id, ok := RequestIDFromContext(context.Background()); ok {
		t.Errorf("expected no request id, got %q", id)
	}
}

func TestRequestIDFromContext_RoundTrip(t *testing.T) {
	wantId := "abc-123"
	ctx := WithRequestID(context.Background(), wantId)

	id, ok := RequestIDFromContext(ctx)
	if !ok {
		t.Fatal("expected request id to be present")
	}
	if id != wantId {
		t.Errorf("got request id %q, want %q", id, wantId)
	}
}
