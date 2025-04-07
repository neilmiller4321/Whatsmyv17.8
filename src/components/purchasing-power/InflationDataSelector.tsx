
import React from 'react';
import { Info } from 'lucide-react';

interface InflationDataSelectorProps {
  dataType: 'cpi' | 'rpi';
  onDataTypeChange: (dataType: 'cpi' | 'rpi') => void;
  showDataInfo: boolean;
  setShowDataInfo: (show: boolean) => void;
  earliestCpiYear: number;
  earliestRpiYear: number;
}

export function InflationDataSelector({
  dataType,
  onDataTypeChange,
  showDataInfo,
  setShowDataInfo,
  earliestCpiYear,
  earliestRpiYear
}: InflationDataSelectorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Inflation Measure
        </label>
        <button 
          type="button"
          className="text-gray-400 hover:text-sunset-text transition-colors flex items-center text-xs"
          onClick={() => setShowDataInfo(!showDataInfo)}
        >
          <Info className="w-4 h-4 mr-1" />
          About the data
        </button>
      </div>
      
      {showDataInfo && (
        <div className="mb-3 p-3 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg text-sm text-gray-600">
          <p className="mb-2"><strong>CPI (Consumer Price Index):</strong> The official UK inflation measure since 1996. Data available from {earliestCpiYear} to present.</p>
          <p><strong>RPI (Retail Price Index):</strong> An older measure that includes housing costs. Data available from {earliestRpiYear} to present.</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onDataTypeChange('cpi')}
          className={`py-3 px-4 rounded-lg text-center transition-all duration-200 ${
            dataType === 'cpi'
              ? 'gradient-button text-white font-medium'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          CPI
        </button>
        <button
          type="button"
          onClick={() => onDataTypeChange('rpi')}
          className={`py-3 px-4 rounded-lg text-center transition-all duration-200 ${
            dataType === 'rpi'
              ? 'gradient-button text-white font-medium'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          RPI
        </button>
      </div>
    </div>
  );
}
