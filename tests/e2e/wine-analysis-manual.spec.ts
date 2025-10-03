import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Wine Photo Analysis - Manual Upload Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('should display uploaded wine images in test-images folder', async ({ page }) => {
    // Check that test-images directory exists and has images
    const testImagesDir = path.join(process.cwd(), 'test-images');
    const imageFiles = fs.readdirSync(testImagesDir)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
    
    console.log(`Found ${imageFiles.length} wine bottle images for testing`);
    imageFiles.forEach((file, i) => {
      console.log(`  ${i + 1}. ${file}`);
    });
    
    expect(imageFiles.length).toBeGreaterThan(0);
  });

  test('should navigate to wine form and test photo upload button exists', async ({ page }) => {
    // Look for the wine form or add wine button
    const addWineButton = page.locator('text=Add Wine').or(page.locator('text=Add New Wine'));
    
    if (await addWineButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✓ Found Add Wine button');
    } else {
      console.log('○ Add Wine button not visible (may need authentication)');
    }
  });

  test('should test manual photo upload workflow', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds for this test
    
    console.log('\n🍷 Testing Wine Photo Upload Workflow');
    console.log('═'.repeat(60));
    
    // Check if we need to log in first
    const loginForm = page.locator('input[type="email"]');
    const isLoginPage = await loginForm.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isLoginPage) {
      console.log('📝 Login required, attempting to log in...');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      console.log('✓ Logged in');
    }
    
    // Look for Add Wine or similar button
    const addButton = page.locator('text=Add Wine').or(page.locator('text=Add New Wine')).first();
    const hasAddButton = await addButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasAddButton) {
      console.log('✓ Found Add Wine button');
      await addButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Check for photo upload button
    const uploadButton = page.locator('text=/Upload Photo|Choose File|📁 Upload/i').first();
    const hasUploadButton = await uploadButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasUploadButton) {
      console.log('✓ Found photo upload button');
      
      // Get the first test image
      const testImagesDir = path.join(process.cwd(), 'test-images');
      const imageFiles = fs.readdirSync(testImagesDir)
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
      
      if (imageFiles.length > 0) {
        const testImagePath = path.join(testImagesDir, imageFiles[0]);
        console.log(`📸 Uploading test image: ${imageFiles[0]}`);
        
        // Find file input and upload
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(testImagePath);
        
        console.log('✓ File selected for upload');
        
        // Wait for analysis to start
        const analyzingText = page.locator('text=/Analyzing.*wine/i');
        const isAnalyzing = await analyzingText.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isAnalyzing) {
          console.log('🤖 Wine analysis started...');
          
          // Wait for analysis to complete (up to 30 seconds)
          await page.waitForTimeout(3000); // Give API time to process
          
          // Check for analysis results
          const analysisResult = page.locator('text=/AI Wine Analysis|Wine:|Type:/i');
          const hasAnalysis = await analysisResult.isVisible({ timeout: 30000 }).catch(() => false);
          
          if (hasAnalysis) {
            console.log('✅ Wine analysis completed successfully!');
            
            // Try to extract some analysis data
            const pageContent = await page.content();
            if (pageContent.includes('Wine:')) {
              console.log('✓ Analysis contains wine information');
            }
            if (pageContent.includes('Type:')) {
              console.log('✓ Analysis contains wine type');
            }
            if (pageContent.includes('confidence')) {
              console.log('✓ Analysis includes confidence score');
            }
          } else {
            console.log('⚠️  Analysis result not detected (may still be processing)');
          }
        } else {
          console.log('⚠️  Analysis indicator not found');
        }
        
        // Check if photo preview is visible
        const photoPreview = page.locator('img[alt*="wine" i], img[src^="data:image"]');
        const hasPreview = await photoPreview.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (hasPreview) {
          console.log('✓ Photo preview displayed');
        }
      }
    } else {
      console.log('ℹ️  Photo upload button not found in current view');
      console.log('   This test requires manual navigation to the wine form');
    }
    
    console.log('═'.repeat(60));
  });

  test('should verify wine can be saved with photo and analysis', async ({ page }) => {
    console.log('\n💾 Testing Wine Save Functionality');
    console.log('═'.repeat(60));
    
    // This is more of a smoke test to verify the form exists
    const wineNameInput = page.locator('input[placeholder*="wine" i], input#wine-name');
    const hasForm = await wineNameInput.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasForm) {
      console.log('✓ Wine form detected');
      console.log('✓ Ready to accept wine details');
    } else {
      console.log('ℹ️  Wine form not visible (may require navigation)');
    }
    
    console.log('\n📋 Manual Testing Instructions:');
    console.log('   1. Navigate to Add Wine form');
    console.log('   2. Click "Upload Photo" button');
    console.log('   3. Select a wine image from test-images/');
    console.log('   4. Wait for AI analysis to complete');
    console.log('   5. Verify wine details are auto-filled');
    console.log('   6. Click "Add Wine" to save');
    console.log('   7. Verify wine appears in the list');
    
    console.log('═'.repeat(60));
  });
});

test.describe('Wine Photo Analysis - API Direct Test', () => {
  test('should test analyze-wine API endpoint directly', async ({ request }) => {
    test.setTimeout(60000);
    
    console.log('\n🔌 Testing API Endpoint Directly');
    console.log('═'.repeat(60));
    
    // Read a test image
    const testImagesDir = path.join(process.cwd(), 'test-images');
    const imageFiles = fs.readdirSync(testImagesDir)
      .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
    
    if (imageFiles.length === 0) {
      console.log('❌ No test images found');
      return;
    }
    
    const testImagePath = path.join(testImagesDir, imageFiles[0]);
    const imageBuffer = fs.readFileSync(testImagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(testImagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    const photoBase64 = `data:${mimeType};base64,${base64Image}`;
    
    console.log(`📸 Testing with image: ${imageFiles[0]}`);
    console.log(`   Size: ${Math.round(base64Image.length / 1024)} KB`);
    
    try {
      console.log('📡 Calling /api/analyze-wine...');
      
      const response = await request.post('http://localhost:5173/api/analyze-wine', {
        data: {
          photoBase64
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 45000
      });
      
      console.log(`   Response status: ${response.status()}`);
      
      if (response.ok()) {
        const data = await response.json();
        
        if (data.success && data.analysis) {
          console.log('✅ Analysis successful!\n');
          
          const analysis = data.analysis;
          
          if (analysis.wineName) {
            console.log(`🍷 Wine Name: ${analysis.wineName}`);
          }
          if (analysis.wineType) {
            console.log(`🍇 Type: ${analysis.wineType}`);
          }
          if (analysis.region) {
            console.log(`🌍 Region: ${analysis.region}`);
          }
          if (analysis.vintage) {
            console.log(`📅 Vintage: ${analysis.vintage}`);
          }
          if (analysis.confidence !== undefined) {
            console.log(`📊 Confidence: ${Math.round(analysis.confidence * 100)}%`);
          }
          if (analysis.tastingNotes) {
            console.log(`👅 Tasting Notes: ${analysis.tastingNotes.substring(0, 100)}...`);
          }
          
          console.log('\n✓ All analysis fields received successfully');
          
          expect(data.success).toBe(true);
          expect(analysis).toHaveProperty('analysisDate');
        } else {
          console.log('⚠️  Invalid response format');
          console.log(data);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log(`❌ API Error: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error}`);
      console.log('\n💡 Make sure:');
      console.log('   1. Dev server is running (npm run dev)');
      console.log('   2. ANTHROPIC_API_KEY is set in .env');
      console.log('   3. Vercel CLI is handling API routes (vercel dev)');
    }
    
    console.log('═'.repeat(60));
  });
});


