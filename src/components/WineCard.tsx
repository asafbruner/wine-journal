import React from 'react';
import type { Wine } from '../types/wine';
import { StarRating } from './StarRating';

interface WineCardProps {
  wine: Wine;
  onEdit?: (wine: Wine) => void;
  onDelete?: (id: string) => void;
  onClick?: (wine: Wine) => void;
}

export const WineCard: React.FC<WineCardProps> = ({
  wine,
  onEdit,
  onDelete,
  onClick
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onEdit) {
      onEdit(wine);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onDelete && window.confirm('Are you sure you want to delete this wine entry?')) {
      onDelete(wine.id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(wine);
    }
  };

  return (
    <div 
      className={`card hover:shadow-xl transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      onClick={handleCardClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      } : undefined}
    >
      {/* Photo - Full display without cropping */}
      {wine.photo && (
        <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={wine.photo}
            alt={`${wine.name} bottle`}
            className="w-full h-64 object-contain"
          />
        </div>
      )}

      {/* Wine Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
        {wine.name}
      </h3>
      
      {/* Vintage if available */}
      {wine.vintage && (
        <p className="text-sm text-gray-600 mb-3 text-center">
          {wine.vintage}
        </p>
      )}

      {/* Star Rating */}
      <div className="flex justify-center mb-4">
        <StarRating rating={wine.rating} readonly size="md" />
      </div>

      {/* Edit/Delete buttons */}
      {(onEdit || onDelete) && (
        <div className="flex justify-center space-x-2 pt-3 border-t border-gray-100">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-purple-600 transition-colors duration-200 rounded-full hover:bg-purple-50"
              aria-label="Edit wine"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded-full hover:bg-red-50"
              aria-label="Delete wine"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
