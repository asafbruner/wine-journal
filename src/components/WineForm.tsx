import React, { useState } from 'react';
import type { WineFormData, WineAnalysis } from '../types/wine';
import { StarRating } from './StarRating';
import { PhotoCapture } from './PhotoCapture';
import { TasteProfileComponent } from './TasteProfile';

interface WineFormProps {
  onSubmit: (data: WineFormData) => void;
  initialData?: WineFormData;
  submitLabel?: string;
  onCancel?: () => void;
}

interface FormErrors {
  name?: string;
  vintage?: string;
  rating?: string;
  notes?: string;
  location?: string;
}

export const WineForm: React.FC<WineFormProps> = ({
  onSubmit,
  initialData,
  submitLabel = 'Add Wine',
  onCancel
}) => {
  const [formData, setFormData] = useState<WineFormData>(
    initialData || {
      name: '',
      vintage: undefined,
      rating: 3,
      notes: '',
      photo: undefined,
      analysis: undefined,
      location: undefined
    }
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Wine name is required';
    }

    if (formData.vintage && (formData.vintage < 1800 || formData.vintage > new Date().getFullYear())) {
      newErrors.vintage = 'Please enter a valid vintage year';
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5 stars';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      
      // Reset form if this is a new wine (no initial data)
      if (!initialData) {
        setFormData({
          name: '',
          vintage: undefined,
          rating: 3,
          notes: '',
          photo: undefined,
          analysis: undefined,
          location: undefined
        });
      }
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, location: 'Geolocation is not supported by your browser' }));
      return;
    }

    setIsDetectingLocation(true);
    setErrors(prev => ({ ...prev, location: undefined }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get a human-readable location
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'WineJournalApp'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.address;
            
            // Build a nice location string
            const locationParts = [];
            if (address.city) locationParts.push(address.city);
            else if (address.town) locationParts.push(address.town);
            else if (address.village) locationParts.push(address.village);
            
            if (address.state) locationParts.push(address.state);
            if (address.country) locationParts.push(address.country);
            
            const locationString = locationParts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            
            setFormData(prev => ({
              ...prev,
              location: locationString
            }));
          } else {
            // Fallback to coordinates if reverse geocoding fails
            setFormData(prev => ({
              ...prev,
              location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }));
          }
        } catch (error) {
          // Fallback to coordinates if there's an error
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        let errorMessage = 'Unable to detect location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setErrors(prev => ({ ...prev, location: errorMessage }));
      }
    );
  };

  const handlePhotoCapture = (photo: string, analysis?: WineAnalysis) => {
    setFormData(prev => ({
      ...prev,
      photo,
      analysis
    }));

    // Auto-fill form fields from analysis if available and fields are empty
    if (analysis) {
      setFormData(prev => ({
        ...prev,
        photo,
        analysis,
        name: prev.name || analysis.wineName || prev.name,
        vintage: prev.vintage || analysis.vintage || prev.vintage,
        notes: prev.notes || (analysis.tastingNotes ? `${analysis.tastingNotes}\n\n${analysis.interestingFact || ''}`.trim() : prev.notes)
      }));
    }
  };

  const handleInputChange = (field: keyof WineFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {initialData ? 'Edit Wine' : 'Add New Wine'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="wine-name" className="block text-sm font-medium text-gray-700 mb-1">
            Wine Name *
          </label>
          <input
            id="wine-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`form-input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="e.g., Château Margaux 2015"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="wine-vintage" className="block text-sm font-medium text-gray-700 mb-1">
            Vintage Year
          </label>
          <input
            id="wine-vintage"
            type="number"
            value={formData.vintage || ''}
            onChange={(e) => handleInputChange('vintage', e.target.value ? parseInt(e.target.value) : undefined)}
            className={`form-input ${errors.vintage ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="e.g., 2018"
            min="1800"
            max={new Date().getFullYear()}
          />
          {errors.vintage && (
            <p className="mt-1 text-sm text-red-600">{errors.vintage}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <StarRating
            rating={formData.rating}
            onRatingChange={(rating) => handleInputChange('rating', rating)}
          />
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        <div>
          <PhotoCapture
            currentPhoto={formData.photo}
            onPhotoCapture={handlePhotoCapture}
            onRemovePhoto={() => setFormData(prev => ({ ...prev, photo: undefined, analysis: undefined }))}
          />
        </div>

        {formData.analysis && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                🤖 AI Wine Analysis
                {formData.analysis.confidence !== undefined && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {Math.round(formData.analysis.confidence * 100)}% confidence
                  </span>
                )}
              </h3>
              <div className="text-sm text-green-700 space-y-2">
                {formData.analysis.wineName && (
                  <div><strong>Wine:</strong> {formData.analysis.wineName}</div>
                )}
                {formData.analysis.wineType && (
                  <div><strong>Type:</strong> {formData.analysis.wineType}</div>
                )}
                {formData.analysis.region && (
                  <div><strong>Region:</strong> {formData.analysis.region}</div>
                )}
                {formData.analysis.vintage && (
                  <div><strong>Vintage:</strong> {formData.analysis.vintage}</div>
                )}
                {formData.analysis.grapeVarieties && formData.analysis.grapeVarieties.length > 0 && (
                  <div><strong>Grape Varieties:</strong> {formData.analysis.grapeVarieties.join(', ')}</div>
                )}
                {formData.analysis.tastingNotes && (
                  <div><strong>Tasting Notes:</strong> {formData.analysis.tastingNotes}</div>
                )}
                {formData.analysis.interestingFact && (
                  <div className="bg-green-100 p-2 rounded mt-2">
                    <strong>💡 Interesting Fact:</strong> {formData.analysis.interestingFact}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, analysis: undefined }))}
                className="mt-2 text-xs text-green-600 hover:text-green-800 underline"
              >
                Hide Analysis
              </button>
            </div>

            {/* Taste Profile Display */}
            {formData.analysis.tasteProfile && (
              <TasteProfileComponent 
                profile={formData.analysis.tasteProfile} 
                size="md"
              />
            )}
          </div>
        )}

        <div>
          <label htmlFor="wine-notes" className="block text-sm font-medium text-gray-700 mb-1">
            Tasting Notes
          </label>
          <textarea
            id="wine-notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="form-textarea"
            rows={4}
            placeholder="Describe the wine's aroma, taste, finish, and your overall impression..."
          />
        </div>

        <div>
          <label htmlFor="wine-location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="flex gap-2">
            <input
              id="wine-location"
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`form-input flex-1 ${errors.location ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., Napa Valley, CA or enter location manually"
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="btn-secondary whitespace-nowrap flex items-center gap-1"
              title="Detect current location"
            >
              {isDetectingLocation ? (
                <>
                  <span className="animate-spin">⌛</span>
                  Detecting...
                </>
              ) : (
                <>
                  📍 Auto-detect
                </>
              )}
            </button>
          </div>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Click "Auto-detect" to use your current location, or type it in manually
          </p>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="btn-primary flex-1"
          >
            {submitLabel}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              aria-label="Back"
            >
              Back
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
