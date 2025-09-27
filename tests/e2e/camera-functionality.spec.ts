import { test, expect } from '@playwright/test';

test.describe('Camera Functionality - Complete User Flow', () => {
test.beforeEach(async ({ page }) => {
  // Initialize DB and ensure clean state
  await page.goto('/api/init-db');
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // Sign up a fresh user to access the app
  const timestamp = Date.now();
  const testEmail = `cameratest${timestamp}@example.com`;

  await page.click('text=Sign up');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[placeholder="Enter your name"]', 'Camera Test User');
  await page.fill('input[placeholder="Enter your password"]', 'password123');
  await page.fill('input[placeholder="Confirm your password"]', 'password123');
  await page.click('button[type="submit"]');

  // Verify we are on the main app page
  await expect(page).toHaveURL(/\/(?!login|signup)/);
  await expect(page.locator('h1')).toContainText('Wine Journal');
});

  test('should provide complete camera interface experience', async ({ page, context, browserName }) => {
    // Grant camera permissions where supported (skip on WebKit)
    if (browserName !== 'webkit') {
      await context.grantPermissions(['camera']);
    }
    
    // Step 1: Navigate to wine form
    await page.click('button:has-text("Add New Wine")');
    await expect(page.locator('h2:has-text("Add New Wine")')).toBeVisible();
    
    // Step 2: Verify photo section is visible
    await expect(page.locator('text=Wine Bottle Photo')).toBeVisible();
    await expect(page.locator('button:has-text("📷 Take Photo")')).toBeVisible();
    await expect(page.locator('button:has-text("📁 Upload Photo")')).toBeVisible();
    
    // Step 3: Click Take Photo button
    await page.click('button:has-text("📷 Take Photo")');
    
    // Step 4: Verify full-screen camera interface appears
    // This should ALWAYS appear, even if camera fails
    await expect(page.locator('text=Take Wine Photo')).toBeVisible({ timeout: 10000 });
    
    // Step 5: Verify all camera interface elements are present
    await expect(page.locator('.fixed.inset-0.z-50.bg-black')).toBeVisible();
    await expect(page.locator('button:has-text("✕")')).toBeVisible();
    await expect(page.locator('button:has-text("📸 Capture")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    
    // Step 6: Verify user can see either camera feed OR error message
    // One of these should be visible
    const hasInstructions = await page.locator('text=Position the wine bottle within the frame').isVisible();
    const hasError = await page.locator('text=Camera Error').isVisible();
    const hasLoading = await page.locator('text=Loading camera...').isVisible();
    
    expect(hasInstructions || hasError || hasLoading).toBe(true);
    
    // Step 7: Test capture button is clickable
    const captureButton = page.locator('button:has-text("📸 Capture")');
    await expect(captureButton).toBeVisible();
    await expect(captureButton).toBeEnabled();
    
    // Step 8: Test cancel functionality
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('text=Take Wine Photo')).not.toBeVisible();
    await expect(page.locator('h2:has-text("Add New Wine")')).toBeVisible();
  });

  test('should handle camera errors gracefully', async ({ page, context, browserName }) => {
    // Don't grant camera permissions to simulate error (guard on WebKit)
    if (browserName !== 'webkit') {
      await context.grantPermissions([]);
    }
    
    await page.click('button:has-text("Add New Wine")');
    await page.click('button:has-text("📷 Take Photo")');
    
    // Camera interface should still appear even with error
    await expect(page.locator('text=Take Wine Photo')).toBeVisible({ timeout: 10000 });
    
    // Should show error message or still show interface
    const interfaceVisible = await page.locator('.fixed.inset-0.z-50.bg-black').isVisible();
    expect(interfaceVisible).toBe(true);
    
    // Capture button should still be present
    await expect(page.locator('button:has-text("📸 Capture")')).toBeVisible();
    
    // User should be able to close the interface
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('text=Take Wine Photo')).not.toBeVisible();
  });

  test('should complete full wine creation flow with photo upload', async ({ page }) => {
    await page.click('button:has-text("Add New Wine")');
    
    // Fill wine details
    await page.fill('input[placeholder*="Château Margaux"]', 'Test Wine Camera Flow');
    await page.fill('input[placeholder*="2018"]', '2021');
    
    // Set rating
    await page.click('div:has(button[aria-label*="Rate"]) button:nth-child(5)');
    
    // Add notes
    await page.fill('textarea[placeholder*="Describe the wine"]', 'Testing camera functionality with end-to-end test.');
    
    // Upload photo via file input (since camera might not work in test environment)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("📁 Upload Photo")');
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([{
      name: 'test-wine-camera.png',
      mimeType: 'image/png',
      buffer: testImageBuffer
    }]);
    
    // Verify photo uploaded
    await expect(page.locator('img[alt="Wine bottle"]')).toBeVisible({ timeout: 5000 });
    
    // Submit form
    await page.click('button:has-text("Add Wine")');
    
    // Verify wine appears in list with photo
    await expect(page.locator('text=Test Wine Camera Flow')).toBeVisible();
    await expect(page.locator('img[alt="Test Wine Camera Flow bottle"]')).toBeVisible();
  });

  test('should show clear user instructions', async ({ page }) => {
    await page.click('button:has-text("Add New Wine")');
    
    // Verify photo section has clear labeling
    await expect(page.locator('text=Wine Bottle Photo')).toBeVisible();
    
    // Verify buttons have clear text
    await expect(page.locator('button:has-text("📷 Take Photo")')).toBeVisible();
    await expect(page.locator('button:has-text("📁 Upload Photo")')).toBeVisible();
    
    // Test that clicking take photo shows interface
    await page.click('button:has-text("📷 Take Photo")');
    
    // Should see clear header
    await expect(page.locator('text=Take Wine Photo')).toBeVisible({ timeout: 10000 });
    
    // Should see clear action buttons
    await expect(page.locator('button:has-text("📸 Capture")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
  });
});

// Test specifically for the user's reported issue
test.describe('User Issue: Camera Interface Not Visible', () => {
  test('should always show camera interface when Take Photo is clicked', async ({ page, context, browserName }) => {
    // This test specifically addresses the user's issue
    if (browserName !== 'webkit') {
      await context.grantPermissions(['camera']);
    }
    
    // Initialize DB and sign up a user for this test
    await page.goto('/api/init-db');
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const ts = Date.now();
    const email = `cameraissue${ts}@example.com`;

    await page.click('text=Sign up');
    await page.fill('input[type="email"]', email);
    await page.fill('input[placeholder="Enter your name"]', 'Camera Issue User');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(?!login|signup)/);
    await expect(page.locator('h1')).toContainText('Wine Journal');
    
    // Step 1: Click Add New Wine
    await page.click('button:has-text("Add New Wine")');
    console.log('✓ Clicked Add New Wine');
    
    // Step 2: Verify we can see the Take Photo button
    const takePhotoButton = page.locator('button:has-text("📷 Take Photo")');
    await expect(takePhotoButton).toBeVisible();
    console.log('✓ Take Photo button is visible');
    
    // Step 3: Click Take Photo
    await takePhotoButton.click();
    console.log('✓ Clicked Take Photo button');
    
    // Step 4: The camera interface MUST appear
    const cameraInterface = page.locator('text=Take Wine Photo');
    await expect(cameraInterface).toBeVisible({ timeout: 10000 });
    console.log('✓ Camera interface appeared');
    
    // Step 5: Verify the capture button is visible
    const captureButton = page.locator('button:has-text("📸 Capture")');
    await expect(captureButton).toBeVisible();
    console.log('✓ Capture button is visible');
    
    // Step 6: Verify the interface is full-screen
    const fullScreenOverlay = page.locator('.fixed.inset-0.z-50.bg-black');
    await expect(fullScreenOverlay).toBeVisible();
    console.log('✓ Full-screen overlay is present');
    
    // Step 7: Take a screenshot for debugging
    await page.screenshot({ path: 'camera-interface-test.png', fullPage: true });
    console.log('✓ Screenshot saved as camera-interface-test.png');
    
    // Step 8: Verify user can interact with the interface
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await page.click('button:has-text("Cancel")');
    
    // Step 9: Verify interface closes
    await expect(cameraInterface).not.toBeVisible();
    console.log('✓ Camera interface closed successfully');
  });
});
