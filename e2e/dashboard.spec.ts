import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("should redirect to sign in when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Should redirect to sign in page
    await expect(page).toHaveURL(/\/signin/);
  });

  test("should show sign in page elements", async ({ page }) => {
    await page.goto("/signin");
    
    // Check for sign in form elements
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /continue with email/i })).toBeVisible();
  });

  test("should show OAuth providers", async ({ page }) => {
    await page.goto("/signin");
    
    // Check for OAuth buttons
    await expect(page.getByRole("button", { name: /continue with github/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  });

  test("should validate email input", async ({ page }) => {
    await page.goto("/signin");
    
    const emailInput = page.getByPlaceholder(/email/i);
    const submitButton = page.getByRole("button", { name: /continue with email/i });
    
    // Try to submit with invalid email
    await emailInput.fill("invalid-email");
    await submitButton.click();
    
    // Should show validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });
});

test.describe("Landing page", () => {
  test("should redirect to dashboard", async ({ page }) => {
    await page.goto("/");
    
    // Should redirect to dashboard (which then redirects to signin)
    await expect(page).toHaveURL(/\/(dashboard|signin)/);
  });

  test("should have proper page title", async ({ page }) => {
    await page.goto("/");
    
    await expect(page).toHaveTitle(/wine journal/i);
  });
});
