package cache

import (
	"context"
	"time"
)

type cacheData struct {
	data []byte
	exp  time.Time
}

type MemoryCache struct {
	data map[string]cacheData
}

func NewMemoryCache() *MemoryCache {
	return &MemoryCache{
		data: make(map[string]cacheData),
	}
}

func (c *MemoryCache) Set(
	_ context.Context,
	key string,
	value []byte,
	ttl time.Duration) error {
	c.data[key] = cacheData{
		data: value,
		exp:  time.Now().Add(ttl),
	}

	return nil
}

func (c *MemoryCache) Get(
	_ context.Context,
	key string) ([]byte, error) {
	if data, ok := c.data[key]; ok {
		if data.exp.After(time.Now()) {
			return data.data, nil
		}

		delete(c.data, key)
	}
	return nil, ErrNotFound
}

func (c *MemoryCache) Delete(
	_ context.Context,
	keys ...string) error {
	for i := range keys {
		delete(c.data, keys[i])
	}

	return nil
}
