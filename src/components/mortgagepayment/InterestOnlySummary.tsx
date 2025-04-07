
import React from 'react';
import { formatCurrency } from '../../utils/mortgageCalculator';

interface InterestOnlySummaryProps {
  results: {
    monthlyPayment: number;
    loanAmount: number;
  };
  formData: {
    interestRate: number;
    loanTerm: number;
    monthlyOverpayment: number;
  };
}

export const InterestOnlySummary: React.FC<InterestOnlySummaryProps> = ({ results, formData }) => {
  return (
    <div className="p-6 text-center">
      <h3 className="text-xl font-semibold mb-4">Interest-Only Summary</h3>
      <p className="text-lg text-gray-700 mb-4">
        With the current interest rate of {formData.interestRate}%, your monthly payment is {formatCurrency(results.monthlyPayment)}.
        At the end of the {formData.loanTerm}-year term, you will still owe {formatCurrency(results.loanAmount)}.
      </p>
      {formData.monthlyOverpayment > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg">
          <p className="text-sm text-gray-700">
            Your additional monthly payment of {formatCurrency(formData.monthlyOverpayment)} will reduce your outstanding balance 
            to {formatCurrency(Math.max(0, results.loanAmount - (formData.monthlyOverpayment * formData.loanTerm * 12)))} 
            at the end of the term.
          </p>
        </div>
      )}
    </div>
  );
};
