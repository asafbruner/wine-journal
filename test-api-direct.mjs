#!/usr/bin/env node
/**
 * Direct test of the analyze-wine API with a real image
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file manually
const envFile = fs.readFileSync('.env', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?([^"]+)"?$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Anthropic SDK
const Anthropic = await import('@anthropic-ai/sdk').then(m => m.default);

async function testAnalysis() {
  console.log('\n🧪 Testing Wine Analysis API Directly\n');
  console.log('═'.repeat(60));
  
  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment');
    console.log('   Make sure .env file exists with the API key');
    process.exit(1);
  }
  
  console.log(`✓ API Key found: ${apiKey.substring(0, 20)}...`);
  
  // Read test image
  const testImagesDir = path.join(__dirname, 'test-images');
  const imageFiles = fs.readdirSync(testImagesDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
  
  if (imageFiles.length === 0) {
    console.log('❌ No test images found');
    process.exit(1);
  }
  
  const testImagePath = path.join(testImagesDir, imageFiles[0]);
  console.log(`✓ Testing with: ${imageFiles[0]}`);
  
  // Convert to base64
  const imageBuffer = fs.readFileSync(testImagePath);
  const base64Image = imageBuffer.toString('base64');
  const ext = path.extname(testImagePath).toLowerCase();
  const mediaType = ext === '.png' ? 'image/png' : 'image/jpeg';
  
  console.log(`✓ Image loaded: ${Math.round(base64Image.length / 1024)} KB`);
  console.log(`✓ Media type: ${mediaType}`);
  
  // Initialize Anthropic client
  try {
    const anthropic = new Anthropic({ apiKey });
    console.log('✓ Anthropic client initialized');
    
    console.log('\n📡 Calling Claude Vision API...');
    console.log('   This may take 5-15 seconds...\n');
    
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Please analyze this wine bottle photo and provide detailed information.
              
Return your analysis in JSON format:
{
  "wineName": "Name of the wine",
  "wineType": "Type (Red/White/Rosé/Sparkling)",
  "region": "Wine region if visible",
  "vintage": "Year if visible (number only)",
  "tastingNotes": "Expected tasting notes",
  "confidence": 0.85
}`
            }
          ]
        }
      ]
    });
    
    console.log('✅ API call successful!\n');
    
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('Response:');
    console.log('─'.repeat(60));
    console.log(responseText);
    console.log('─'.repeat(60));
    
    // Try to parse JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      console.log('\n📋 Parsed Analysis:');
      console.log(JSON.stringify(analysis, null, 2));
      console.log('\n✅ Analysis completed successfully!');
    } else {
      console.log('\n⚠️  Could not find JSON in response');
    }
    
  } catch (error) {
    console.log('\n❌ API call failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('401') || error.message.includes('authentication')) {
      console.log('\n💡 The API key might be invalid or expired');
      console.log('   Get a new key from: https://console.anthropic.com/');
    } else if (error.message.includes('rate_limit')) {
      console.log('\n💡 Rate limit exceeded - wait a moment and try again');
    } else if (error.message.includes('overloaded')) {
      console.log('\n💡 API is overloaded - try again in a few seconds');
    }
    
    process.exit(1);
  }
}

testAnalysis();

