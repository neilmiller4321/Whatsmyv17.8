
import React from 'react';
import { formatCurrency, formatPeriod } from '../../utils/mortgageCalculator';

interface MobileOverpaymentSummaryProps {
  results: {
    loanAmount: number;
    monthlyPayment: number;
    monthsReduced: number;
    interestSaved: number;
  };
  formData: {
    isInterestOnly: boolean;
    monthlyOverpayment: number;
    loanTerm: number;
  };
}

export const MobileOverpaymentSummary: React.FC<MobileOverpaymentSummaryProps> = ({ 
  results, 
  formData 
}) => {
  return (
    <div className="md:hidden mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 gradient-border">
      {formData.isInterestOnly ? (
        <div className="p-4 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Interest-Only Summary</h3>
          <p className="text-sm text-gray-700">
            Your monthly payment of {formatCurrency(results.monthlyPayment)} covers only the interest. 
            Your additional payment of {formatCurrency(formData.monthlyOverpayment)} will reduce your outstanding balance 
            to {formatCurrency(Math.max(0, results.loanAmount - (formData.monthlyOverpayment * formData.loanTerm * 12)))} 
            at the end of the {formData.loanTerm}-year term.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Overpayment Benefits</h3>
          <p className="text-sm text-gray-700">
            With your monthly overpayment of {formatCurrency(formData.monthlyOverpayment)}, 
            you could pay off your mortgage {formatPeriod(results.monthsReduced)} earlier 
            and save {formatCurrency(results.interestSaved)} in interest.
          </p>
        </div>
      )}
    </div>
  );
};
