import React from 'react';
import type { Wine } from '../types/wine';
import { StarRating } from './StarRating';
import { TasteProfileComponent } from './TasteProfile';

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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
      className={`card hover:shadow-lg transition-shadow duration-200 ${onClick ? 'cursor-pointer' : ''}`}
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
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {wine.name}
          </h3>
          {wine.vintage && (
            <p className="text-sm text-gray-600 mb-2">
              Vintage: {wine.vintage}
            </p>
          )}
        </div>
        
        <div className="flex space-x-2 ml-4">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-purple-600 transition-colors duration-200"
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
              className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
              aria-label="Delete wine"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {wine.photo && (
        <div className="mb-3">
          <img
            src={wine.photo}
            alt={`${wine.name} bottle`}
            className="w-full h-32 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      <div className="mb-3">
        <StarRating rating={wine.rating} readonly size="sm" />
      </div>

      {wine.analysis && (
        <div className="mb-4 space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="text-xs font-medium text-green-800 mb-2 flex items-center">
              🤖 AI Analysis
              {wine.analysis.confidence !== undefined && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {Math.round(wine.analysis.confidence * 100)}% confidence
                </span>
              )}
            </h4>
            <div className="text-xs text-green-700 space-y-1">
              {wine.analysis.wineType && (
                <div><strong>Type:</strong> {wine.analysis.wineType}</div>
              )}
              {wine.analysis.region && (
                <div><strong>Region:</strong> {wine.analysis.region}</div>
              )}
              {wine.analysis.grapeVarieties && wine.analysis.grapeVarieties.length > 0 && (
                <div><strong>Grapes:</strong> {wine.analysis.grapeVarieties.join(', ')}</div>
              )}
              {wine.analysis.interestingFact && (
                <div className="bg-green-100 p-2 rounded mt-1">
                  <strong>💡 Fact:</strong> {wine.analysis.interestingFact}
                </div>
              )}
            </div>
          </div>

          {/* Taste Profile Display */}
          {wine.analysis.tasteProfile && (
            <TasteProfileComponent 
              profile={wine.analysis.tasteProfile} 
              size="sm"
            />
          )}
        </div>
      )}

      {wine.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {wine.notes}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span>Added: {formatDate(wine.dateAdded)}</span>
        {wine.dateModified !== wine.dateAdded && (
          <span>Updated: {formatDate(wine.dateModified)}</span>
        )}
      </div>
    </div>
  );
};
