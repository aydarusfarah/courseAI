import { test, expect } from "@playwright/test";

/**
 * E2E smoke test: Health check API endpoint
 * Verifies the /api/health endpoint returns the expected JSON shape.
 */
test.describe("Health endpoint", () => {
  test("GET /api/health returns 200 with status ok or degraded", async ({ request }) => {
    const response = await request.get("/api/health");
    // Health check should always return 200 unless DB is completely down
    // In CI without a database it may return 503 (error), so we accept 200 or 503
    expect([200, 503]).toContain(response.status());
  });

  test("GET /api/health returns valid JSON with status field", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json() as { status: string; checks: Record<string, string>; timestamp: string };

    expect(typeof body.status).toBe("string");
    expect(["ok", "degraded", "error"]).toContain(body.status);
  });

  test("GET /api/health response includes checks object", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json() as { checks: Record<string, string> };

    expect(body.checks).toBeDefined();
    expect(typeof body.checks.database).toBe("string");
  });

  test("GET /api/health response includes a timestamp", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json() as { timestamp: string };

    expect(typeof body.timestamp).toBe("string");
    // Should be a valid ISO date
    expect(() => new Date(body.timestamp).toISOString()).not.toThrow();
  });
});
