import React, { useRef, useState, useCallback } from 'react';

interface PhotoCaptureProps {
  onPhotoCapture: (photo: string) => void;
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
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or use file upload instead.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0);

        // Convert to base64
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        onPhotoCapture(photoData);
        stopCamera();
      }
    }
  }, [onPhotoCapture, stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onPhotoCapture(result);
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

        {currentPhoto && !isCapturing && (
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

        {!isCapturing && !currentPhoto && (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={startCamera}
              className="btn-primary flex-1"
            >
              📷 Take Photo
            </button>
            <button
              type="button"
              onClick={triggerFileInput}
              className="btn-secondary flex-1"
            >
              📁 Upload Photo
            </button>
          </div>
        )}

        {!isCapturing && currentPhoto && (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={startCamera}
              className="btn-secondary flex-1"
            >
              📷 Retake Photo
            </button>
            <button
              type="button"
              onClick={triggerFileInput}
              className="btn-secondary flex-1"
            >
              📁 Upload Different
            </button>
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

      {/* Full-screen camera overlay */}
      {isCapturing && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header with cancel button */}
          <div className="flex justify-between items-center p-4 bg-black bg-opacity-50 text-white">
            <h3 className="text-lg font-semibold">Take Wine Photo</h3>
            <button
              type="button"
              onClick={stopCamera}
              className="text-white hover:text-gray-300 text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Camera view */}
          <div className="flex-1 relative flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Camera overlay guides */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-80 border-2 border-white border-dashed rounded-lg opacity-50"></div>
            </div>
            
            {/* Instructions */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded-lg">
              <p className="text-sm">Position the wine bottle within the frame</p>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="p-6 bg-black bg-opacity-50">
            <div className="flex justify-center items-center space-x-8">
              <button
                type="button"
                onClick={stopCamera}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={capturePhoto}
                className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-colors flex items-center space-x-2"
              >
                <span className="text-2xl">📸</span>
                <span>Capture</span>
              </button>
              
              <div className="w-20"></div> {/* Spacer for symmetry */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
