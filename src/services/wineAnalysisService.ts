import Anthropic from '@anthropic-ai/sdk';
import type { WineAnalysis } from '../types/wine';

export class WineAnalysisService {
  private static anthropic: Anthropic | null = null;

  private static getClient(): Anthropic {
    if (!this.anthropic) {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_ANTHROPIC_API_KEY environment variable is not set');
      }
      this.anthropic = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true // Note: In production, this should be done server-side
      });
    }
    return this.anthropic;
  }

  static async analyzeWinePhoto(photoBase64: string): Promise<WineAnalysis> {
    try {
      console.log('Starting wine photo analysis...');
      
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      console.log('API Key available:', !!apiKey);
      
      if (!apiKey) {
        throw new Error('VITE_ANTHROPIC_API_KEY environment variable is not set');
      }
      
      const client = this.getClient();
      
      // Remove the data URL prefix if present
      const base64Data = photoBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      console.log('Base64 data length:', base64Data.length);
      
      // Detect image format from the data URL
      const imageFormat = photoBase64.match(/^data:image\/([a-z]+);base64,/)?.[1] || 'jpeg';
      const mediaType = `image/${imageFormat}` as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
      
      console.log('Detected image format:', mediaType);
      
      const message = await client.messages.create({
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
      return analysis;
    } catch (error) {
      console.error('Error analyzing wine photo:', error);
      
      // Provide more specific error information
      let errorMessage = 'Unable to analyze the wine photo. ';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage += 'API key not configured properly.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Network connection issue.';
        } else if (error.message.includes('CORS')) {
          errorMessage += 'Browser security restriction.';
        } else {
          errorMessage += `Error: ${error.message}`;
        }
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      // Return a fallback analysis with more specific error info
      return {
        wineName: 'Analysis failed',
        wineType: 'Unknown',
        tastingNotes: errorMessage + ' Please try again or enter details manually.',
        interestingFact: 'Wine analysis requires a clear photo of the wine bottle label and proper API configuration.',
        confidence: 0,
        analysisDate: new Date().toISOString()
      };
    }
  }

  static formatAnalysisForDisplay(analysis: WineAnalysis): string {
    const parts: string[] = [];
    
    if (analysis.wineName) {
      parts.push(`**Wine:** ${analysis.wineName}`);
    }
    
    if (analysis.wineType) {
      parts.push(`**Type:** ${analysis.wineType}`);
    }
    
    if (analysis.region) {
      parts.push(`**Region:** ${analysis.region}`);
    }
    
    if (analysis.vintage) {
      parts.push(`**Vintage:** ${analysis.vintage}`);
    }
    
    if (analysis.grapeVarieties && analysis.grapeVarieties.length > 0) {
      parts.push(`**Grape Varieties:** ${analysis.grapeVarieties.join(', ')}`);
    }
    
    if (analysis.tastingNotes) {
      parts.push(`**Tasting Notes:** ${analysis.tastingNotes}`);
    }
    
    if (analysis.interestingFact) {
      parts.push(`**Interesting Fact:** ${analysis.interestingFact}`);
    }
    
    return parts.join('\n\n');
  }
}
