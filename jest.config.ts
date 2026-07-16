import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleNameMapper: {
    // Next.js / server-only stubs
    "^server-only$": "<rootDir>/__tests__/__mocks__/server-only.ts",
    // Alias for @/ if used anywhere
    "^@/(.*)$": "<rootDir>/$1"
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "./tsconfig.test.json" }]
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "lib/**/*.ts",
    "!lib/prisma.ts",
    "!lib/ai.ts",
    "!lib/**/*.d.ts"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"]
};

export default config;
