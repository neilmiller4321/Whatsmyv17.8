
import React from 'react';
import { Home } from 'lucide-react';
import { formatCurrency } from '../../utils/mortgageCalculator';
import { getPropertyTaxInfo } from '../../utils/propertyTaxCalculator';

interface MortgageResults {
  monthlyPayment: number;
  principalAndInterest: number;
  totalPayment: number;
  totalInterest: number;
  loanAmount: number;
  totalInterestWithOverpayment: number;
  interestSaved: number;
  newLoanTermMonths: number;
  monthsReduced: number;
  higherRatePayment: number;
  lowerRatePayment: number;
  stampDuty: number;
  effectiveRate: number;
}

interface ResultsPanelProps {
  results: MortgageResults | null;
  formData: {
    monthlyOverpayment: number;
    interestRate: number;
    mortgageTerm: number;
    region: 'england' | 'scotland';
    isFirstTimeBuyer: boolean;
    isAdditionalProperty: boolean;
  };
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, formData }) => {
  // Helper function to format periods (months) as years and months
  const formatPeriod = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    } else if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
      return `${years} ${years === 1 ? 'year' : 'years'} and ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
      <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
      
      {results ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-sunset-start/10 to-sunset-end/10 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Monthly Payment</p>
            <p className="text-3xl font-bold text-gray-900">
              {formData.monthlyOverpayment > 0 
                ? formatCurrency(results.monthlyPayment + formData.monthlyOverpayment)
                : formatCurrency(results.monthlyPayment)
              }
            </p>
            {formData.monthlyOverpayment > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                incl. {formatCurrency(formData.monthlyOverpayment)} overpayment
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Loan Amount</p>
              <p className="text-sm font-medium">{formatCurrency(results.loanAmount)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Total Interest</p>
              <p className="text-sm font-medium">{formatCurrency(results.totalInterest)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Total Cost</p>
              <p className="text-sm font-medium">{formatCurrency(results.totalPayment)}</p>
            </div>

            {/* Interest Rate Scenarios */}
            <div className="border-t border-gray-200 my-3"></div>
            <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2">Interest Rate Scenarios</h3>
              
              <div className="flex justify-between mb-1">
                <p className="text-sm text-gray-600">If rates drop by 1%</p>
                <p className="text-sm font-medium text-sunset-text">
                  {formatCurrency(results.lowerRatePayment + formData.monthlyOverpayment)}
                </p>
              </div>
              
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">If rates rise by 1%</p>
                <p className="text-sm font-medium text-sunset-text-hover">
                  {formatCurrency(results.higherRatePayment + formData.monthlyOverpayment)}
                </p>
              </div>
            </div>
            
            {/* Stamp Duty / LBTT Results */}
            <div className="border-t border-gray-200 my-3"></div>
            <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2">
                {formData.region === 'england' ? 'Stamp Duty (SDLT)' : 'LBTT'} Summary
              </h3>
              
              <div className="flex justify-between mb-1">
                <p className="text-sm text-gray-600">Tax Amount</p>
                <p className="text-sm font-medium">{formatCurrency(results.stampDuty)}</p>
              </div>
              
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Effective Rate</p>
                <p className="text-sm font-medium">{results.effectiveRate.toFixed(2)}%</p>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                {getPropertyTaxInfo(
                  formData.region,
                  formData.isFirstTimeBuyer,
                  formData.isAdditionalProperty
                )}
              </p>
            </div>
            
            {/* Overpayment Results */}
            {formData.monthlyOverpayment > 0 && (
              <>
                <div className="border-t border-gray-200 my-3"></div>
                <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg p-3">
                  <h3 className="text-sm font-semibold mb-2">With Overpayments</h3>
                  
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600">New Mortgage Term</p>
                    <p className="text-sm font-medium">{formatPeriod(results.newLoanTermMonths)}</p>
                  </div>
                  
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600">Time Saved</p>
                    <p className="text-sm font-medium text-sunset-text">{formatPeriod(results.monthsReduced)}</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Interest Saved</p>
                    <p className="text-sm font-medium text-sunset-text">{formatCurrency(results.interestSaved)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 mb-2">Enter your mortgage details and click calculate to see your payment breakdown.</p>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sunset-start/20 via-sunset-middle/20 to-sunset-end/20 flex items-center justify-center mt-4">
            <Home className="w-6 h-6 text-sunset-middle opacity-60" />
          </div>
        </div>
      )}
    </div>
  );
};
