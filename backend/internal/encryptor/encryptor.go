package encryptor

type Encryptor interface {
	Encrypt(plaintext []byte) (string, error)
	Decrypt(ciphertext string) ([]byte, error)
}

var defaultEncryptor Encryptor = &NOPEncryptor{}

// Panics if e == nil
func SetDefaultEncryptor(e Encryptor) {
	if e == nil {
		panic("Attempted to set nil default encryptor")
	}
	defaultEncryptor = e
}

type NOPEncryptor struct{}

func (*NOPEncryptor) Encrypt(plaintext []byte) (string, error) {
	return string(plaintext), nil
}

func (*NOPEncryptor) Decrypt(ciphertext string) ([]byte, error) {
	return []byte(ciphertext), nil
}

func Encrypt(plaintext []byte) (string, error) {
	return defaultEncryptor.Encrypt(plaintext)
}

func Decrypt(ciphertext string) ([]byte, error) {
	return defaultEncryptor.Decrypt(ciphertext)
}
