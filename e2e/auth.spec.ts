import { test, expect } from "@playwright/test";

/**
 * E2E smoke test: Authentication redirect behaviour
 * Verifies that protected routes redirect unauthenticated users.
 */
test.describe("Auth redirects (unauthenticated)", () => {
  test("accessing /dashboard redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    // After Clerk middleware, unauthenticated users should end up at the sign-in page
    // The final URL should contain either /sign-in or /auth/sign-in
    await expect(page).toHaveURL(/sign-in/i);
  });

  test("accessing /generator redirects to sign-in", async ({ page }) => {
    await page.goto("/generator");
    await expect(page).toHaveURL(/sign-in/i);
  });

  test("accessing /courses redirects to sign-in", async ({ page }) => {
    await page.goto("/courses");
    await expect(page).toHaveURL(/sign-in/i);
  });

  test("accessing /billing redirects to sign-in", async ({ page }) => {
    await page.goto("/billing");
    await expect(page).toHaveURL(/sign-in/i);
  });
});
