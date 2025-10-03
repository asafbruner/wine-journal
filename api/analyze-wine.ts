import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

interface TasteProfile {
  // Primary flavors (0-5 scale)
  fruit?: number;
  citrus?: number;
  floral?: number;
  herbal?: number;
  earthy?: number;
  mineral?: number;
  spice?: number;
  oak?: number;
  
  // Wine characteristics (0-5 scale)
  sweetness?: number;
  acidity?: number;
  tannin?: number;
  alcohol?: number;
  body?: number; // Light, Medium, Full (1-5)
  
  // Primary flavor descriptors
  primaryFlavors?: string[];
  secondaryFlavors?: string[];
}

interface WineAnalysis {
  wineName?: string;
  wineType?: string;
  region?: string;
  vintage?: number;
  grapeVarieties?: string[];
  tastingNotes?: string;
  tasteProfile?: TasteProfile;
  interestingFact?: string;
  confidence?: number;
  analysisDate?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    const { photoBase64 } = req.body;

    if (!photoBase64) {
      return res.status(400).json({ 
        success: false,
        error: 'Photo data is required' 
      });
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured');
      return res.status(500).json({
        success: false,
        error: 'Wine analysis is not configured. Please contact support.',
        analysis: {
          wineName: 'Configuration Error',
          wineType: 'Unknown',
          tastingNotes: 'Wine analysis requires API configuration. Please enter wine details manually.',
          interestingFact: 'Contact your administrator to enable wine photo analysis.',
          confidence: 0,
          analysisDate: new Date().toISOString()
        }
      });
    }

    // Initialize Anthropic client with server-side API key
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY, // Server-side environment variable
    });

    console.log('Starting wine photo analysis on server...');

    // Remove the data URL prefix if present
    const base64Data = photoBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Detect image format from the data URL
    const imageFormat = photoBase64.match(/^data:image\/([a-z]+);base64,/)?.[1] || 'jpeg';
    const mediaType = `image/${imageFormat}` as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    console.log('Detected image format:', mediaType);
    console.log('Base64 data length:', base64Data.length);

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
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `Please analyze this wine bottle photo and provide detailed information about the wine, including a comprehensive taste profile. 

Return your analysis in the following JSON format:
{
  "wineName": "Name of the wine",
  "wineType": "Type (e.g., Red Wine, White Wine, Rosé, Sparkling)",
  "region": "Wine region/appellation if visible",
  "vintage": "Year if visible (number only)",
  "grapeVarieties": ["Array of grape varieties if known"],
  "tastingNotes": "Expected tasting notes and characteristics based on the wine",
  "tasteProfile": {
    "fruit": 3,
    "citrus": 2,
    "floral": 1,
    "herbal": 2,
    "earthy": 3,
    "mineral": 2,
    "spice": 2,
    "oak": 3,
    "sweetness": 1,
    "acidity": 4,
    "tannin": 4,
    "alcohol": 3,
    "body": 4,
    "primaryFlavors": ["Blackberry", "Plum", "Vanilla"],
    "secondaryFlavors": ["Tobacco", "Cedar", "Dark Chocolate"]
  },
  "interestingFact": "An interesting fact about this wine, winery, or region",
  "confidence": "Confidence level from 0.0 to 1.0"
}

For the taste profile, rate each characteristic on a scale of 0-5:
- Flavor intensities (fruit, citrus, floral, herbal, earthy, mineral, spice, oak): How prominent each flavor category is
- Wine structure (sweetness, acidity, tannin, alcohol): The wine's structural components
- Body: 1=Light, 2=Light-Medium, 3=Medium, 4=Medium-Full, 5=Full
- Primary flavors: 3-5 main flavors you'd expect to taste
- Secondary flavors: 2-4 complex flavors from aging/winemaking

Base your analysis on what you can see in the image (grape variety, region, vintage, wine style) and your knowledge of typical characteristics for that type of wine. If you can't determine something from the image, provide educated estimates based on visible wine type and region, but indicate lower confidence.`
            }
          ]
        }
      ]
    });

    console.log('Received response from Claude API');
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('Response text:', responseText);

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse analysis response: ' + responseText);
    }

    const analysisData = JSON.parse(jsonMatch[0]);
    console.log('Parsed analysis data:', analysisData);

    // Validate and structure the response
    const analysis: WineAnalysis = {
      wineName: analysisData.wineName || undefined,
      wineType: analysisData.wineType || undefined,
      region: analysisData.region || undefined,
      vintage: analysisData.vintage ? parseInt(analysisData.vintage) : undefined,
      grapeVarieties: Array.isArray(analysisData.grapeVarieties) ? analysisData.grapeVarieties : undefined,
      tastingNotes: analysisData.tastingNotes || undefined,
      tasteProfile: analysisData.tasteProfile ? {
        fruit: analysisData.tasteProfile.fruit || undefined,
        citrus: analysisData.tasteProfile.citrus || undefined,
        floral: analysisData.tasteProfile.floral || undefined,
        herbal: analysisData.tasteProfile.herbal || undefined,
        earthy: analysisData.tasteProfile.earthy || undefined,
        mineral: analysisData.tasteProfile.mineral || undefined,
        spice: analysisData.tasteProfile.spice || undefined,
        oak: analysisData.tasteProfile.oak || undefined,
        sweetness: analysisData.tasteProfile.sweetness || undefined,
        acidity: analysisData.tasteProfile.acidity || undefined,
        tannin: analysisData.tasteProfile.tannin || undefined,
        alcohol: analysisData.tasteProfile.alcohol || undefined,
        body: analysisData.tasteProfile.body || undefined,
        primaryFlavors: Array.isArray(analysisData.tasteProfile.primaryFlavors) ? analysisData.tasteProfile.primaryFlavors : undefined,
        secondaryFlavors: Array.isArray(analysisData.tasteProfile.secondaryFlavors) ? analysisData.tasteProfile.secondaryFlavors : undefined,
      } : undefined,
      interestingFact: analysisData.interestingFact || undefined,
      confidence: typeof analysisData.confidence === 'number' ? analysisData.confidence : 0.5,
      analysisDate: new Date().toISOString()
    };

    console.log('Final analysis result:', analysis);

    // Return the analysis
    return res.status(200).json({ success: true, analysis });

  } catch (error) {
    console.error('Error analyzing wine photo:', error);

    // Provide specific error information
    let errorMessage = 'Unable to analyze the wine photo. ';
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.message.includes('API key') || error.message.includes('authentication') || error.message.includes('401')) {
        errorMessage += 'API authentication failed. Please check configuration.';
        statusCode = 500;
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage += 'API rate limit exceeded. Please try again later.';
        statusCode = 429;
      } else if (error.message.includes('quota') || error.message.includes('402')) {
        errorMessage += 'API quota exceeded. Please contact support.';
        statusCode = 500;
      } else if (error.message.includes('Could not parse')) {
        errorMessage += 'Unable to parse the wine label. Please ensure the label is clearly visible and try again.';
        statusCode = 400;
      } else {
        errorMessage += `${error.message}`;
        // Keep generic 500 status
      }
    } else {
      errorMessage += 'Unknown server error occurred.';
      console.error('Non-Error object thrown:', error);
    }

    // Return error response with fallback analysis
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      analysis: {
        wineName: 'Analysis failed',
        wineType: 'Unknown',
        tastingNotes: errorMessage + ' Please try again or enter details manually.',
        interestingFact: 'Wine analysis requires a clear photo of the wine bottle label and proper API configuration.',
        confidence: 0,
        analysisDate: new Date().toISOString()
      }
    });
  }
}
