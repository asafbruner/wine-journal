import type { WineAnalysis } from '../types/wine';

export class WineAnalysisService {
  static async analyzeWinePhoto(photoBase64: string): Promise<WineAnalysis> {
    try {
      console.log('Starting wine photo analysis via API...');
      console.log('Base64 data length:', photoBase64.length);
      
      // Call our server-side API endpoint
      const response = await fetch('/api/analyze-wine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoBase64: photoBase64
        })
      });

      console.log('API response status:', response.status);

      const data = await response.json();
      console.log('API response data:', data);

      // If response has an analysis (even with errors), return it
      // This allows graceful degradation with error messages
      if (data.analysis) {
        console.log('Returning analysis result:', data.analysis);
        return data.analysis;
      }

      // If no analysis and not successful, throw error
      if (!response.ok || !data.success) {
        const errorMessage = data.error || `API request failed with status ${response.status}`;
        console.error('API error:', errorMessage);
        throw new Error(errorMessage);
      }

      // If successful but no analysis, throw error
      if (!data.analysis) {
        throw new Error('Invalid API response format - no analysis data');
      }

      console.log('Final analysis result:', data.analysis);
      return data.analysis;

    } catch (error) {
      console.error('Error analyzing wine photo:', error);
      
      // Provide more specific error information
      let errorMessage = 'Unable to analyze the wine photo. ';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage += 'Network connection issue. Please check your internet connection.';
        } else if (error.message.includes('API request failed')) {
          errorMessage += 'Server error occurred. Please try again later.';
        } else if (error.message.includes('authentication') || error.message.includes('API key')) {
          errorMessage += 'API authentication failed.';
        } else if (error.message.includes('rate limit')) {
          errorMessage += 'API rate limit exceeded. Please try again later.';
        } else if (error.message.includes('quota')) {
          errorMessage += 'API quota exceeded.';
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
        interestingFact: 'Wine analysis requires a clear photo of the wine bottle label and proper server configuration.',
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
