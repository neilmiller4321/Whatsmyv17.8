import { PENSION_LOWER_THRESHOLD, PENSION_UPPER_THRESHOLD } from './taxConstants';

// Remove unused imports
// import { 
//   PersonalInfo, 
//   AssetAllocation, 
//   ExpectedReturns,
//   ProjectionResult,
//   PensionSummary 
// } from '../types/pension';

// Pension types and calculation interfaces
export type PensionValueType = 'percentage' | 'nominal';
export type PensionType = 'auto_enrolment' | 'auto_unbanded' | 'relief_at_source' | 'relief_at_source_unbanded' | 'salary_sacrifice' | 'personal' | 'none';

// Add these interfaces if they're needed for the pension projection functions
export interface PersonalInfo {
  currentAge: number;
  retirementAge: number;
  currentSalary: number;
  currentPensionValue: number;
  monthlyContribution: number;
  monthlyContributionType: 'fixed' | 'percentage';
  employerContribution: number;
  employerContributionType: 'fixed' | 'percentage';
  salaryGrowthRate: number;
  inflationRate: number;
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

export interface ProjectionResult {
  age: number;
  totalValue: number;
  realValue: number;
  userContributions: number;
  employerContributions: number;
  investmentGrowth: number;
  breakdown: AssetBreakdown;
}

export interface PensionSummary {
  projectedValue: number;
  realValue: number;
  totalUserContributions: number;
  totalEmployerContributions: number;
  totalInvestmentGrowth: number;
  finalBreakdown: AssetBreakdown;
}

export interface PensionDetails {
  type: PensionType;
  value: number;
  valueType: PensionValueType;
  frequency?: 'monthly' | 'yearly'; // Add frequency to interface
}

// Calculate salary sacrifice contribution
export function calculateSalaryContribution(
  grossSalary: number,
  pensionValue: number,
  valueType: PensionValueType,
  earningsBasis: 'total' | 'qualifying' = 'total',
  frequency: 'monthly' | 'yearly' = 'monthly'
): number {
  if (valueType === 'nominal') {
    // For nominal values, handle frequency properly
    return frequency === 'yearly' 
      ? pensionValue // Return yearly amount as is
      : pensionValue * 12; // Convert monthly to yearly
  }
  
  // For percentage values, use existing logic
  if (earningsBasis === 'total') {
    return valueType === 'percentage'
      ? grossSalary * (pensionValue / 100)
      : pensionValue;
  } else {
    if (grossSalary < PENSION_LOWER_THRESHOLD) {
      return 0;
    } else if (grossSalary > PENSION_UPPER_THRESHOLD) {
      const qualifyingEarnings = PENSION_UPPER_THRESHOLD - PENSION_LOWER_THRESHOLD;
      return valueType === 'percentage'
        ? qualifyingEarnings * (pensionValue / 100)
        : pensionValue;
    } else {
      const qualifyingEarnings = grossSalary - PENSION_LOWER_THRESHOLD;
      return valueType === 'percentage'
        ? qualifyingEarnings * (pensionValue / 100)
        : pensionValue;
    }
  }
}

// Calculate auto-enrolment pension contribution
export function calculateAutoEnrolmentContribution(
  grossSalary: number, 
  pensionValue: number, 
  valueType: PensionValueType = 'percentage',
  frequency: 'monthly' | 'yearly' = 'monthly'
): number {
  // Handle nominal values with explicit frequency check
  if (valueType === 'nominal') {
    // For yearly nominal values, return the exact input value
    // For monthly nominal values, convert to yearly
    return frequency === 'yearly' ? pensionValue : pensionValue * 12;
  }
  
  // Original percentage-based calculation
  const monthlyGross = grossSalary / 12;
  const monthlyLowerThreshold = PENSION_LOWER_THRESHOLD / 12;
  const monthlyUpperThreshold = PENSION_UPPER_THRESHOLD / 12;
  
  if (monthlyGross < monthlyLowerThreshold) {
    return 0;
  } else if (monthlyGross > monthlyUpperThreshold) {
    return (monthlyUpperThreshold - monthlyLowerThreshold) * (pensionValue / 100) * 12;
  } else {
    return (monthlyGross - monthlyLowerThreshold) * (pensionValue / 100) * 12;
  }
}

// Calculate auto-enrolment unbanded contribution
export function calculateAutoUnbandedContribution(
  grossSalary: number,
  pensionValue: number,
  valueType: PensionValueType,
  frequency: 'monthly' | 'yearly' = 'monthly'
): number {
  if (valueType === 'percentage') {
    return grossSalary * (pensionValue / 100);
  } else {
    // Handle frequency for nominal values
    return frequency === 'yearly' ? pensionValue : pensionValue * 12;
  }
}

// Calculate relief at source contribution
export function calculateReliefAtSourceContribution(
  grossSalary: number,
  pensionValue: number,
  valueType: PensionValueType = 'percentage',
  earningsBasis: 'total' | 'qualifying' = 'total',
  frequency: 'monthly' | 'yearly' = 'monthly'
): number {
  if (valueType === 'nominal') {
    // For nominal values, handle frequency properly
    return frequency === 'yearly' 
      ? pensionValue // Return yearly amount as is
      : pensionValue * 12; // Convert monthly to yearly
  }
  
  // For percentage values, use existing logic
  if (earningsBasis === 'total') {
    return grossSalary * (pensionValue / 100);
  } else {
    if (grossSalary < PENSION_LOWER_THRESHOLD) {
      return 0;
    } else if (grossSalary > PENSION_UPPER_THRESHOLD) {
      const qualifyingEarnings = PENSION_UPPER_THRESHOLD - PENSION_LOWER_THRESHOLD;
      return qualifyingEarnings * (pensionValue / 100);
    } else {
      const qualifyingEarnings = grossSalary - PENSION_LOWER_THRESHOLD;
      return qualifyingEarnings * (pensionValue / 100);
    }
  }
}

// Calculate relief at source unbanded contribution
export function calculateReliefAtSourceUnbandedContribution(
  grossSalary: number,
  pensionValue: number,
  valueType: PensionValueType,
  frequency: 'monthly' | 'yearly' = 'monthly'
): number {
  if (valueType === 'percentage') {
    return grossSalary * (pensionValue / 100);
  } else {
    // Handle frequency for nominal values
    return frequency === 'yearly' ? pensionValue : pensionValue * 12;
  }
}

// Calculate personal pension contribution
export function calculatePersonalPensionContribution(
  grossSalary: number, 
  pensionValue: number, 
  valueType: PensionValueType,
  earningsBasis: 'total' | 'qualifying' = 'total',
  frequency: 'monthly' | 'yearly' = 'monthly'
): number {
  if (valueType === 'nominal') {
    // For nominal values, handle frequency properly
    return frequency === 'yearly' 
      ? pensionValue // Return yearly amount as is
      : pensionValue * 12; // Convert monthly to yearly
  }
  
  // For percentage values, use existing logic
  if (earningsBasis === 'total') {
    return grossSalary * (pensionValue / 100);
  } else {
    if (grossSalary < PENSION_LOWER_THRESHOLD) {
      return 0;
    } else if (grossSalary > PENSION_UPPER_THRESHOLD) {
      const qualifyingEarnings = PENSION_UPPER_THRESHOLD - PENSION_LOWER_THRESHOLD;
      return qualifyingEarnings * (pensionValue / 100);
    } else {
      const qualifyingEarnings = grossSalary - PENSION_LOWER_THRESHOLD;
      return qualifyingEarnings * (pensionValue / 100);
    }
  }
}

// Calculate contribution based on total earnings
export function calculateTotalEarningsContribution(
  grossSalary: number,
  pensionValue: number,
  valueType: PensionValueType
): number {
  if (valueType === 'percentage') {
    return grossSalary * (pensionValue / 100);
  } else {
    return pensionValue;
  }
}

// Calculate contribution based on qualifying earnings
export function calculateQualifyingEarningsContribution(
  grossSalary: number,
  pensionValue: number,
  valueType: PensionValueType
): number {
  if (grossSalary < PENSION_LOWER_THRESHOLD) {
    return 0;
  } else if (grossSalary > PENSION_UPPER_THRESHOLD) {
    const qualifyingEarnings = PENSION_UPPER_THRESHOLD - PENSION_LOWER_THRESHOLD;
    return valueType === 'percentage' 
      ? qualifyingEarnings * (pensionValue / 100)
      : pensionValue;
  } else {
    const qualifyingEarnings = grossSalary - PENSION_LOWER_THRESHOLD;
    return valueType === 'percentage'
      ? qualifyingEarnings * (pensionValue / 100)
      : pensionValue;
  }
}

// Calculate pension contribution based on type
export function calculatePensionContribution(
  grossSalary: number,
  pension: PensionDetails & { earningsBasis?: 'total' | 'qualifying' }
): number {
  if (!pension || pension.type === 'none' || pension.value === 0) {
    return 0;
  }

  // Get frequency directly from the pension object
  const frequency = pension.frequency || 'monthly';
  
  switch (pension.type) {
    // Make sure to pass the frequency to all contribution functions
    case 'auto_enrolment':
      return calculateAutoEnrolmentContribution(
        grossSalary, 
        pension.value, 
        pension.valueType, 
        frequency
      );
    case 'auto_unbanded':
      return calculateAutoUnbandedContribution(
        grossSalary, 
        pension.value, 
        pension.valueType, 
        frequency
      );
    case 'relief_at_source':
      return calculateReliefAtSourceContribution(
        grossSalary,
        pension.value,
        pension.valueType,
        pension.earningsBasis,
        frequency
      );
    case 'salary_sacrifice':
      return calculateSalaryContribution(
        grossSalary,
        pension.value,
        pension.valueType,
        pension.earningsBasis,
        frequency
      );
    case 'personal':
      return calculatePersonalPensionContribution(
        grossSalary,
        pension.value,
        pension.valueType,
        pension.earningsBasis,
        frequency
      );
    default:
      return 0;
  }
}

// Calculate total contributions for a given year
function calculateYearlyContributions(
  currentSalary: number,
  monthlyEmployeeFixed: number,
  monthlyEmployerFixed: number,
  employeePercentage: number,
  employerPercentage: number
): number {
  // Monthly contribution calculation
  const monthlyEmployeeContribution = monthlyEmployeeFixed + (employeePercentage / 100 * currentSalary / 12);
  const monthlyEmployerContribution = monthlyEmployerFixed + (employerPercentage / 100 * currentSalary / 12);
  const totalMonthlyContribution = monthlyEmployeeContribution + monthlyEmployerContribution;
  
  // Annual contribution
  return totalMonthlyContribution * 12;
}

// Calculate pension growth for a single year
function calculateYearlyGrowth(
  principal: number,
  yearlyContribution: number,
  investmentReturn: number
): {
  endBalance: number;
  investmentGrowth: number;
} {
  const endBalance = (principal + yearlyContribution) * (1 + investmentReturn);
  const investmentGrowth = endBalance - (principal + yearlyContribution);
  
  return {
    endBalance,
    investmentGrowth
  };
}

// Calculate weighted return based on asset allocation
function calculateWeightedReturn(
  allocation: AssetAllocation,
  returns: ExpectedReturns
): number {
  return (
    (allocation.stocks * returns.stocks +
    allocation.bonds * returns.bonds +
    allocation.cash * returns.cash) / 100
  );
}

// Calculate year-by-year projection
export function calculatePensionProjection(
  personalInfo: PersonalInfo,
  allocation: AssetAllocation,
  returns: ExpectedReturns,
  expectedReturn?: number
): {
  yearlyProjections: ProjectionResult[];
  summary: PensionSummary;
} {
  // Calculate weighted return
  const weightedReturn = expectedReturn !== undefined ? expectedReturn : calculateWeightedReturn(allocation, returns);
  
  const yearlyProjections: ProjectionResult[] = [];
  const projectionYears = personalInfo.retirementAge - personalInfo.currentAge;
  
  // Initialize values
  let currentSalary = personalInfo.currentSalary;
  let nominalValue = personalInfo.currentPensionValue;
  let realValue = personalInfo.currentPensionValue;
  let totalUserContributions = personalInfo.currentPensionValue;
  let totalEmployerContributions = 0;
  let totalInvestmentGrowth = 0;
  
  // Calculate year by year
  for (let year = 0; year <= projectionYears; year++) {
    const age = personalInfo.currentAge + year;
    
    // Calculate yearly contributions
    const monthlyEmployeeFixed = personalInfo.monthlyContributionType === 'fixed' 
      ? personalInfo.monthlyContribution 
      : 0;
    const monthlyEmployerFixed = personalInfo.employerContributionType === 'fixed'
      ? personalInfo.employerContribution
      : 0;
    const employeePercentage = personalInfo.monthlyContributionType === 'percentage'
      ? personalInfo.monthlyContribution
      : 0;
    const employerPercentage = personalInfo.employerContributionType === 'percentage'
      ? personalInfo.employerContribution
      : 0;
    
    const yearlyContributions = calculateYearlyContributions(
      currentSalary,
      monthlyEmployeeFixed,
      monthlyEmployerFixed,
      employeePercentage,
      employerPercentage
    );
    
    // Split contributions between employee and employer
    const yearlyEmployeeContribution = (monthlyEmployeeFixed + (employeePercentage / 100 * currentSalary / 12)) * 12;
    const yearlyEmployerContribution = (monthlyEmployerFixed + (employerPercentage / 100 * currentSalary / 12)) * 12;
    
    // Calculate growth for this year
    const yearGrowth = calculateYearlyGrowth(
      nominalValue,
      yearlyContributions,
      weightedReturn / 100
    );
    
    // Update nominal values
    nominalValue = yearGrowth.endBalance;
    totalUserContributions += yearlyEmployeeContribution;
    totalEmployerContributions += yearlyEmployerContribution;
    totalInvestmentGrowth += yearGrowth.investmentGrowth;
    
    // Calculate real value (adjusted for inflation)
    realValue = nominalValue / Math.pow(1 + personalInfo.inflationRate / 100, year);
    
    // Calculate asset breakdown
    const breakdown = {
      stocks: (nominalValue * allocation.stocks) / 100,
      bonds: (nominalValue * allocation.bonds) / 100,
      cash: (nominalValue * allocation.cash) / 100
    };
    
    yearlyProjections.push({
      age,
      totalValue: nominalValue,
      realValue,
      userContributions: totalUserContributions,
      employerContributions: totalEmployerContributions,
      investmentGrowth: totalInvestmentGrowth,
      breakdown
    });
    
    // Update salary and contributions for next year
    currentSalary *= (1 + personalInfo.salaryGrowthRate / 100);
  }
  
  // Create summary
  const finalProjection = yearlyProjections[yearlyProjections.length - 1];
  const summary: PensionSummary = {
    projectedValue: finalProjection.totalValue,
    realValue: finalProjection.realValue,
    totalUserContributions: finalProjection.userContributions,
    totalEmployerContributions: finalProjection.employerContributions,
    totalInvestmentGrowth: finalProjection.investmentGrowth,
    finalBreakdown: finalProjection.breakdown
  };
  
  return {
    yearlyProjections,
    summary
  };
}