package api

import (
	"context"
	"log"
	"log/slog"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/robfig/cron/v3"
	"github.com/willtrojniak/tabapp-monorepo/cache"
	"github.com/willtrojniak/tabapp-monorepo/db"
	"github.com/willtrojniak/tabapp-monorepo/models"
	"github.com/willtrojniak/tabapp-monorepo/services"
	"github.com/willtrojniak/tabapp-monorepo/services/auth"
	"github.com/willtrojniak/tabapp-monorepo/services/events"
	"github.com/willtrojniak/tabapp-monorepo/services/reports"
	"github.com/willtrojniak/tabapp-monorepo/services/sessions"
	"github.com/willtrojniak/tabapp-monorepo/services/shop"
	"github.com/willtrojniak/tabapp-monorepo/services/user"
)

type APIServer struct {
	addr   string
	store  *db.PgxStore
	cache  *redis.Client
	events *events.EventDispatcher
	logger *slog.Logger
}

type Handler interface {
	RegisterRoutes(http.ServeMux)
}

func NewAPIServer(
	addr string,
	store *db.PgxStore,
	cache *redis.Client,
	events *events.EventDispatcher,
	logger *slog.Logger) *APIServer {
	return &APIServer{
		addr:   addr,
		store:  store,
		cache:  cache,
		events: events,
		logger: logger,
	}
}

func (s *APIServer) Run() error {

	errorHandler := services.NewErrorHandler(s.logger)

	sessionStore := cache.NewRedisCache(s.cache)
	sessionManager := sessions.NewSessionsManager(sessionStore, time.Hour*24*30, time.Hour*1, errorHandler.Handle, s.logger)
	userHandler := user.NewHandler(s.store, sessionManager, errorHandler.Handle, s.logger)

	authHandler, err := auth.NewHandler(errorHandler.Handle, sessionManager, userHandler, s.logger)
	if err != nil {
		log.Fatal("Failed to initialize auth handler")
	}

	shopHandler := shop.NewHandler(s.store, authHandler, sessionManager, s.events, errorHandler.Handle, s.logger)
	reportHandler := reports.NewReportHandler(s.store, s.events, s.logger)

	router := http.NewServeMux()
	v1 := http.NewServeMux()

	authHandler.RegisterRoutes(router)
	userHandler.RegisterRoutes(v1)
	shopHandler.RegisterRoutes(v1)

	router.Handle("/api/v1/", http.StripPrefix("/api/v1", WithMiddleware()(v1)))

	tz, _ := time.LoadLocation("America/New_York")
	c := cron.New(cron.WithLocation(tz))
	c.AddFunc("0 6 * * *", func() {
		start := time.Now()
		query := models.GetShopsQueryParams{}
		shops, err := shopHandler.GetShops(context.Background(), &query)
		if err != nil {
			s.logger.Warn("Error retreiving all shops", "err", err)
			return
		}

		failures := 0
		for _, shop := range shops {
			if err := reportHandler.GenerateShopTabOverview(context.Background(), int(shop.Id)); err != nil {
				failures++
			}
		}

		s.logger.Info("Daily tab report job finished",
			"shops", len(shops),
			"failures", failures,
			"elapsed", time.Since(start),
		)
	})
	c.Start()
	defer c.Stop()

	return http.ListenAndServe(s.addr,
		WithMiddleware(
			RequestIDMiddleware,
			RequestLoggerMiddleware(s.logger),
			CORSMiddleware,
			func(next http.Handler) http.HandlerFunc {
				return sessions.HandleHTTPSessionError(errorHandler.Handle)(sessionManager.RequireCSRFToken(next))
			},
		)(router))
}
