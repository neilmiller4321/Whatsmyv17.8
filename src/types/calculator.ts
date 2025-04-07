// Types for Tax-Free Childcare calculator
export interface CalculatorInputs {
  monthlyChildcareCosts: {
    month1: number;
    month2: number;
    month3: number;
  };
  allowanceUsed: number;
  monthsUsed: 1 | 2;
  calculationPeriod: '1month' | '3month';
}

export interface MonthlyBreakdown {
  month: string;
  childcareCost: number;
  parentContribution: number;
  governmentTopUp: number;
}

export interface CalculatorResults {
  totalSavings: number;
  totalParentContribution: number;
  remainingAllowance: number;
  allowanceResetMonth: number | null;
  monthlyBreakdown: MonthlyBreakdown[];
}