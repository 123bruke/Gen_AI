"""
Redis Cache Layer for VisionRAG
Provides sub-millisecond retrieval caching with automatic in-memory fallback.
"""

from typing import Optional, Any
import json
import time

class RedisCacheManager:
    """High-speed query and embedding cache."""

    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0):
        self.host = host
        self.port = port
        self.db = db
        self._redis = None
        self._memory_cache = {}
        self._init_redis()

    def _init_redis(self):
        import socket
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(0.05)
                if s.connect_ex((self.host, self.port)) == 0:
                    import redis
                    client = redis.Redis(host=self.host, port=self.port, db=self.db, socket_timeout=0.5)
                    client.ping()
                    self._redis = client
                    return
        except Exception:
            pass
        self._redis = None

    def get(self, key: str) -> Optional[Any]:
        """Retrieve value from cache."""
        if self._redis is not None:
            try:
                data = self._redis.get(key)
                if data:
                    return json.loads(data.decode("utf-8"))
            except Exception:
                pass

        # In-memory fallback check
        item = self._memory_cache.get(key)
        if item:
            val, expiry = item
            if expiry is None or time.time() < expiry:
                return val
            else:
                del self._memory_cache[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = 3600) -> bool:
        """Store value in cache with expiration TTL."""
        if self._redis is not None:
            try:
                serialized = json.dumps(value)
                self._redis.setex(key, ttl_seconds, serialized)
                return True
            except Exception:
                pass

        # In-memory fallback
        expiry = time.time() + ttl_seconds if ttl_seconds else None
        self._memory_cache[key] = (value, expiry)
        return True

    def exists(self, key: str) -> bool:
        return self.get(key) is not None

    def is_healthy(self) -> bool:
        """Returns True if connected to live Redis server."""
        return self._redis is not None

cache_manager = RedisCacheManager()
redis_cache = cache_manager
