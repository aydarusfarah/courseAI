import { test, expect } from "@playwright/test";

/**
 * E2E smoke test: Public homepage
 * Verifies the landing page loads and key content is visible.
 */
test.describe("Homepage", () => {
  test("loads the homepage successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CourseAI/i);
  });

  test("displays the hero headline", async ({ page }) => {
    await page.goto("/");
    // The public homepage has a headline about building courses with AI
    await expect(page.locator("h1")).toContainText(/course/i);
  });

  test("has a link to the dashboard", async ({ page }) => {
    await page.goto("/");
    const dashboardLink = page.getByRole("link", { name: /open dashboard/i });
    await expect(dashboardLink).toBeVisible();
  });

  test("has a sign-in link", async ({ page }) => {
    await page.goto("/");
    const signInLink = page.getByRole("link", { name: /sign in/i });
    await expect(signInLink).toBeVisible();
  });
});
