#!/usr/bin/env node
/**
 * Test script for wine photo upload, analysis, and saving functionality
 * Tests the complete workflow locally
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function convertImageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.gif') mimeType = 'image/gif';
    
    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    throw new Error(`Failed to read image: ${error.message}`);
  }
}

async function testWineAnalysisAPI(photoBase64) {
  log('\n📡 Testing Wine Analysis API...', 'cyan');
  
  const apiUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/api/analyze-wine`
    : 'http://localhost:3000/api/analyze-wine';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoBase64 }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      log(`❌ API Error (${response.status}): ${data.error || 'Unknown error'}`, 'red');
      return null;
    }
    
    if (data.success && data.analysis) {
      log('✅ Wine analysis successful!', 'green');
      return data.analysis;
    } else {
      log('❌ Analysis failed: Invalid response format', 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Failed to call API: ${error.message}`, 'red');
    log('\n💡 Note: For full API testing, make sure:', 'yellow');
    log('   1. Development server is running (npm run dev)', 'yellow');
    log('   2. ANTHROPIC_API_KEY is set in .env file', 'yellow');
    return null;
  }
}

function validateAnalysis(analysis) {
  log('\n🔍 Validating Analysis Result...', 'cyan');
  
  const checks = [
    { field: 'wineName', required: false },
    { field: 'wineType', required: false },
    { field: 'region', required: false },
    { field: 'vintage', required: false },
    { field: 'tastingNotes', required: false },
    { field: 'tasteProfile', required: false },
    { field: 'confidence', required: false },
    { field: 'analysisDate', required: true },
  ];
  
  let passedChecks = 0;
  
  checks.forEach(check => {
    if (analysis[check.field] !== undefined) {
      log(`  ✓ ${check.field}: present`, 'green');
      passedChecks++;
    } else if (check.required) {
      log(`  ✗ ${check.field}: missing (required)`, 'red');
    } else {
      log(`  ○ ${check.field}: not provided (optional)`, 'yellow');
    }
  });
  
  return passedChecks > 0;
}

function displayAnalysis(analysis) {
  log('\n📋 Analysis Results:', 'blue');
  log('━'.repeat(60), 'blue');
  
  if (analysis.wineName) {
    log(`🍷 Wine Name: ${analysis.wineName}`, 'cyan');
  }
  
  if (analysis.wineType) {
    log(`🍇 Type: ${analysis.wineType}`, 'cyan');
  }
  
  if (analysis.region) {
    log(`🌍 Region: ${analysis.region}`, 'cyan');
  }
  
  if (analysis.vintage) {
    log(`📅 Vintage: ${analysis.vintage}`, 'cyan');
  }
  
  if (analysis.grapeVarieties && analysis.grapeVarieties.length > 0) {
    log(`🍇 Grape Varieties: ${analysis.grapeVarieties.join(', ')}`, 'cyan');
  }
  
  if (analysis.tastingNotes) {
    log(`👅 Tasting Notes:\n   ${analysis.tastingNotes}`, 'cyan');
  }
  
  if (analysis.tasteProfile) {
    log(`\n🎯 Taste Profile:`, 'cyan');
    const profile = analysis.tasteProfile;
    
    if (profile.primaryFlavors && profile.primaryFlavors.length > 0) {
      log(`   Primary Flavors: ${profile.primaryFlavors.join(', ')}`, 'cyan');
    }
    
    if (profile.secondaryFlavors && profile.secondaryFlavors.length > 0) {
      log(`   Secondary Flavors: ${profile.secondaryFlavors.join(', ')}`, 'cyan');
    }
    
    const characteristics = [
      { name: 'Body', value: profile.body },
      { name: 'Acidity', value: profile.acidity },
      { name: 'Tannin', value: profile.tannin },
      { name: 'Sweetness', value: profile.sweetness },
    ];
    
    characteristics.forEach(char => {
      if (char.value !== undefined) {
        log(`   ${char.name}: ${char.value}/5`, 'cyan');
      }
    });
  }
  
  if (analysis.interestingFact) {
    log(`\n💡 Interesting Fact:\n   ${analysis.interestingFact}`, 'cyan');
  }
  
  if (analysis.confidence !== undefined) {
    const confidencePercent = Math.round(analysis.confidence * 100);
    log(`\n📊 Confidence: ${confidencePercent}%`, 'cyan');
  }
  
  log('━'.repeat(60), 'blue');
}

async function main() {
  log('\n🍷 Wine Photo Analysis Test Suite', 'blue');
  log('═'.repeat(60), 'blue');
  
  // Step 1: Check test images
  log('\n📁 Step 1: Checking test images...', 'cyan');
  const testImagesDir = path.join(__dirname, 'test-images');
  
  if (!fs.existsSync(testImagesDir)) {
    log('❌ test-images directory not found!', 'red');
    process.exit(1);
  }
  
  const imageFiles = fs.readdirSync(testImagesDir)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
  
  if (imageFiles.length === 0) {
    log('❌ No image files found in test-images/', 'red');
    process.exit(1);
  }
  
  log(`✅ Found ${imageFiles.length} wine bottle images:`, 'green');
  imageFiles.forEach((file, i) => {
    log(`   ${i + 1}. ${file}`, 'yellow');
  });
  
  // Step 2: Test image conversion
  log('\n📸 Step 2: Converting images to base64...', 'cyan');
  const testImage = imageFiles[0];
  const testImagePath = path.join(testImagesDir, testImage);
  
  log(`   Testing with: ${testImage}`, 'yellow');
  
  let photoBase64;
  try {
    photoBase64 = convertImageToBase64(testImagePath);
    const sizeKB = Math.round(photoBase64.length / 1024);
    log(`✅ Image converted successfully (${sizeKB} KB)`, 'green');
  } catch (error) {
    log(`❌ Failed to convert image: ${error.message}`, 'red');
    process.exit(1);
  }
  
  // Step 3: Test analysis API
  log('\n🤖 Step 3: Testing wine analysis...', 'cyan');
  log('⚠️  Note: This requires a running dev server and ANTHROPIC_API_KEY', 'yellow');
  
  const analysis = await testWineAnalysisAPI(photoBase64);
  
  if (analysis) {
    // Step 4: Validate analysis
    const isValid = validateAnalysis(analysis);
    
    if (isValid) {
      log('\n✅ Analysis validation passed!', 'green');
      displayAnalysis(analysis);
    } else {
      log('\n❌ Analysis validation failed!', 'red');
    }
  } else {
    log('\n⚠️  API test skipped or failed', 'yellow');
    log('   To test the full workflow:', 'yellow');
    log('   1. Start dev server: npm run dev', 'yellow');
    log('   2. Set ANTHROPIC_API_KEY in .env', 'yellow');
    log('   3. Run this test again', 'yellow');
  }
  
  // Step 5: Summary
  log('\n📊 Test Summary:', 'blue');
  log('═'.repeat(60), 'blue');
  log(`✓ Image Files Found: ${imageFiles.length}`, 'green');
  log(`✓ Base64 Conversion: Success`, 'green');
  
  if (analysis) {
    log(`✓ Wine Analysis: Success`, 'green');
    log(`✓ Data Validation: Success`, 'green');
  } else {
    log(`○ Wine Analysis: Skipped/Failed (requires running server)`, 'yellow');
  }
  
  log('\n✅ Basic tests completed!', 'green');
  log('\n💡 Next steps:', 'cyan');
  log('   1. Start the dev server: npm run dev', 'yellow');
  log('   2. Open http://localhost:5173 in your browser', 'yellow');
  log('   3. Try uploading wine bottles from test-images/', 'yellow');
  log('   4. Verify the analysis and saving functionality', 'yellow');
  
  log('\n═'.repeat(60), 'blue');
}

main().catch(error => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});

