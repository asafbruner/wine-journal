import React from 'react';
import type { TasteProfile } from '../types/wine';

interface TasteProfileProps {
  profile: TasteProfile;
  size?: 'sm' | 'md' | 'lg';
}

export const TasteProfileComponent: React.FC<TasteProfileProps> = ({ 
  profile, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const barHeight = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const renderFlavorBar = (label: string, value?: number, color: string = 'bg-purple-500') => {
    if (value === undefined || value === 0) return null;
    
    const percentage = (value / 5) * 100;
    
    return (
      <div key={label} className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className={`${sizeClasses[size]} font-medium text-gray-700`}>
            {label}
          </span>
          <span className={`${sizeClasses[size]} text-gray-500`}>
            {value}/5
          </span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full ${barHeight[size]}`}>
          <div
            className={`${color} ${barHeight[size]} rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const renderCharacteristicBar = (label: string, value?: number, color: string = 'bg-blue-500') => {
    if (value === undefined || value === 0) return null;
    
    const percentage = (value / 5) * 100;
    
    return (
      <div key={label} className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className={`${sizeClasses[size]} font-medium text-gray-700`}>
            {label}
          </span>
          <span className={`${sizeClasses[size]} text-gray-500`}>
            {value}/5
          </span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full ${barHeight[size]}`}>
          <div
            className={`${color} ${barHeight[size]} rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const renderFlavorTags = (flavors: string[] | undefined, title: string, bgColor: string) => {
    if (!flavors || flavors.length === 0) return null;
    
    return (
      <div className="mb-3">
        <h4 className={`${sizeClasses[size]} font-semibold text-gray-800 mb-2`}>
          {title}
        </h4>
        <div className="flex flex-wrap gap-1">
          {flavors.map((flavor, index) => (
            <span
              key={index}
              className={`${bgColor} text-white px-2 py-1 rounded-full ${sizeClasses[size]} font-medium`}
            >
              {flavor}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const getBodyDescription = (body?: number) => {
    if (!body) return '';
    if (body <= 2) return 'Light Body';
    if (body <= 3) return 'Medium Body';
    if (body <= 4) return 'Medium-Full Body';
    return 'Full Body';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
      <h3 className={`${size === 'lg' ? 'text-lg' : 'text-base'} font-bold text-purple-800 mb-4 flex items-center`}>
        🍷 Taste Profile
      </h3>

      {/* Primary Flavors */}
      {(profile.primaryFlavors && profile.primaryFlavors.length > 0) && (
        renderFlavorTags(profile.primaryFlavors, 'Primary Flavors', 'bg-purple-500')
      )}

      {/* Secondary Flavors */}
      {(profile.secondaryFlavors && profile.secondaryFlavors.length > 0) && (
        renderFlavorTags(profile.secondaryFlavors, 'Secondary Flavors', 'bg-pink-500')
      )}

      {/* Flavor Intensity Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className={`${sizeClasses[size]} font-semibold text-gray-800 mb-3`}>
            Flavor Intensity
          </h4>
          {renderFlavorBar('Fruit', profile.fruit, 'bg-red-500')}
          {renderFlavorBar('Citrus', profile.citrus, 'bg-yellow-500')}
          {renderFlavorBar('Floral', profile.floral, 'bg-pink-500')}
          {renderFlavorBar('Herbal', profile.herbal, 'bg-green-500')}
          {renderFlavorBar('Earthy', profile.earthy, 'bg-amber-600')}
          {renderFlavorBar('Mineral', profile.mineral, 'bg-gray-500')}
          {renderFlavorBar('Spice', profile.spice, 'bg-orange-500')}
          {renderFlavorBar('Oak', profile.oak, 'bg-amber-700')}
        </div>

        <div>
          <h4 className={`${sizeClasses[size]} font-semibold text-gray-800 mb-3`}>
            Wine Structure
          </h4>
          {renderCharacteristicBar('Sweetness', profile.sweetness, 'bg-pink-400')}
          {renderCharacteristicBar('Acidity', profile.acidity, 'bg-lime-500')}
          {renderCharacteristicBar('Tannin', profile.tannin, 'bg-purple-600')}
          {renderCharacteristicBar('Alcohol', profile.alcohol, 'bg-red-600')}
          
          {/* Body indicator */}
          {profile.body && (
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className={`${sizeClasses[size]} font-medium text-gray-700`}>
                  Body
                </span>
                <span className={`${sizeClasses[size]} text-gray-500`}>
                  {getBodyDescription(profile.body)}
                </span>
              </div>
              <div className={`w-full bg-gray-200 rounded-full ${barHeight[size]}`}>
                <div
                  className={`bg-indigo-500 ${barHeight[size]} rounded-full transition-all duration-300`}
                  style={{ width: `${(profile.body / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wine Folly Style Summary */}
      <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-purple-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
          {profile.sweetness !== undefined && (
            <div className="bg-pink-100 rounded-lg p-2">
              <div className={`${sizeClasses[size]} font-semibold text-pink-700`}>
                Sweetness
              </div>
              <div className="text-lg font-bold text-pink-800">
                {profile.sweetness}/5
              </div>
            </div>
          )}
          {profile.acidity !== undefined && (
            <div className="bg-lime-100 rounded-lg p-2">
              <div className={`${sizeClasses[size]} font-semibold text-lime-700`}>
                Acidity
              </div>
              <div className="text-lg font-bold text-lime-800">
                {profile.acidity}/5
              </div>
            </div>
          )}
          {profile.tannin !== undefined && (
            <div className="bg-purple-100 rounded-lg p-2">
              <div className={`${sizeClasses[size]} font-semibold text-purple-700`}>
                Tannin
              </div>
              <div className="text-lg font-bold text-purple-800">
                {profile.tannin}/5
              </div>
            </div>
          )}
          {profile.body !== undefined && (
            <div className="bg-indigo-100 rounded-lg p-2">
              <div className={`${sizeClasses[size]} font-semibold text-indigo-700`}>
                Body
              </div>
              <div className={`${sizeClasses[size]} font-bold text-indigo-800`}>
                {getBodyDescription(profile.body)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
