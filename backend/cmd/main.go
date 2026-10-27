package main

import (
	"context"
	"encoding/gob"
	"fmt"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/willtrojniak/tabapp-monorepo/cmd/api"
	"github.com/willtrojniak/tabapp-monorepo/db"
	"github.com/willtrojniak/tabapp-monorepo/env"
	"github.com/willtrojniak/tabapp-monorepo/internal/encryptor"
	"github.com/willtrojniak/tabapp-monorepo/services"
	"github.com/willtrojniak/tabapp-monorepo/services/events"
	"github.com/willtrojniak/tabapp-monorepo/services/notifications"
)

var logLevels = map[string]slog.Level{
	env.DEV:  slog.LevelDebug,
	env.PROD: slog.LevelInfo,
}

func main() {

	jsonHandler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: logLevels[env.EXT_ENVIRONMENT],
	})
	logger := slog.New(services.NewRequestIDHandler(jsonHandler))
	slog.SetDefault(logger)

	env.Load()
	encryptor.SetDefaultEncryptor(encryptor.NewAESEncryptor([]byte(env.Envs.ENCRYPT_SECRET)))

	databaseURL := fmt.Sprintf("postgres://%v:%v@%v:%v/%v?sslmode=disable", env.Envs.POSTGRES_USER, env.Envs.POSTGRES_PASSWORD, env.Envs.POSTGRES_HOST, env.Envs.POSTGRES_PORT, env.Envs.POSTGRES_DB)
	pgConfig, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		fatal("Failed to parse postgres config", "err", err)
	}

	pg, err := db.NewPostgresStorage(context.Background(), pgConfig)
	if err != nil {
		fatal("Failed to connect to postgres", "err", err)
	}

	opts := redis.Options{
		Addr:     env.Envs.REDIS_ADDR,
		Password: "",
		DB:       0,
	}
	redis := redis.NewClient(&opts)

	eventDispatcher := events.NewEventDispatcher()

	notificationsService := notifications.NewNotificationService(eventDispatcher, logger)
	notificationsService.RegisterDriver(notifications.NewMailDriver(
		env.Envs.EMAIL_CLIENT_USER,
		env.Envs.EMAIL_CLIENT_PASSWORD,
		env.Envs.EMAIL_CLIENT_HOST,
		env.Envs.EMAIL_CLIENT_PORT),
		env.Envs.EMAIL_CLIENT_ENABLED)
	notificationsService.RegisterDriver(notifications.NewSlackDriver(), env.Envs.SLACK_CLIENT_ENABLED)

	gob.Register(uuid.UUID{})
	server := api.NewAPIServer(":3000", pg, redis, eventDispatcher, logger)
	if err := server.Run(); err != nil {
		fatal("Server exited", "err", err)
	}

}

func fatal(msg string, args ...any) {
	slog.Error(msg, args...)
	os.Exit(1)
}
