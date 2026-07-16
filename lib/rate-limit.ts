/**
 * lib/rate-limit.ts
 * IP-based rate limiting using @upstash/ratelimit when UPSTASH env vars are set,
 * with an in-memory fallback (LRU window) for development / non-Upstash deployments.
 */

import { NextRequest } from "next/server";

// ── In-memory fallback ──────────────────────────────────────────────────────
const ipWindows = new Map<string, { count: number; resetAt: number }>();

function inMemoryCheck(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = ipWindows.get(ip);

  if (!entry || now > entry.resetAt) {
    ipWindows.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }
  if (entry.count >= limit) return false; // blocked

  entry.count += 1;
  return true;
}

// ── Upstash-backed (production) ─────────────────────────────────────────────
let upstashRatelimit: null | {
  limit: (id: string) => Promise<{ success: boolean; remaining: number; reset: number }>;
} = null;

async function getUpstashLimiter() {
  if (upstashRatelimit) return upstashRatelimit;
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!restUrl || !restToken) return null;

  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url: restUrl, token: restToken });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: false
    });
    return upstashRatelimit;
  } catch {
    return null;
  }
}

// ── Public API ───────────────────────────────────────────────────────────────
/**
 * Returns true if the request is allowed, false if rate-limited.
 * Uses Upstash in production when configured, otherwise falls back to in-memory.
 */
export async function checkRateLimit(req: NextRequest, limit = 60, windowMs = 60_000): Promise<boolean> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  const upstash = await getUpstashLimiter();
  if (upstash) {
    const { success } = await upstash.limit(ip);
    return success;
  }

  return inMemoryCheck(ip, limit, windowMs);
}

/**
 * Convenience wrapper: returns a 429 Response if rate-limited, null if allowed.
 */
export async function withRateLimit(
  req: NextRequest,
  limit = 60,
  windowMs = 60_000
): Promise<Response | null> {
  const allowed = await checkRateLimit(req, limit, windowMs);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "60" }
    });
  }
  return null;
}
