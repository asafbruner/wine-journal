import { test, expect } from "@playwright/test";

test.describe("Wines Page (Unauthenticated)", () => {
  test("should redirect to sign in", async ({ page }) => {
    await page.goto("/wines");
    
    // Should redirect to sign in
    await expect(page).toHaveURL(/\/signin/);
  });

  test("should redirect new wine page to sign in", async ({ page }) => {
    await page.goto("/wines/new");
    
    // Should redirect to sign in
    await expect(page).toHaveURL(/\/signin/);
  });
});

// These tests would require authentication
// In a real scenario, you'd use the auth setup file
test.describe.skip("Wines Page (Authenticated)", () => {
  test("should display wines list", async ({ page }) => {
    await page.goto("/wines");
    
    await expect(page.getByRole("heading", { name: /your wines/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /add wine/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /export csv/i })).toBeVisible();
  });

  test("should open filters", async ({ page }) => {
    await page.goto("/wines");
    
    const filtersButton = page.getByRole("button", { name: /filters/i });
    await filtersButton.click();
    
    // Check for filter options
    await expect(page.getByText(/wine type/i)).toBeVisible();
    await expect(page.getByText(/minimum rating/i)).toBeVisible();
  });

  test("should filter by wine type", async ({ page }) => {
    await page.goto("/wines");
    
    // Open filters
    await page.getByRole("button", { name: /filters/i }).click();
    
    // Select RED wine type
    await page.getByRole("button", { name: /^red$/i }).click();
    
    // URL should be updated
    await expect(page).toHaveURL(/type=RED/);
  });

  test("should navigate to add wine page", async ({ page }) => {
    await page.goto("/wines");
    
    await page.getByRole("button", { name: /add wine/i }).click();
    
    await expect(page).toHaveURL(/\/wines\/new/);
  });
});

test.describe("Add Wine Form", () => {
  test.skip("should show form validation", async ({ page }) => {
    await page.goto("/wines/new");
    
    // Try to submit without required fields
    const submitButton = page.getByRole("button", { name: /save wine/i });
    await submitButton.click();
    
    // Should show validation errors
    await expect(page.getByText(/name is required/i)).toBeVisible();
  });

  test.skip("should allow wine creation", async ({ page }) => {
    await page.goto("/wines/new");
    
    // Fill in wine details
    await page.getByLabel(/name/i).fill("Test Wine");
    await page.getByLabel(/producer/i).fill("Test Producer");
    await page.getByLabel(/country/i).fill("France");
    await page.getByLabel(/type/i).selectOption("RED");
    
    // Submit form
    await page.getByRole("button", { name: /save wine/i }).click();
    
    // Should redirect to wines list
    await expect(page).toHaveURL(/\/wines$/);
    
    // Should show the new wine
    await expect(page.getByText(/test wine/i)).toBeVisible();
  });
});
