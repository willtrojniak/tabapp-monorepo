package main

import (
	"fmt"
	"log/slog"
	"os"
	"strconv"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/willtrojniak/tabapp-monorepo/env"
	"github.com/willtrojniak/tabapp-monorepo/internal/encryptor"
)

func main() {

	env.Load()
	databaseURL := fmt.Sprintf("postgres://%v:%v@%v:%v/%v?sslmode=disable", env.Envs.POSTGRES_USER, env.Envs.POSTGRES_PASSWORD, env.Envs.POSTGRES_HOST, env.Envs.POSTGRES_PORT, env.Envs.POSTGRES_DB)
	migrationsPath := "file:///migrations"

	encryptor.SetDefaultEncryptor(encryptor.NewAESEncryptor([]byte(env.Envs.ENCRYPT_SECRET)))

	m, err := migrate.New(migrationsPath, databaseURL)
	if err != nil {
		fatal("Failed to initialize migrations", "err", err)
	}

	if len(os.Args) != 2 {
		fatal("Expects either 'up', 'down', 'drop', or a step count as the only argument")
	}

	cmd := os.Args[1]
	switch cmd {
	case "up":
		if err := m.Up(); err != nil {
			fatal("Migration failed", "command", cmd, "err", err)
		}
		return
	case "down":
		if err := m.Down(); err != nil {
			fatal("Migration failed", "command", cmd, "err", err)
		}
		return
	case "drop":
		if err := m.Drop(); err != nil {
			fatal("Migration failed", "command", cmd, "err", err)
		}
		return
	}

	if val, err := strconv.Atoi(cmd); err == nil {
		if err := m.Steps(val); err != nil {
			fatal("Migration failed", "command", cmd, "err", err)
		}
		return
	}

	fatal("Unknown migration command", "command", cmd)
}

func fatal(msg string, args ...any) {
	slog.Error(msg, args...)
	os.Exit(1)
}
