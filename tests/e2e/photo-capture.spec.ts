import { test, expect } from '@playwright/test';

test.describe('Photo Capture Functionality', () => {
test.beforeEach(async ({ page }) => {
  // Initialize DB and ensure clean state
  await page.goto('/api/init-db');
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // Sign up a fresh user to access the app
  const timestamp = Date.now();
  const testEmail = `phototest${timestamp}@example.com`;

  await page.click('text=Sign up');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[placeholder="Enter your name"]', 'Photo Test User');
  await page.fill('input[placeholder="Enter your password"]', 'password123');
  await page.fill('input[placeholder="Confirm your password"]', 'password123');
  await page.click('button[type="submit"]');

  // Verify we are on the main app page
  await expect(page).toHaveURL(/\/(?!login|signup)/);
  await expect(page.locator('h1')).toContainText('Wine Journal');
});

  test('should show photo capture buttons in wine form', async ({ page }) => {
    // Click Add New Wine button
    await page.click('button:has-text("Add New Wine")');
    
    // Verify we're on the form page
    await expect(page.locator('h2:has-text("Add New Wine")')).toBeVisible();
    
    // Check that photo capture section is visible
    await expect(page.locator('text=Wine Bottle Photo')).toBeVisible();
    
    // Check that Take Photo button is visible
    await expect(page.locator('button:has-text("📷 Take Photo")')).toBeVisible();
    
    // Check that Upload Photo button is visible
    await expect(page.locator('button:has-text("📁 Upload Photo")')).toBeVisible();
  });

  test('should open camera interface when clicking Take Photo', async ({ page, context, browserName }) => {
    // Grant camera permissions where supported (skip on WebKit)
    if (browserName !== 'webkit') {
      await context.grantPermissions(['camera']);
    }
    
    // Click Add New Wine button
    await page.click('button:has-text("Add New Wine")');
    
    // Click Take Photo button
    await page.click('button:has-text("📷 Take Photo")');
    
    // Wait for camera interface to appear
    await expect(page.locator('text=Take Wine Photo')).toBeVisible({ timeout: 10000 });
    
    // Check that the full-screen overlay is present
    await expect(page.locator('.fixed.inset-0.z-50.bg-black')).toBeVisible();
    
    // Check that cancel button (X) is visible in header
    await expect(page.locator('button:has-text("✕")')).toBeVisible();
    
    // Check that capture button is visible
    await expect(page.locator('button:has-text("📸 Capture")')).toBeVisible();
    
    // Check that cancel button is visible at bottom
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    
    // Should show either instructions, error, or loading
    await page.waitForTimeout(200);
    const hasInstructions = await page.locator('text=Position the wine bottle within the frame').isVisible();
    const hasError = await page.locator('text=Camera Error').isVisible();
    const hasLoading = await page.locator('text=Loading camera...').isVisible();
    expect(hasInstructions || hasError || hasLoading).toBe(true);
  });

  test('should close camera interface when clicking cancel', async ({ page, context, browserName }) => {
    // Grant camera permissions where supported (skip on WebKit)
    if (browserName !== 'webkit') {
      await context.grantPermissions(['camera']);
    }
    
    // Click Add New Wine button
    await page.click('button:has-text("Add New Wine")');
    
    // Click Take Photo button
    await page.click('button:has-text("📷 Take Photo")');
    
    // Wait for camera interface to appear
    await expect(page.locator('text=Take Wine Photo')).toBeVisible({ timeout: 10000 });
    
    // Click cancel button
    await page.click('button:has-text("Cancel")');
    
    // Verify camera interface is closed
    await expect(page.locator('text=Take Wine Photo')).not.toBeVisible();
    
    // Verify we're back to the form
    await expect(page.locator('h2:has-text("Add New Wine")')).toBeVisible();
    await expect(page.locator('button:has-text("📷 Take Photo")')).toBeVisible();
  });

  test('should close camera interface when clicking X button', async ({ page, context, browserName }) => {
    // Grant camera permissions where supported (skip on WebKit)
    if (browserName !== 'webkit') {
      await context.grantPermissions(['camera']);
    }
    
    // Click Add New Wine button
    await page.click('button:has-text("Add New Wine")');
    
    // Click Take Photo button
    await page.click('button:has-text("📷 Take Photo")');
    
    // Wait for camera interface to appear
    await expect(page.locator('text=Take Wine Photo')).toBeVisible({ timeout: 10000 });
    
    // Click X button in header
    await page.click('button:has-text("✕")');
    
    // Verify camera interface is closed
    await expect(page.locator('text=Take Wine Photo')).not.toBeVisible();
    
    // Verify we're back to the form
    await expect(page.locator('h2:has-text("Add New Wine")')).toBeVisible();
  });

  test('should handle file upload functionality', async ({ page }) => {
    // Click Add New Wine button
    await page.click('button:has-text("Add New Wine")');
    
    // Create a test image file
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    // Set up file chooser handler
    const fileChooserPromise = page.waitForEvent('filechooser');
    
    // Click Upload Photo button
    await page.click('button:has-text("📁 Upload Photo")');
    
    // Handle file chooser
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([{
      name: 'test-wine.png',
      mimeType: 'image/png',
      buffer: testImageBuffer
    }]);
    
    // Verify that photo was uploaded (should show image and remove button)
    await expect(page.locator('img[alt="Wine bottle"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("×")')).toBeVisible(); // Remove photo button
  });

  test('should show retake and upload different buttons after photo is taken', async ({ page }) => {
    // Click Add New Wine button
    await page.click('button:has-text("Add New Wine")');
    
    // Upload a test image first
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("📁 Upload Photo")');
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([{
      name: 'test-wine.png',
      mimeType: 'image/png',
      buffer: testImageBuffer
    }]);
    
    // Wait for photo to be uploaded
    await expect(page.locator('img[alt="Wine bottle"]')).toBeVisible({ timeout: 5000 });
    
    // Verify that buttons changed to retake/upload different
    await expect(page.locator('button:has-text("📷 Retake Photo")')).toBeVisible();
    await expect(page.locator('button:has-text("📁 Upload Different")')).toBeVisible();
    
    // Verify original buttons are not visible
    await expect(page.locator('button:has-text("📷 Take Photo")')).not.toBeVisible();
    await expect(page.locator('button:has-text("📁 Upload Photo")')).not.toBeVisible();
  });

  test('should remove photo when clicking remove button', async ({ page }) => {
    // Click Add New Wine button
    await page.click('button:has-text("Add New Wine")');
    
    // Upload a test image
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("📁 Upload Photo")');
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([{
      name: 'test-wine.png',
      mimeType: 'image/png',
      buffer: testImageBuffer
    }]);
    
    // Wait for photo to be uploaded
    await expect(page.locator('img[alt="Wine bottle"]')).toBeVisible({ timeout: 5000 });
    
    // Find and click the remove button (look for × or Remove text)
    const removeButton = page.locator('button').filter({ hasText: /×|Remove/ }).first();
    await removeButton.click();
    
    // Wait a moment for the removal to complete
    await page.waitForTimeout(500);
    
    // Verify photo is removed
    await expect(page.locator('img[alt="Wine bottle"]')).not.toBeVisible();
    
    // Verify at least one of the original buttons is back
    const takePhotoBtn = page.locator('button:has-text("📷 Take Photo")');
    const uploadPhotoBtn = page.locator('button:has-text("Upload Photo")');
    
    await expect(takePhotoBtn.or(uploadPhotoBtn)).toBeVisible({ timeout: 5000 });
  });

  test('should save wine with photo and display it in wine list', async ({ page }) => {
    // Click Add New Wine button
    await page.click('button:has-text("Add New Wine")');
    
    // Fill in wine details
    await page.fill('input[placeholder*="Château Margaux"]', 'Test Wine with Photo');
    await page.fill('input[placeholder*="2018"]', '2020');
    
    // Set rating to 4 stars
    await page.click('div:has(button[aria-label*="Rate"]) button:nth-child(4)');
    
    // Add tasting notes
    await page.fill('textarea[placeholder*="Describe the wine"]', 'Great wine with a beautiful photo!');
    
    // Upload a test image
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("📁 Upload Photo")');
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([{
      name: 'test-wine.png',
      mimeType: 'image/png',
      buffer: testImageBuffer
    }]);
    
    // Wait for photo to be uploaded
    await expect(page.locator('img[alt="Wine bottle"]')).toBeVisible({ timeout: 5000 });
    
    // Submit the form
    await page.click('button:has-text("Add Wine")');
    
    // Verify we're back to the main page
    await expect(page.locator('h1:has-text("Wine Journal")')).toBeVisible();
    
    // Verify the wine appears in the list with photo
    await expect(page.locator('text=Test Wine with Photo')).toBeVisible();
    await expect(page.locator('img[alt="Test Wine with Photo bottle"]')).toBeVisible();
    
    // Verify wine details are displayed
    await expect(page.locator('text=Vintage: 2020')).toBeVisible();
    await expect(page.locator('text=Great wine with a beautiful photo!')).toBeVisible();
  });

  test('should handle camera permission denied gracefully', async ({ page }) => {
    // Click Add New Wine button
    await page.click('button:has-text("Add New Wine")');
    
    // Click Take Photo button
    await page.click('button:has-text("📷 Take Photo")');
    
    // Camera interface should still open even if permissions are denied (shows error state)
    await expect(page.locator('text=Take Wine Photo')).toBeVisible({ timeout: 10000 });
    
    // Should show either error, loading, or instructions
    await page.waitForTimeout(200);
    const hasInstructions = await page.locator('text=Position the wine bottle within the frame').isVisible();
    const hasError = await page.locator('text=Camera Error').isVisible();
    const hasLoading = await page.locator('text=Loading camera...').isVisible();
    expect(hasInstructions || hasError || hasLoading).toBe(true);
    
    // User should be able to close the interface
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await page.click('button:has-text("Cancel")');
    
    // Verify interface is closed
    await expect(page.locator('text=Take Wine Photo')).not.toBeVisible();
    await expect(page.locator('h2:has-text("Add New Wine")')).toBeVisible();
  });
});
