import React from 'react';
import type { Wine } from '../types/wine';
import { StarRating } from './StarRating';
import { TasteProfileComponent } from './TasteProfile';

interface WineDetailModalProps {
  wine: Wine;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (wine: Wine) => void;
  onDelete?: (id: string) => void;
}

export const WineDetailModal: React.FC<WineDetailModalProps> = ({
  wine,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(wine);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this wine entry?')) {
      onDelete(wine.id);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start z-10">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {wine.name}
            </h2>
            {wine.vintage && (
              <p className="text-lg text-gray-600">
                Vintage: {wine.vintage}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-purple-600 transition-colors duration-200 rounded-full hover:bg-purple-50"
                aria-label="Edit wine"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Photo */}
          {wine.photo && (
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={wine.photo}
                alt={`${wine.name} bottle`}
                className="w-full max-h-[500px] object-contain"
              />
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Rating:</span>
            <StarRating rating={wine.rating} readonly size="lg" />
          </div>

          {/* Location */}
          {wine.location && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Location</h4>
                  <p className="text-sm text-blue-800">{wine.location}</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {wine.analysis && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-900 flex items-center">
                    <span className="text-2xl mr-2">🤖</span>
                    AI Wine Analysis
                  </h3>
                  {wine.analysis.confidence !== undefined && (
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                      {Math.round(wine.analysis.confidence * 100)}% confidence
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wine.analysis.wineType && (
                      <div className="bg-white rounded-lg p-3 border border-green-100">
                        <p className="text-xs font-medium text-green-700 mb-1">Type</p>
                        <p className="text-sm text-gray-900">{wine.analysis.wineType}</p>
                      </div>
                    )}
                    {wine.analysis.region && (
                      <div className="bg-white rounded-lg p-3 border border-green-100">
                        <p className="text-xs font-medium text-green-700 mb-1">Region</p>
                        <p className="text-sm text-gray-900">{wine.analysis.region}</p>
                      </div>
                    )}
                    {wine.analysis.grapeVarieties && wine.analysis.grapeVarieties.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-green-100 md:col-span-2">
                        <p className="text-xs font-medium text-green-700 mb-1">Grape Varieties</p>
                        <p className="text-sm text-gray-900">{wine.analysis.grapeVarieties.join(', ')}</p>
                      </div>
                    )}
                  </div>

                  {/* Tasting Notes */}
                  {wine.analysis.tastingNotes && (
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <h4 className="text-sm font-semibold text-green-800 mb-2">Tasting Notes</h4>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {wine.analysis.tastingNotes}
                      </p>
                    </div>
                  )}

                  {/* Taste Profile */}
                  {wine.analysis.tasteProfile && (
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <h4 className="text-sm font-semibold text-green-800 mb-3">Taste Profile</h4>
                      <TasteProfileComponent 
                        profile={wine.analysis.tasteProfile} 
                        size="lg"
                      />
                    </div>
                  )}

                  {/* Interesting Fact */}
                  {wine.analysis.interestingFact && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <span className="text-xl">💡</span>
                        <div>
                          <h4 className="text-sm font-semibold text-amber-900 mb-1">Did You Know?</h4>
                          <p className="text-sm text-amber-800 leading-relaxed">
                            {wine.analysis.interestingFact}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analysis Date */}
                  {wine.analysis.analysisDate && (
                    <p className="text-xs text-gray-500 text-right">
                      Analyzed on {formatDate(wine.analysis.analysisDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Personal Notes */}
          {wine.notes && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                My Notes
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {wine.notes}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Added: {formatDate(wine.dateAdded)}</span>
            </div>
            {wine.dateModified !== wine.dateAdded && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Updated: {formatDate(wine.dateModified)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

