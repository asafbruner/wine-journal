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

      {isCapturing && (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-300"
            />
            <div className="absolute inset-0 border-2 border-dashed border-white rounded-lg pointer-events-none"></div>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={capturePhoto}
              className="btn-primary flex-1"
            >
              📸 Capture Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
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
  );
};
