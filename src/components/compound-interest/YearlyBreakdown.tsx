
import React, { useState } from 'react';
import { CompoundInterestResult } from './types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface YearlyBreakdownProps {
  results: CompoundInterestResult | null;
}

export function YearlyBreakdown({ results }: YearlyBreakdownProps) {
  const [showAllYears, setShowAllYears] = useState(false);

  if (!results || results.yearlyData.length === 0) {
    return null;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Year-by-Year Breakdown</h2>
        {results.yearlyData.length > 10 && (
          <button
            onClick={() => setShowAllYears(!showAllYears)}
            className="flex items-center gap-2 text-sm text-sunset-text hover:text-sunset-text-hover transition-colors"
          >
            {showAllYears ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Show All {results.yearlyData.length} Years</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Year</th>
              <th className="py-2 px-4 text-right text-sm font-medium text-gray-500">Contributions</th>
              <th className="py-2 px-4 text-right text-sm font-medium text-gray-500">Interest Earned</th>
              <th className="py-2 px-4 text-right text-sm font-medium text-gray-500">Balance</th>
            </tr>
          </thead>
          <tbody>
            {results.yearlyData
              .slice(0, showAllYears ? undefined : 5)
              .map((data, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-900">{data.year}</td>
                <td className="py-3 px-4 text-sm text-right text-gray-900">
                  {index === 0 
                    ? formatCurrency(data.contributions) 
                    : formatCurrency(data.contributions)}
                </td>
                <td className="py-3 px-4 text-sm text-right text-sunset-text">{formatCurrency(data.interestEarned)}</td>
                <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">{formatCurrency(data.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gradient-to-r from-sunset-start/5 via-sunset-middle/5 to-sunset-end/5 font-medium">
            <tr>
              <td className="py-3 px-4 text-sm">Lifetime Totals</td>
              <td className="py-3 px-4 text-sm text-right">
                {formatCurrency(results.yearlyData[results.yearlyData.length - 1].contributions)}
              </td>
              <td className="py-3 px-4 text-sm text-right text-sunset-text">
                {formatCurrency(results.yearlyData[results.yearlyData.length - 1].interestEarned)}
              </td>
              <td className="py-3 px-4 text-sm text-right font-bold">
                {formatCurrency(results.yearlyData[results.yearlyData.length - 1].balance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
