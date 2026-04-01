package util

import (
	"crypto/rand"
	"encoding/base64"
	"io"
)

// Generate a string of size nBytes
//
// If an EOF happens after reading some but not all the bytes,
// returns [rand.ErrUnexpectedEOF].
func RandString(nByte int) (string, error) {
	b := make([]byte, nByte)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
