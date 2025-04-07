export interface FormData {
  initialInvestment: number;
  monthlyContribution: number;
  annualInterestRate: number;
  compoundingFrequency: string;
  investmentTimeframe: number;
  timeframeUnit: string;
  targetAmount?: number;
}

export interface InputFieldState {
  initialInvestment: string;
  monthlyContribution: string;
  annualInterestRate: string;
  compoundingFrequency: string;
  investmentTimeframe: string;
  timeframeUnit: string;
  targetAmount: string;
}

export interface CompoundInterestResult {
  finalBalance: number;
  totalContributions: number;
  totalInterestEarned: number;
  yearlyData: YearlyData[];
  requiredContribution?: number;
}

export interface YearlyData {
  year: number;
  balance: number;
  contributions: number;
  interestEarned: number;
  totalContributions: number;
  totalInterestEarned: number;
}

export interface CalculatorContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  inputValues: InputFieldState;
  setInputValues: React.Dispatch<React.SetStateAction<InputFieldState>>;
  isCalculating: boolean;
  calculationMode: 'balance' | 'target';
  setCalculationMode: React.Dispatch<React.SetStateAction<'balance' | 'target'>>;
}