// ─── Redis singleton (ioredis) ────────────────────────────────────────────────
// Used for:
//   • Rate limiting API routes (login, register, webhook)
//   • Caching hot reads (workspace summary) to reduce DB pressure
//
// NOTE: ioredis runs in the Node.js runtime only (not Edge).
// Middleware uses jose for JWT — Redis rate limiting lives in Route Handlers.

import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck:     false,
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// ── Rate limit helper ─────────────────────────────────────────────────────────
// Sliding window: returns true if the request is within the allowed rate.
export async function checkRateLimit(
  key:      string,
  limit:    number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const now     = Date.now();
  const window  = Math.floor(now / windowMs);
  const redisKey = `rl:${key}:${window}`;

  const count = await redis.incr(redisKey);
  if (count === 1) await redis.pexpire(redisKey, windowMs);

  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}
