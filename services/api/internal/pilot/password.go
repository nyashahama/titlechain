package pilot

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"strings"
)

const devHashPrefix = "phase4-dev-sha256:"

func hashPasswordForDev(password string) string {
	sum := sha256.Sum256([]byte(password))
	return devHashPrefix + hex.EncodeToString(sum[:])
}

func verifyPassword(password, storedHash string) bool {
	if !strings.HasPrefix(storedHash, devHashPrefix) {
		return false
	}
	expected := hashPasswordForDev(password)
	return subtle.ConstantTimeCompare([]byte(expected), []byte(storedHash)) == 1
}
