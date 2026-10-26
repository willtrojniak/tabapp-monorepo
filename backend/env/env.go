package env

import (
	"log/slog"
	"os"
	"path/filepath"
	"reflect"

	"github.com/joho/godotenv"
)

type config struct {
	BASE_URI                    string
	UI_URI                      string
	ENCRYPT_SECRET              string
	OAUTH2_GOOGLE_CLIENT_ID     string
	OAUTH2_GOOGLE_CLIENT_SECRET string
	OAUTH2_SLACK_CLIENT_ID      string
	OAUTH2_SLACK_CLIENT_SECRET  string
	POSTGRES_USER               string
	POSTGRES_PASSWORD           string
	POSTGRES_HOST               string
	POSTGRES_PORT               string
	POSTGRES_DB                 string
	REDIS_ADDR                  string
	EMAIL_CLIENT_HOST           string
	EMAIL_CLIENT_PORT           string
	EMAIL_CLIENT_USER           string
	EMAIL_CLIENT_PASSWORD       string
	EMAIL_CLIENT_ENABLED        bool
	SLACK_CLIENT_ENABLED        bool
}

var Envs config

const (
	DEV  string = "dev"
	PROD        = "prod"
)

var EXT_ENVIRONMENT string = DEV

func Load() {
	Envs = getConfig()
}

func getConfig() config {
	envDir := os.Getenv("ENV_DIR")

	if err := godotenv.Load(filepath.Join(envDir, "base.env")); err != nil {
		fatal("Failed to load base env file", "err", err)
	}

	if err := godotenv.Load(filepath.Join(envDir, EXT_ENVIRONMENT+".env")); err == nil {
		slog.Info("Loaded environment", "environment", EXT_ENVIRONMENT)
	}

	configData := config{}
	configStruct := reflect.ValueOf(&configData).Elem()
	types := configStruct.Type()

	for i := range configStruct.NumField() {
		key := types.Field(i).Name
		switch configStruct.Field(i).Type().Kind() {
		case reflect.String:
			configStruct.Field(i).SetString(getEnvStringOrFail(key))
		case reflect.Bool:
			configStruct.Field(i).SetBool(getEnvBoolOrFail(key))
		default:
			fatal("Unknown config field type", "key", key)
		}
	}

	return configData
}

func getEnvStringOrFail(key string) string {
	val, exists := os.LookupEnv(key)
	if !exists {
		fatal("Environment variable not set", "key", key)
	}
	return val
}

func getEnvBoolOrFail(key string) bool {
	str := getEnvStringOrFail(key)
	switch str {
	case "true":
		return true
	case "false":
		return false
	default:
		fatal("Invalid bool value for environment variable", "key", key, "value", str)
	}
	return false
}

func fatal(msg string, args ...any) {
	slog.Error(msg, args...)
	os.Exit(1)
}
