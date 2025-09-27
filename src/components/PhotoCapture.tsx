import React, { useRef, useCallback, useState, useEffect } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      try {
        const videoEl = videoRef.current as HTMLVideoElement & { srcObject: MediaStream | null };
        videoEl.srcObject = stream;
        videoEl.play().catch(() => {});
      } catch (e) {
        console.error('Failed to start video:', e);
      }
    }
    return () => {
      if (!showCamera && videoRef.current) {
        try {
          const videoEl = videoRef.current as HTMLVideoElement & { srcObject: MediaStream | null };
          videoEl.srcObject = null;
        } catch {}
      }
    };
  }, [showCamera, stream]);

  const openCamera = useCallback(async () => {
    setAnalysisError(null);
    setCameraError(null);
    setIsCameraLoading(true);
    // Always show the camera interface, even if permissions fail
    setShowCamera(true);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(media);
    } catch (err) {
      console.error('getUserMedia failed:', err);
      // Indicate camera error but keep interface visible
      setCameraError('Camera Error');
    } finally {
      setIsCameraLoading(false);
    }
  }, []);

  const closeCamera = useCallback(() => {
    setShowCamera(false);
    setCameraError(null);
    setIsCameraLoading(false);
    stopCamera();
  }, [stopCamera]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/png');

    // Immediately capture the photo
    onPhotoCapture(dataUrl);

    // Then analyze the wine photo
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const analysis = await WineAnalysisService.analyzeWinePhoto(dataUrl);
      onPhotoCapture(dataUrl, analysis);
    } catch (error) {
      console.error('Wine analysis failed:', error);
      setAnalysisError('Failed to analyze wine photo. You can still add details manually.');
    } finally {
      setIsAnalyzing(false);
    }

    closeCamera();
  }, [onPhotoCapture, closeCamera]);

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
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={openCamera}
              className="btn-secondary w-full"
              disabled={isAnalyzing}
            >
              📷 Take Photo
            </button>
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
          </div>
        )}

        {currentPhoto && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={openCamera}
              className="btn-secondary w-full"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 inline-block mr-2"></div>
                  Analyzing Wine...
                </>
              ) : (
                '📷 Retake Photo'
              )}
            </button>
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
                '📁 Upload Different'
              )}
            </button>
          </div>
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

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90">
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={closeCamera}
              className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center text-lg"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-full w-full text-white space-y-4">
            <h3 className="text-2xl font-semibold">Take Wine Photo</h3>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-96 h-64 bg-black rounded-lg border border-gray-600"
            />
            <p className="text-sm">
              {isCameraLoading
                ? 'Loading camera...'
                : cameraError
                ? 'Camera Error'
                : 'Position the wine bottle within the frame'}
            </p>
            <div className="mt-4 flex space-x-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="btn-primary"
              >
                📸 Capture
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
