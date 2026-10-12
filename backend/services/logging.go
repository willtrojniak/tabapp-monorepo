package services

import (
	"context"
	"log/slog"
)

// requestIDHandler injects the request_id from ctx into every log record
// that goes through a *Context-style slog call (WarnContext, ErrorContext, ...).
type requestIDHandler struct {
	slog.Handler
}

func NewRequestIDHandler(h slog.Handler) slog.Handler {
	return &requestIDHandler{Handler: h}
}

func (h *requestIDHandler) Handle(ctx context.Context, r slog.Record) error {
	if id, ok := RequestIDFromContext(ctx); ok {
		r.AddAttrs(slog.String("request_id", id))
	}
	return h.Handler.Handle(ctx, r)
}

func (h *requestIDHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return &requestIDHandler{Handler: h.Handler.WithAttrs(attrs)}
}

func (h *requestIDHandler) WithGroup(name string) slog.Handler {
	return &requestIDHandler{Handler: h.Handler.WithGroup(name)}
}
