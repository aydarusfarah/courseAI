/**
 * Unit tests for lib/logger.ts
 * Tests: structured output format and level routing
 */
import { logger } from "../../lib/logger";

describe("logger", () => {
  let stdoutSpy: jest.SpyInstance;
  let consoleSpy: { log: jest.SpyInstance; warn: jest.SpyInstance; error: jest.SpyInstance };

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    consoleSpy = {
      log: jest.spyOn(console, "log").mockImplementation(() => undefined),
      warn: jest.spyOn(console, "warn").mockImplementation(() => undefined),
      error: jest.spyOn(console, "error").mockImplementation(() => undefined)
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("in test / development environment", () => {
    it("routes info to console.log", () => {
      logger.info("hello info");
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("hello info"), expect.anything());
    });

    it("routes warn to console.warn", () => {
      logger.warn("hello warn");
      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining("hello warn"), expect.anything());
    });

    it("routes error to console.error", () => {
      logger.error("hello error");
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining("hello error"), expect.anything());
    });

    it("routes debug to console.log", () => {
      logger.debug("hello debug");
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("hello debug"), expect.anything());
    });

    it("includes metadata in the output", () => {
      logger.info("message with meta", { key: "value" });
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ key: "value" }));
    });
  });

  describe("in production environment", () => {
    beforeEach(() => {
      (process.env as Record<string, string>)["NODE_ENV"] = "production";
    });

    afterEach(() => {
      (process.env as Record<string, string>)["NODE_ENV"] = "test";
    });

    it("writes JSON to stdout", () => {
      logger.info("production log");
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('"production log"'));
    });

    it("includes level in the JSON output", () => {
      logger.warn("prod warn");
      const call = (stdoutSpy.mock.calls[0] as [string])[0];
      const parsed = JSON.parse(call) as Record<string, unknown>;
      expect(parsed.level).toBe("warn");
    });

    it("includes a timestamp in the JSON output", () => {
      logger.error("prod error");
      const call = (stdoutSpy.mock.calls[0] as [string])[0];
      const parsed = JSON.parse(call) as Record<string, unknown>;
      expect(typeof parsed.timestamp).toBe("string");
    });
  });
});
