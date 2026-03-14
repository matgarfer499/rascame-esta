// =============================================================================
// Redis Client - Upstash Redis connection singleton
// =============================================================================

import { Redis } from "@upstash/redis";

/** Singleton Redis client for server-side use only */
function createRedisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // In development without Redis, return a mock-friendly warning
    console.warn(
      "[redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. " +
        "Redis operations will fail. Set these in .env.local.",
    );
    // Still create the client — it will fail on actual calls,
    // which is the correct behavior (loud failure > silent pass)
    return new Redis({ url: url || "https://placeholder", token: token || "placeholder" });
  }

  return new Redis({ url, token });
}

/** Cached client (module-level singleton) */
let _client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!_client) {
    _client = createRedisClient();
  }
  return _client;
}

/** Redis key helpers */
export const REDIS_KEYS = {
  session: (sessionId: string) => `session:${sessionId}`,
  cards: (sessionId: string) => `cards:${sessionId}`,
  secretLookup: (secret: string) => `secret:${secret}`,
} as const;

/** Session TTL: 24 hours (more than enough for a 45 min game) */
export const SESSION_TTL_SECONDS = 60 * 60 * 24;
