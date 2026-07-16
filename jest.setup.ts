// jest.setup.ts — global test setup
// NODE_ENV is already "test" in Jest (set via --testEnvironment)
// We cast to bypass the TypeScript readonly annotation for test configuration
(process.env as Record<string, string>)["NODE_ENV"] = "test";
