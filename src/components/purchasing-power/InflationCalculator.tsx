
import React, { useState, useEffect } from 'react';
import cpiData from '../../data/cpiData.json';
import rpiData from '../../data/rpiData.json';

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

interface FormData {
  amount: number;
  startYear: number;
  endYear: number;
  dataType: 'cpi' | 'rpi';
}

export function useInflationCalculator() {
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [results, setResults] = useState<PurchasingPowerResult | null>(null);
  
  // Get the current year
  const currentYear = new Date().getFullYear();
  const maxFutureYear = currentYear + 50; // Allow projections up to 50 years in the future
  
  // Get the earliest year in our data
  const earliestCpiYear = 1988;
  const earliestRpiYear = 1948;

  const calculatePurchasingPower = (formData: FormData) => {
    setIsCalculating(true);
    
    // Short delay to show calculation animation if needed
    setTimeout(() => {
      try {
        // Get values from form data
        const { amount, startYear, endYear, dataType } = formData;
        
        // Choose the appropriate inflation data
        const inflationData = dataType === 'cpi' ? cpiData.data : rpiData.data;
        
        // Get the earliest year for the selected data type
        const earliestYear = dataType === 'cpi' ? earliestCpiYear : earliestRpiYear;
        
        // Ensure years are valid
        const validStartYear = Math.max(earliestYear, Math.min(startYear, endYear));
        const validEndYear = Math.min(maxFutureYear, Math.max(endYear, validStartYear));
        
        // Calculate inflation factor
        let inflationFactor = 1;
        const yearlyBreakdown = [];
        let currentAmount = amount;
        let previousIndex = null;
        
        // Create yearly breakdown
        for (let year = validStartYear; year <= validEndYear; year++) {
          // Default to 2% for future projections
          let inflationRate = 2.0; // Default to 2% for future years
          
          if (year < 2026 && inflationData[year]) {
            const yearData = inflationData[year];
            const currentIndex = yearData[12] || yearData[1]; // December or January if December not available
            
            if (previousIndex !== null) {
              // Calculate year-over-year inflation rate using index values
              inflationRate = ((currentIndex - previousIndex) / previousIndex) * 100;
            }
            
            previousIndex = currentIndex;
          }
          
          // Add to yearly breakdown
          yearlyBreakdown.push({
            year,
            amount: currentAmount,
            inflationRate: inflationRate
          });
          
          // Update current amount for next year
          if (year < validEndYear) {
            currentAmount = currentAmount * (1 + inflationRate / 100);
          }
        }
        
        // Calculate final adjusted amount
        const adjustedAmount = yearlyBreakdown[yearlyBreakdown.length - 1].amount;
        
        // Calculate percentage change
        const percentageChange = ((adjustedAmount - amount) / amount) * 100;
        
        // Calculate average annual inflation
        const yearDiff = validEndYear - validStartYear;
        const averageInflation = yearDiff > 0 
          ? Math.pow(adjustedAmount / amount, 1 / yearDiff) - 1 
          : 0;
        
        setResults({
          originalAmount: amount,
          adjustedAmount,
          percentageChange,
          inflationFactor: adjustedAmount / amount,
          averageInflation: averageInflation * 100,
          yearlyBreakdown
        });
      } catch (error) {
        console.error("Error calculating purchasing power:", error);
      } finally {
        setIsCalculating(false);
      }
    }, 300);
  };

  return {
    isCalculating,
    results,
    setResults,
    calculatePurchasingPower,
    earliestCpiYear,
    earliestRpiYear,
    currentYear,
    maxFutureYear
  };
}
