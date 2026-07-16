/**
 * Unit tests for lib/billing.ts (pure / non-DB helpers)
 * Tests: planConfig structure, getUsagePeriodKey
 * DB-dependent functions (getPlanSnapshot, incrementUsage, etc.) are integration-level
 * and are NOT tested here to avoid requiring a live database in unit tests.
 */
import { planConfig, getUsagePeriodKey } from "../../lib/billing";

describe("planConfig", () => {
  it("defines FREE and PRO plans", () => {
    expect(planConfig.FREE).toBeDefined();
    expect(planConfig.PRO).toBeDefined();
  });

  it("FREE plan has courseLimit of 3", () => {
    expect(planConfig.FREE.courseLimit).toBe(3);
  });

  it("FREE plan has aiLimit of 50", () => {
    expect(planConfig.FREE.aiLimit).toBe(50);
  });

  it("FREE plan includes watermark", () => {
    expect(planConfig.FREE.watermark).toBe(true);
  });

  it("FREE plan does not include premium templates", () => {
    expect(planConfig.FREE.premiumTemplates).toBe(false);
  });

  it("FREE plan only supports pdf and markdown exports", () => {
    expect(planConfig.FREE.exportFormats).toContain("pdf");
    expect(planConfig.FREE.exportFormats).toContain("markdown");
    expect(planConfig.FREE.exportFormats).toHaveLength(2);
  });

  it("PRO plan has unlimited courseLimit", () => {
    expect(planConfig.PRO.courseLimit).toBe(Number.POSITIVE_INFINITY);
  });

  it("PRO plan has unlimited aiLimit", () => {
    expect(planConfig.PRO.aiLimit).toBe(Number.POSITIVE_INFINITY);
  });

  it("PRO plan does not include watermark", () => {
    expect(planConfig.PRO.watermark).toBe(false);
  });

  it("PRO plan includes premium templates", () => {
    expect(planConfig.PRO.premiumTemplates).toBe(true);
  });

  it("PRO plan supports all 7 export formats", () => {
    const expected = ["pdf", "docx", "markdown", "html", "json", "csv", "pptx"];
    for (const format of expected) {
      expect(planConfig.PRO.exportFormats).toContain(format);
    }
    expect(planConfig.PRO.exportFormats).toHaveLength(7);
  });
});

describe("getUsagePeriodKey", () => {
  it("returns a string in YYYY-MM format", () => {
    const key = getUsagePeriodKey(new Date("2024-03-15T12:00:00Z"));
    expect(key).toMatch(/^\d{4}-\d{2}$/);
    expect(key).toBe("2024-03");
  });

  it("zero-pads single-digit months", () => {
    const key = getUsagePeriodKey(new Date("2024-01-01T00:00:00Z"));
    expect(key).toBe("2024-01");
  });

  it("returns the current month when called with no argument", () => {
    const now = new Date();
    const expected = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    expect(getUsagePeriodKey()).toBe(expected);
  });

  it("uses UTC month boundaries, not local time", () => {
    // Dec 31 23:30 in UTC+1 is Jan 1 00:30 UTC next year
    const key = getUsagePeriodKey(new Date("2024-12-31T23:30:00Z"));
    expect(key).toBe("2024-12");
  });
});
