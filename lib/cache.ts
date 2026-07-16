/**
 * lib/cache.ts — Redis-backed cache with automatic no-op fallback.
 */

import { logger } from "./logger";

type CacheClient = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(pattern: string): Promise<void>;
};

const noopCache: CacheClient = {
  get: async () => null,
  set: async () => undefined,
  del: async () => undefined,
  flush: async () => undefined
};

let _cache: CacheClient = noopCache;
let _initialized = false;

async function buildRedisClient(): Promise<CacheClient> {
  const url = process.env.REDIS_URL;
  if (!url) return noopCache;

  try {
    const { default: Redis } = await import("ioredis");
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true
    });
    await client.connect();
    logger.info("Redis cache connected");

    return {
      get: (key) => client.get(key),
      set: async (key, value, ttl) => { await client.set(key, value, "EX", ttl); },
      del: async (key) => { await client.del(key); },
      flush: async (pattern) => {
        const keys = await client.keys(pattern);
        if (keys.length > 0) await client.del(...keys);
      }
    };
  } catch (err) {
    logger.warn("Redis unavailable — cache disabled", {
      error: err instanceof Error ? err.message : String(err)
    });
    return noopCache;
  }
}

function getCache(): CacheClient {
  if (!_initialized && process.env.REDIS_URL && process.env.NODE_ENV !== "test") {
    _initialized = true;
    buildRedisClient().then((c) => { _cache = c; }).catch(() => undefined);
  }
  return _cache;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await getCache().get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  try {
    await getCache().set(key, JSON.stringify(value), ttlSeconds);
  } catch {
    // Never block the main flow on cache write errors
  }
}

export async function cacheDel(key: string): Promise<void> {
  try { await getCache().del(key); } catch { /* swallow */ }
}

export async function cacheFlush(pattern: string): Promise<void> {
  try { await getCache().flush(pattern); } catch { /* swallow */ }
}

export const cacheKeys = {
  planSnapshot:  (uid: string) => `plan:snapshot:${uid}`,
  planUsage:     (uid: string) => `plan:usage:${uid}`,
  courseList:    (uid: string) => `courses:list:${uid}`,
  adminStats:    ()            => "admin:stats",
  adminTrends:   ()            => "admin:trends"
};
