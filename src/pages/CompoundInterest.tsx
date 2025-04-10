import React, { useState, useEffect } from 'react';
import { Percent } from 'lucide-react';
import { 
  FormData, 
  InputFieldState, 
  CompoundInterestResult 
} from '../components/compound-interest/types';
import { calculateCompoundInterest } from '../components/compound-interest/CompoundInterestUtils';
import { CompoundInterestForm } from '../components/compound-interest/CompoundInterestForm';
import { ResultsSummary } from '../components/compound-interest/ResultsSummary';
import { CompoundGrowthChart } from '../components/compound-interest/CompoundGrowthChart';
import { YearlyBreakdown } from '../components/compound-interest/YearlyBreakdown';
import { EducationalContent } from '../components/compound-interest/EducationalContent';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export function CompoundInterest() {
  const [calculationMode, setCalculationMode] = useState<'balance' | 'target'>('balance');
  
  // Default values for the calculator
  const [formData, setFormData] = useState<FormData>({
    initialInvestment: 10000,
    monthlyContribution: 500,
    annualInterestRate: 7,
    compoundingFrequency: 'monthly',
    investmentTimeframe: 20,
    timeframeUnit: 'years',
    targetAmount: 100000
  });

  // Input field values (as strings to handle formatting)
  const [inputValues, setInputValues] = useState<InputFieldState>({
    initialInvestment: '10,000',
    monthlyContribution: '500',
    annualInterestRate: '7',
    compoundingFrequency: 'monthly',
    investmentTimeframe: '20',
    timeframeUnit: 'years',
    targetAmount: '100,000'
  });

  const [results, setResults] = useState<CompoundInterestResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  
  // Calculate results whenever form data changes
  useEffect(() => {
    calculateResults();
  }, [formData, calculationMode]);

  const calculateResults = () => {
    setIsCalculating(true);
    
    // Short delay to show calculation animation if needed
    setTimeout(() => {
      try {
        const result = calculateCompoundInterest(formData, calculationMode);
        setResults(result);
      } catch (error) {
        console.error("Error calculating compound interest:", error);
      } finally {
        setIsCalculating(false);
      }
    }, 300);
  };

  // Add keyboard shortcut for calculation
  useKeyboardShortcut('Enter', () => {
    calculateResults();
  }, { 
    triggerOnFormElements: false, 
    preventDefault: true 
  });

  return (
    <main className="pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center mb-6">
            <Percent className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 logo-text bg-gradient-to-r from-sunset-start via-sunset-middle to-sunset-end bg-clip-text text-transparent leading-tight text-center">
            What's My<br className="sm:hidden" /> Compound Interest?
          </h1>
          <p className="text-gray-600 text-center max-w-2xl">
            See how your investments can grow over time with the power of compound interest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Calculator Form */}
          <CompoundInterestForm 
            formData={formData}
            setFormData={setFormData}
            inputValues={inputValues}
            setInputValues={setInputValues}
            onCalculate={calculateResults}
            isCalculating={isCalculating}
            calculationMode={calculationMode}
            setCalculationMode={setCalculationMode}
          />
          
          {/* Results Panel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
            <h2 className="text-xl font-semibold mb-4">Investment Summary</h2>
            <ResultsSummary 
              results={results} 
              initialInvestment={formData.initialInvestment} 
              calculationMode={calculationMode}
              formData={formData}
            />
          </div>
        </div>
        
        {/* Pro User Section - Desktop Only */}
        {results && results.yearlyData.length > 0 && (
          <CompoundGrowthChart results={results} />
        )}
        
        {/* Yearly Breakdown Table */}
        {results && (
          <YearlyBreakdown results={results} />
        )}
        
        {/* Educational Content */}
        <EducationalContent />
      </div>
    </main>
  );
}
