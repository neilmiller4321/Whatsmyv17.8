
// Types for pension and investment projections
export interface PersonalInfo {
  currentAge: number;
  retirementAge: number;
  currentSalary: number;
  currentPensionValue: number;
  monthlyContribution: number;
  employerContribution: number;
  inflationRate: number;
  salaryGrowthRate: number;
}

export interface AssetAllocation {
  stocks: number;
  bonds: number;
  cash: number;
}

export interface ExpectedReturns {
  stocks: number;
  bonds: number;
  cash: number;
}

export interface AssetBreakdown {
  stocks: number;
  bonds: number;
  cash: number;
}

export interface PensionSummary {
  projectedValue: number;
  realValue: number;
  finalBreakdown: AssetBreakdown;
  totalContributions: number;
  employerContributions: number;
  investmentGrowth: number;
}

export interface YearlyPensionData {
  age: number;
  totalPension: number;
  contributions: number;
  employerContributions: number;
  investmentGrowth: number;
  realValue: number;
  assetAllocation: AssetBreakdown;
}
