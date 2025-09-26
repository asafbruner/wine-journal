import React, { useState } from 'react';
import type { WineFormData } from '../types/wine';
import { StarRating } from './StarRating';
import { PhotoCapture } from './PhotoCapture';

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
      photo: undefined
    }
  );

  const [errors, setErrors] = useState<FormErrors>({});

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
          photo: undefined
        });
      }
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
            onPhotoCapture={(photo) => handleInputChange('photo', photo)}
            onRemovePhoto={() => handleInputChange('photo', undefined)}
          />
        </div>

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
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
