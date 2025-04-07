
import React from 'react';
import { ChevronDown, Landmark } from 'lucide-react';

interface PropertyTaxSectionProps {
  showPropertyTax: boolean;
  setShowPropertyTax: (show: boolean) => void;
  region: 'england' | 'scotland';
  isFirstTimeBuyer: boolean;
  isAdditionalProperty: boolean;
  handleRegionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PropertyTaxSection: React.FC<PropertyTaxSectionProps> = ({
  showPropertyTax,
  setShowPropertyTax,
  region,
  isFirstTimeBuyer,
  isAdditionalProperty,
  handleRegionChange,
  handleCheckboxChange
}) => {
  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <button 
        type="button"
        onClick={() => setShowPropertyTax(!showPropertyTax)} 
        className="flex items-center justify-between w-full text-left p-3 rounded-lg bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 hover:from-sunset-start/10 hover:to-sunset-end/10 transition-all duration-200 focus:outline-none group"
      >
        <h3 className="text-base text-gray-800 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-sunset-text" />
          See Your Property Tax 
          <span className="text-sm font-normal text-gray-600">(Stamp Duty / LBTT)</span>
        </h3>
        <ChevronDown 
          className={`w-5 h-5 text-sunset-text transition-transform duration-200 ${showPropertyTax ? 'transform rotate-180' : ''}`}
        />
      </button>
      
      {showPropertyTax && (
        <div className="mt-3 space-y-3 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 p-4 rounded-lg">
          {/* Region Selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Location
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="region"
                  value="england"
                  checked={region === 'england'}
                  onChange={handleRegionChange}
                  className="h-4 w-4 text-sunset-start focus:ring-sunset-start border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">England/N. Ireland (SDLT)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="region"
                  value="scotland"
                  checked={region === 'scotland'}
                  onChange={handleRegionChange}
                  className="h-4 w-4 text-sunset-start focus:ring-sunset-start border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Scotland (LBTT)</span>
              </label>
            </div>
          </div>
          
          {/* Buyer Status */}
          <div className="space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isFirstTimeBuyer"
                checked={isFirstTimeBuyer}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-sunset-start focus:ring-sunset-start border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">First-time buyer</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isAdditionalProperty"
                checked={isAdditionalProperty}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-sunset-start focus:ring-sunset-start border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Additional property (second home or buy-to-let)</span>
            </label>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            {region === 'england' 
              ? "Stamp Duty Land Tax (SDLT) applies to properties in England and Northern Ireland."
              : "Land and Buildings Transaction Tax (LBTT) applies to properties in Scotland."}
          </p>
        </div>
      )}
    </div>
  );
};
