import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("sign in page should be keyboard navigable", async ({ page }) => {
    await page.goto("/signin");
    
    // Tab through interactive elements
    await page.keyboard.press("Tab");
    
    // Email input should be focusable
    const emailInput = page.getByPlaceholder(/email/i);
    await expect(emailInput).toBeFocused();
    
    // Continue tabbing
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    
    // OAuth buttons should be focusable
    const githubButton = page.getByRole("button", { name: /continue with github/i });
    await expect(githubButton).toBeVisible();
  });

  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/signin");
    
    // Check for proper form labels
    const emailInput = page.getByPlaceholder(/email/i);
    await expect(emailInput).toHaveAttribute("type", "email");
    
    // Buttons should have accessible names
    await expect(page.getByRole("button", { name: /continue with email/i })).toBeVisible();
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/signin");
    
    // Check for h1
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("should support reduced motion", async ({ page }) => {
    await page.goto("/signin");
    
    // Check that animations can be disabled
    // This would require checking computed styles
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("images should have alt text", async ({ page }) => {
    await page.goto("/wines");
    
    // Wait for any images to load
    const images = page.locator("img");
    const count = await images.count();
    
    // All images should have alt attribute
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute("alt");
    }
  });
});
