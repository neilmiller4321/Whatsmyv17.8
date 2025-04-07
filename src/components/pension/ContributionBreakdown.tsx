import React from 'react';
import { PensionSummary, PersonalInfo } from '../../types/pension';

interface ContributionBreakdownProps {
  summary: PensionSummary;
  personalInfo: PersonalInfo;
}

function ContributionBreakdown({ summary, personalInfo }: ContributionBreakdownProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const total = personalInfo.currentPensionValue + 
                summary.totalUserContributions +
                summary.totalEmployerContributions +
                summary.totalInvestmentGrowth;

  const calculatePercentage = (value: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  // Calculate scale intervals based on total value
  const calculateScaleIntervals = () => {
    const roundedTotal = Math.ceil(total / 100000) * 100000;
    const interval = roundedTotal / 4;
    return Array.from({ length: 5 }, (_, i) => formatCurrency(i * interval));
  };

  const scaleIntervals = calculateScaleIntervals();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Contribution Breakdown</h3>
      
      {/* Bar Chart */}
      <div className="space-y-3">
        {/* Initial Value */}
        <div className="flex items-center gap-4">
          <div className="w-32 text-sm text-gray-600 text-right hidden md:block">Initial Value</div>
          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-[#FF4B6A]"
              style={{ width: `${calculatePercentage(personalInfo.currentPensionValue)}%` }}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
              <span className="text-sm font-medium text-gray-900 md:hidden">Initial Value:</span>
              <span className="text-sm font-medium text-gray-900 ml-1">{formatCurrency(personalInfo.currentPensionValue)}</span>
            </div>
          </div>
        </div>

        {/* Your Contributions */}
        <div className="flex items-center gap-4">
          <div className="w-32 text-sm text-gray-600 text-right hidden md:block">Your Contributions</div>
          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-[#FF8C42]"
              style={{ width: `${calculatePercentage(summary.totalUserContributions)}%` }}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
              <span className="text-sm font-medium text-gray-900 md:hidden">Your Contributions:</span>
              <span className="text-sm font-medium text-gray-900 ml-1">{formatCurrency(summary.totalUserContributions)}</span>
            </div>
          </div>
        </div>

        {/* Employer Contributions */}
        <div className="flex items-center gap-4">
          <div className="w-32 text-sm text-gray-600 text-right hidden md:block">Employer Contributions</div>
          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-[#FFB347]"
              style={{ width: `${calculatePercentage(summary.totalEmployerContributions)}%` }}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
              <span className="text-sm font-medium text-gray-900 md:hidden">Employer Contributions:</span>
              <span className="text-sm font-medium text-gray-900 ml-1">{formatCurrency(summary.totalEmployerContributions)}</span>
            </div>
          </div>
        </div>

        {/* Interest Earned */}
        <div className="flex items-center gap-4">
          <div className="w-32 text-sm text-gray-600 text-right hidden md:block">Interest Earned</div>
          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-[#4A90E2]"
              style={{ width: `${calculatePercentage(summary.totalInvestmentGrowth)}%` }}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
              <span className="text-sm font-medium text-gray-900 md:hidden">Interest Earned:</span>
              <span className="text-sm font-medium text-gray-900 ml-1">{formatCurrency(summary.totalInvestmentGrowth)}</span>
            </div>
          </div>
        </div>

        {/* X-axis values */}
        <div className="flex justify-between text-[10px] md:text-sm text-gray-500 pl-0 md:pl-36 mt-1">
          {scaleIntervals.map((value, index) => (
            <span
              key={index}
              className={`w-12 md:w-auto ${
                index === 0 ? 'text-left' :
                index === scaleIntervals.length - 1 ? 'text-right' :
                'text-center'
              }`}
            >
              {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export { ContributionBreakdown };