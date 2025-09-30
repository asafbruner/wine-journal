import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("sign in page should load quickly", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("should not have console errors on sign in", async ({ page }) => {
    const errors: string[] = [];
    
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    
    await page.goto("/signin");
    await page.waitForLoadState("networkidle");
    
    // Filter out expected errors (like network errors in dev)
    const criticalErrors = errors.filter(
      (error) => !error.includes("favicon") && !error.includes("manifest")
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test("images should be properly optimized", async ({ page }) => {
    await page.goto("/wines");
    
    // Check that Next.js Image component is used
    const images = page.locator("img");
    const count = await images.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      
      // Next.js images should have loading attribute
      const loading = await img.getAttribute("loading");
      expect(loading).toBeTruthy();
    }
  });

  test("should not make unnecessary API calls", async ({ page }) => {
    const apiCalls: string[] = [];
    
    page.on("request", (request) => {
      if (request.url().includes("/api/")) {
        apiCalls.push(request.url());
      }
    });
    
    await page.goto("/signin");
    await page.waitForLoadState("networkidle");
    
    // Sign in page shouldn't make unnecessary API calls
    expect(apiCalls.length).toBeLessThanOrEqual(2);
  });
});
