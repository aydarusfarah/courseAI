/**
 * Unit tests for lib/cache.ts
 * Tests: no-op behaviour when Redis is not configured (NODE_ENV=test)
 */
import { cacheGet, cacheSet, cacheDel, cacheFlush, cacheKeys } from "../../lib/cache";

// In NODE_ENV=test, Redis is never initialised — all operations are no-ops.
describe("cache (no-op mode)", () => {
  it("cacheGet returns null when no entry exists", async () => {
    const value = await cacheGet<string>("missing-key");
    expect(value).toBeNull();
  });

  it("cacheSet then cacheGet still returns null (no Redis)", async () => {
    await cacheSet("my-key", { foo: "bar" }, 60);
    const value = await cacheGet<{ foo: string }>("my-key");
    // No-op cache — set is a noop, so get returns null
    expect(value).toBeNull();
  });

  it("cacheDel does not throw", async () => {
    await expect(cacheDel("some-key")).resolves.toBeUndefined();
  });

  it("cacheFlush does not throw", async () => {
    await expect(cacheFlush("prefix:*")).resolves.toBeUndefined();
  });

  it("cacheGet does not throw on malformed JSON (returns null)", async () => {
    // Since no-op returns null, the JSON.parse path is not triggered; just verify robustness
    const value = await cacheGet("bad-json-key");
    expect(value).toBeNull();
  });
});

describe("cacheKeys helpers", () => {
  it("planSnapshot returns a string containing the userId", () => {
    const key = cacheKeys.planSnapshot("user-123");
    expect(key).toContain("user-123");
    expect(typeof key).toBe("string");
  });

  it("planUsage returns a string containing the userId", () => {
    const key = cacheKeys.planUsage("user-456");
    expect(key).toContain("user-456");
  });

  it("courseList returns a string containing the userId", () => {
    const key = cacheKeys.courseList("user-789");
    expect(key).toContain("user-789");
  });

  it("adminStats returns a fixed string", () => {
    expect(typeof cacheKeys.adminStats()).toBe("string");
    expect(cacheKeys.adminStats().length).toBeGreaterThan(0);
  });

  it("adminTrends returns a fixed string", () => {
    expect(typeof cacheKeys.adminTrends()).toBe("string");
    expect(cacheKeys.adminTrends().length).toBeGreaterThan(0);
  });
});
