import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

interface WineAnalysis {
  wineName?: string;
  wineType?: string;
  region?: string;
  vintage?: number;
  grapeVarieties?: string[];
  tastingNotes?: string;
  interestingFact?: string;
  confidence?: number;
  analysisDate?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { photoBase64 } = req.body;

    if (!photoBase64) {
      return res.status(400).json({ error: 'Photo data is required' });
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
              text: `Please analyze this wine bottle photo and provide detailed information about the wine. 

Return your analysis in the following JSON format:
{
  "wineName": "Name of the wine",
  "wineType": "Type (e.g., Red Wine, White Wine, Rosé, Sparkling)",
  "region": "Wine region/appellation if visible",
  "vintage": "Year if visible (number only)",
  "grapeVarieties": ["Array of grape varieties if known"],
  "tastingNotes": "Expected tasting notes and characteristics based on the wine",
  "interestingFact": "An interesting fact about this wine, winery, or region",
  "confidence": "Confidence level from 0.0 to 1.0"
}

Focus on what you can actually see in the image (label, bottle shape, color, etc.) and provide educated insights based on that information. If you can't determine something from the image, indicate lower confidence or omit that field.`
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
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        errorMessage += 'API authentication failed.';
      } else if (error.message.includes('rate limit')) {
        errorMessage += 'API rate limit exceeded.';
      } else if (error.message.includes('quota')) {
        errorMessage += 'API quota exceeded.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
    } else {
      errorMessage += 'Unknown server error occurred.';
    }

    // Return error response
    return res.status(500).json({
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
