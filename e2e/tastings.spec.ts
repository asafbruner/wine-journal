import { test, expect } from "@playwright/test";

test.describe("Tastings (Unauthenticated)", () => {
  test("should redirect to sign in", async ({ page }) => {
    await page.goto("/tastings");
    
    // Should redirect to sign in
    await expect(page).toHaveURL(/\/signin/);
  });

  test("should redirect new tasting page to sign in", async ({ page }) => {
    await page.goto("/tastings/new");
    
    // Should redirect to sign in
    await expect(page).toHaveURL(/\/signin/);
  });
});

test.describe.skip("Tastings (Authenticated)", () => {
  test("should display tastings list", async ({ page }) => {
    await page.goto("/tastings");
    
    await expect(page.getByRole("heading", { name: /your tastings/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /new tasting/i })).toBeVisible();
  });

  test("should show empty state when no tastings", async ({ page }) => {
    await page.goto("/tastings");
    
    // Assuming no tastings exist
    await expect(page.getByText(/no tasting/i)).toBeVisible();
  });

  test("should navigate to new tasting page", async ({ page }) => {
    await page.goto("/tastings");
    
    await page.getByRole("button", { name: /new tasting/i }).click();
    
    await expect(page).toHaveURL(/\/tastings\/new/);
  });
});

test.describe.skip("Add Tasting Form (Authenticated)", () => {
  test("should show form validation", async ({ page }) => {
    await page.goto("/tastings/new");
    
    // Try to submit without required fields
    const submitButton = page.getByRole("button", { name: /save tasting/i });
    await submitButton.click();
    
    // Should show validation errors
    await expect(page.getByText(/select a wine/i)).toBeVisible();
  });

  test("should allow tasting note creation", async ({ page }) => {
    await page.goto("/tastings/new");
    
    // Select a wine (assuming at least one exists)
    await page.getByLabel(/wine/i).click();
    await page.getByRole("option").first().click();
    
    // Fill in tasting notes
    await page.getByLabel(/appearance/i).fill("Deep ruby red");
    await page.getByLabel(/nose/i).fill("Black fruits, oak");
    await page.getByLabel(/palate/i).fill("Full-bodied, tannic");
    await page.getByLabel(/conclusion/i).fill("Excellent wine");
    
    // Submit form
    await page.getByRole("button", { name: /save tasting/i }).click();
    
    // Should redirect to tastings list
    await expect(page).toHaveURL(/\/tastings$/);
  });
});
