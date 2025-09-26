import React, { useRef, useCallback, useState } from 'react';
import { WineAnalysisService } from '../services/wineAnalysisService';
import type { WineAnalysis } from '../types/wine';

interface PhotoCaptureProps {
  onPhotoCapture: (photo: string, analysis?: WineAnalysis) => void;
  currentPhoto?: string;
  onRemovePhoto?: () => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoCapture,
  currentPhoto,
  onRemovePhoto
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        
        // First, capture the photo immediately
        onPhotoCapture(result);
        
        // Then analyze the wine photo
        setIsAnalyzing(true);
        setAnalysisError(null);
        
        try {
          const analysis = await WineAnalysisService.analyzeWinePhoto(result);
          onPhotoCapture(result, analysis);
        } catch (error) {
          console.error('Wine analysis failed:', error);
          setAnalysisError('Failed to analyze wine photo. You can still add details manually.');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onPhotoCapture]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wine Bottle Photo
        </label>

        {currentPhoto && (
          <div className="relative">
            <img
              src={currentPhoto}
              alt="Wine bottle"
              className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-300"
            />
            {onRemovePhoto && (
              <button
                type="button"
                onClick={onRemovePhoto}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            )}
          </div>
        )}

        {!currentPhoto && (
          <button
            type="button"
            onClick={triggerFileInput}
            className="btn-primary w-full"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                Analyzing Wine...
              </>
            ) : (
              '📁 Upload Photo'
            )}
          </button>
        )}

        {currentPhoto && (
          <button
            type="button"
            onClick={triggerFileInput}
            className="btn-secondary w-full"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 inline-block mr-2"></div>
                Analyzing Wine...
              </>
            ) : (
              '📁 Upload Different Photo'
            )}
          </button>
        )}

        {isAnalyzing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-700 text-sm">
                Analyzing your wine photo with AI...
              </span>
            </div>
          </div>
        )}

        {analysisError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-700 text-sm">{analysisError}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

      </div>
    </>
  );
};
