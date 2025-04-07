
import React from 'react';

interface MortgageTypeSelectorProps {
  isInterestOnly: boolean;
  onChange: (isInterestOnly: boolean) => void;
}

export const MortgageTypeSelector: React.FC<MortgageTypeSelectorProps> = ({ 
  isInterestOnly, 
  onChange 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Mortgage Type
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`py-3 px-4 rounded-lg text-center transition-all duration-200 ${
            !isInterestOnly
              ? 'gradient-button text-white font-medium'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Repayment
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`py-3 px-4 rounded-lg text-center transition-all duration-200 ${
            isInterestOnly
              ? 'gradient-button text-white font-medium'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Interest Only
        </button>
      </div>
    </div>
  );
};
