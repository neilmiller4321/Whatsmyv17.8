
import React from 'react';
import { TrendingUp, ArrowLeft, Info } from 'lucide-react';

interface PurchasingPowerResult {
  originalAmount: number;
  adjustedAmount: number;
  percentageChange: number;
  inflationFactor: number;
  averageInflation: number;
  yearlyBreakdown: {
    year: number;
    amount: number;
    inflationRate: number;
  }[];
}

interface PurchasingPowerResultsProps {
  results: PurchasingPowerResult | null;
  formData: {
    amount: number;
    startYear: number;
    endYear: number;
    dataType: 'cpi' | 'rpi';
  };
}

export function PurchasingPowerResults({ results, formData }: PurchasingPowerResultsProps) {
  const formatCurrency = (value: number): string => {
    const decimals = value < 1000 ? 2 : 0;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500 mb-2">Enter your details and click calculate to see how inflation has affected your money's value.</p>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sunset-start/20 via-sunset-middle/20 to-sunset-end/20 flex items-center justify-center mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-sunset-middle opacity-60">
            <circle cx="12" cy="12" r="8" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="8" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-sunset-start/10 to-sunset-end/10 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          {formatCurrency(results.originalAmount)} in {formData.startYear} has the same purchasing power as
        </p>
        <p className="text-3xl font-bold text-gray-900 mb-1">
          {formatCurrency(results.adjustedAmount)}
        </p>
        <p className="text-sm text-gray-600">in {formData.endYear}</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Price Change</p>
          <p className={`text-sm font-medium text-red-600`}>
            {results.percentageChange >= 0 ? '+' : ''}{formatPercentage(results.percentageChange)}
          </p>
        </div>
        
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Average Annual Inflation</p>
          <p className="text-sm font-medium">
            {formatPercentage(results.averageInflation)}
          </p>
        </div>
        
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Time Period</p>
          <p className="text-sm font-medium">
            {formData.endYear - formData.startYear} years
          </p>
        </div>
        
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Inflation Measure</p>
          <p className="text-sm font-medium">
            {formData.dataType.toUpperCase()}
          </p>
        </div>
        
        <div className="border-t border-gray-200 my-3"></div>
        
        {/* Purchasing Power Visualization */}
        <div className="bg-gradient-to-br from-red-50 to-red-100/80 rounded-lg p-3 border border-red-200/50">
          <h3 className="text-sm font-semibold mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Purchasing Power Change
          </h3>
          
          <div className="relative h-10 bg-red-100/50 rounded-full overflow-hidden">
            {/* Original Value */}
            <div 
              className="absolute h-full bg-red-500/90"
              style={{ 
                width: `${(results.originalAmount / results.adjustedAmount) * 100}%`,
                minWidth: '5%',
                maxWidth: '100%'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                {formatPercentage(100 - (results.originalAmount / results.adjustedAmount) * 100)}
              </div>
            </div>
            
            {/* Value Change Indicator */}
            {results.percentageChange !== 0 && (
              <div className="absolute inset-y-0 flex items-center" 
                style={{ 
                  left: `${(results.originalAmount / results.adjustedAmount) * 100}%`,
                }}
              >
                <ArrowLeft className="w-4 h-4 text-red-600 animate-pulse" />
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-1 text-xs">
            <span className="font-medium">{formatCurrency(results.originalAmount)}</span>
            <span className="font-medium text-red-600">{formatCurrency(results.adjustedAmount)}</span>
          </div>
          
          <div className="mt-3 flex items-start gap-2 text-xs">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-gray-600">
              Your money has lost {formatPercentage(100 - (results.originalAmount / results.adjustedAmount) * 100)} in purchasing power.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
