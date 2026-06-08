package models

import (
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/willtrojniak/tabapp-monorepo/internal/encryptor"
)

type SecureString string

func (t SecureString) String() string {
	return string(t)
}

func (t *SecureString) ScanText(v pgtype.Text) error {
	if !v.Valid {
		*t = ""
		return nil
	}

	token, err := encryptor.Decrypt(v.String)
	if err != nil {
		return err
	}

	*t = SecureString(string(token))

	return nil
}

func (t SecureString) TextValue() (pgtype.Text, error) {
	v := pgtype.Text{}
	cipher, err := encryptor.Encrypt([]byte(t))
	if err != nil {
		return v, err
	}
	v.String = cipher
	v.Valid = true

	return v, nil
}
