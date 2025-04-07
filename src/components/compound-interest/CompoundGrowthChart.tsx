
import React, { useState } from 'react';
import { CompoundInterestResult } from './types';

interface CompoundGrowthChartProps {
  results: CompoundInterestResult | null;
}

export function CompoundGrowthChart({ results }: CompoundGrowthChartProps) {
  const [activeChartView, setActiveChartView] = useState<'balance' | 'contributions' | 'interest'>('balance');

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
    <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
      <h2 className="text-xl font-semibold mb-4">Compound Growth</h2>
      
      {/* Chart View Selector */}
      <div className="flex mb-4 border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setActiveChartView('balance')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeChartView === 'balance' 
              ? 'bg-gradient-to-r from-sunset-start to-sunset-middle text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Balance Growth
        </button>
        <button
          onClick={() => setActiveChartView('contributions')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeChartView === 'contributions' 
              ? 'bg-gradient-to-r from-sunset-start to-sunset-middle text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Contributions
        </button>
        <button
          onClick={() => setActiveChartView('interest')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeChartView === 'interest' 
              ? 'bg-gradient-to-r from-sunset-start to-sunset-middle text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Interest Growth
        </button>
      </div>
      
      {/* Dynamic Chart */}
      <div className="h-64 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500">
          {activeChartView === 'balance' && (
            <>
              <div>{formatCurrency(results.finalBalance)}</div>
              <div>{formatCurrency(results.finalBalance * 0.75)}</div>
              <div>{formatCurrency(results.finalBalance * 0.5)}</div>
              <div>{formatCurrency(results.finalBalance * 0.25)}</div>
              <div>£0</div>
            </>
          )}
          {activeChartView === 'contributions' && (
            <>
              <div>{formatCurrency(results.totalContributions)}</div>
              <div>{formatCurrency(results.totalContributions * 0.75)}</div>
              <div>{formatCurrency(results.totalContributions * 0.5)}</div>
              <div>{formatCurrency(results.totalContributions * 0.25)}</div>
              <div>£0</div>
            </>
          )}
          {activeChartView === 'interest' && (
            <>
              <div>{formatCurrency(results.totalInterestEarned)}</div>
              <div>{formatCurrency(results.totalInterestEarned * 0.75)}</div>
              <div>{formatCurrency(results.totalInterestEarned * 0.5)}</div>
              <div>{formatCurrency(results.totalInterestEarned * 0.25)}</div>
              <div>£0</div>
            </>
          )}
        </div>
        
        {/* Chart area */}
        <div className="absolute left-16 right-0 top-0 bottom-8 bg-white/50 rounded-lg">
          {/* Horizontal grid lines */}
          <div className="absolute left-0 right-0 top-0 h-px bg-gray-200"></div>
          <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-200"></div>
          <div className="absolute left-0 right-0 top-2/4 h-px bg-gray-200"></div>
          <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-200"></div>
          <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-200"></div>
          
          {/* Chart content */}
          <div className="absolute inset-0 flex items-end">
            {results.yearlyData.map((data, index) => {
              const barWidth = `${100 / results.yearlyData.length}%`;
              let barHeight = '0%';
              let barColor = '';
              let tooltipContent = '';
              
              if (activeChartView === 'balance') {
                barHeight = `${(data.balance / results.finalBalance) * 100}%`;
                barColor = 'bg-gradient-to-t from-sunset-start to-sunset-middle';
                tooltipContent = `Year ${data.year}: ${formatCurrency(data.balance)}`;
              } else if (activeChartView === 'contributions') {
                barHeight = `${(data.totalContributions / results.totalContributions) * 100}%`;
                barColor = 'bg-[#4285F4]';
                tooltipContent = `Year ${data.year}: ${formatCurrency(data.totalContributions)}`;
              } else if (activeChartView === 'interest') {
                barHeight = `${(data.totalInterestEarned / results.totalInterestEarned) * 100}%`;
                barColor = 'bg-[#34A853]';
                tooltipContent = `Year ${data.year}: ${formatCurrency(data.totalInterestEarned)}`;
              }
              
              return (
                <div 
                  key={index}
                  className="group relative flex items-end h-full"
                  style={{ width: barWidth }}
                >
                  <div 
                    className={`w-4/5 mx-auto rounded-t-sm ${barColor} transition-all duration-300 hover:opacity-90`}
                    style={{ height: barHeight }}
                  ></div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {tooltipContent}
                  </div>
                  
                  {/* X-axis label */}
                  <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500 transform translate-y-full">
                    {data.year}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* X-axis label */}
        <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500">
          Year
        </div>
      </div>
      
      {/* Chart insights */}
      <div className="mt-6 p-4 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg">
        {activeChartView === 'balance' && (
          <p className="text-sm text-gray-700">
            Your investment balance grows exponentially over time, reaching {formatCurrency(results.finalBalance)} by the end.
            {results.yearlyData.length > 5 && ` The most significant growth occurs in the later years, demonstrating the power of compound interest.`}
          </p>
        )}
        {activeChartView === 'contributions' && (
          <p className="text-sm text-gray-700">
            Your total contributions increase linearly, reaching {formatCurrency(results.totalContributions)} by the end.
            By the end, you will have contributed {Math.round((results.totalContributions / results.finalBalance) * 100)}% of your final balance.
          </p>
        )}
        {activeChartView === 'interest' && (
          <p className="text-sm text-gray-700">
            Interest growth accelerates over time as your balance increases. By the end, you will have earned {formatCurrency(results.totalInterestEarned)} in interest, which is {Math.round((results.totalInterestEarned / results.finalBalance) * 100)}% of your final balance. This demonstrates how compound interest becomes more powerful over longer time periods.
          </p>
        )}
      </div>
    </div>
  );
}
