
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { CompoundInterestResult } from './types';

interface ResultsSummaryProps {
  results: CompoundInterestResult | null;
  initialInvestment: number;
  calculationMode: 'balance' | 'target';
  formData: FormData;
}

export function ResultsSummary({ results, initialInvestment, calculationMode, formData }: ResultsSummaryProps) {
  const formatCurrency = (value: number): string => {
    // Show 2 decimal places only for required monthly contribution in target mode
    const decimals = calculationMode === 'target' && results?.requiredContribution === value ? 2 : 0;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500 mb-2">Enter your investment details and click calculate to see your potential returns.</p>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sunset-start/20 via-sunset-middle/20 to-sunset-end/20 flex items-center justify-center mt-4">
          <Info className="w-6 h-6 text-sunset-middle opacity-60" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-sunset-start/10 to-sunset-end/10 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          {calculationMode === 'balance' ? 'Final Balance' : 'Required Monthly Contribution'}
        </p>
        <p className="text-3xl font-bold text-gray-900">
          {calculationMode === 'balance' 
            ? formatCurrency(results.finalBalance)
            : formatCurrency(results.requiredContribution || 0)
          }
        </p>
        {calculationMode === 'target' && (
          <p className="text-sm text-gray-600 mt-1">
            Monthly contribution needed to reach {formatCurrency(formData.targetAmount || 0)} in {formData.timeframeUnit === 'years' ? `${formData.investmentTimeframe} years` : `${formData.investmentTimeframe} months`}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Initial Investment</p>
          <p className="text-sm font-medium">{formatCurrency(initialInvestment)}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Total Contributions</p>
          <p className="text-sm font-medium">{formatCurrency(results.totalContributions)}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm font-medium text-sunset-text">Interest Earned</p>
          <p className="text-sm font-medium text-sunset-text">{formatCurrency(results.totalInterestEarned)}</p>
        </div>
        
        <div className="border-t border-gray-200 my-3"></div>
        
        {/* Growth Visualization with more distinct colors */}
        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
          {/* Initial Investment */}
          <div 
            className="absolute h-full bg-[#FF8C42]"
            style={{ 
              width: `${(initialInvestment / results.finalBalance) * 100}%`,
              minWidth: '2%'
            }}
          ></div>
          
          {/* Contributions */}
          <div 
            className="absolute h-full bg-[#4285F4]"
            style={{ 
              width: `${((results.totalContributions - initialInvestment) / results.finalBalance) * 100}%`,
              left: `${(initialInvestment / results.finalBalance) * 100}%`,
              minWidth: '2%'
            }}
          ></div>
          
          {/* Interest */}
          <div 
            className="absolute h-full bg-[#34A853]"
            style={{ 
              width: `${(results.totalInterestEarned / results.finalBalance) * 100}%`,
              left: `${(results.totalContributions / results.finalBalance) * 100}%`,
              minWidth: '2%'
            }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#FF8C42] mr-1 rounded-sm"></div>
            <span>Initial</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#4285F4] mr-1 rounded-sm"></div>
            <span>Contributions</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#34A853] mr-1 rounded-sm"></div>
            <span>Interest</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 my-3"></div>
        
        {/* Yearly Breakdown Toggle */}
        <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2 flex items-center">
            <Info className="w-4 h-4 mr-1" />
            Key Insights
          </h3>
          
          <p className="text-sm text-gray-600 mb-2">
            Your money will grow <span className="font-medium text-sunset-text">
              {Math.round((results.finalBalance / results.totalContributions) * 10) / 10}x
            </span> over the investment period.
          </p>
          
          <p className="text-sm text-gray-600">
            For every £1 you invest, you'll earn <span className="font-medium text-sunset-text">
              £{Math.round((results.totalInterestEarned / results.totalContributions) * 100) / 100}
            </span> in interest.
          </p>
        </div>
      </div>
    </div>
  );
}
