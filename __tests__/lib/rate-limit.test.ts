/**
 * Unit tests for lib/rate-limit.ts
 * Tests: in-memory rate limiter logic (no Upstash configured in tests)
 */
import { NextRequest } from "next/server";
import { checkRateLimit, withRateLimit } from "../../lib/rate-limit";

function makeRequest(ip?: string): NextRequest {
  const url = "http://localhost:3000/api/test";
  const req = new NextRequest(url);
  if (ip) {
    // NextRequest headers are immutable; we create a new request with custom headers
    return new NextRequest(url, {
      headers: { "x-forwarded-for": ip }
    });
  }
  return req;
}

describe("checkRateLimit (in-memory fallback)", () => {
  it("allows the first request from a fresh IP", async () => {
    const req = makeRequest(`test-ip-${Date.now()}-allow`);
    const allowed = await checkRateLimit(req, 5, 60_000);
    expect(allowed).toBe(true);
  });

  it("allows requests up to the configured limit", async () => {
    const ip = `test-ip-${Date.now()}-burst`;
    const limit = 3;
    let lastResult = true;

    for (let i = 0; i < limit; i++) {
      lastResult = await checkRateLimit(makeRequest(ip), limit, 60_000);
    }

    expect(lastResult).toBe(true); // the 3rd request (index 2) should still be allowed
  });

  it("blocks requests after the limit is reached within the window", async () => {
    const ip = `test-ip-${Date.now()}-block`;
    const limit = 2;

    for (let i = 0; i < limit; i++) {
      await checkRateLimit(makeRequest(ip), limit, 60_000);
    }

    const blocked = await checkRateLimit(makeRequest(ip), limit, 60_000);
    expect(blocked).toBe(false);
  });

  it("tracks different IPs independently", async () => {
    const ts = Date.now();
    const ipA = `test-ip-${ts}-a`;
    const ipB = `test-ip-${ts}-b`;
    const limit = 1;

    // Exhaust ipA
    await checkRateLimit(makeRequest(ipA), limit, 60_000);
    await checkRateLimit(makeRequest(ipA), limit, 60_000); // blocked

    // ipB should still be allowed
    const allowedB = await checkRateLimit(makeRequest(ipB), limit, 60_000);
    expect(allowedB).toBe(true);
  });
});

describe("withRateLimit", () => {
  it("returns null when the request is allowed", async () => {
    const ip = `test-ip-${Date.now()}-null`;
    const req = makeRequest(ip);
    const result = await withRateLimit(req, 10, 60_000);
    expect(result).toBeNull();
  });

  it("returns a 429 Response when rate limit is exceeded", async () => {
    const ip = `test-ip-${Date.now()}-429`;
    const limit = 1;

    // Exhaust the limit
    await withRateLimit(makeRequest(ip), limit, 60_000);
    const response = await withRateLimit(makeRequest(ip), limit, 60_000);

    expect(response).not.toBeNull();
    expect(response?.status).toBe(429);
  });

  it("429 response body contains an error message", async () => {
    const ip = `test-ip-${Date.now()}-429-body`;
    const limit = 1;

    await withRateLimit(makeRequest(ip), limit, 60_000);
    const response = await withRateLimit(makeRequest(ip), limit, 60_000);
    const body = await response?.json() as { error: string };
    expect(typeof body.error).toBe("string");
    expect(body.error.length).toBeGreaterThan(0);
  });
});
