
import {
  PERSONAL_ALLOWANCE,
  ALLOWANCE_LOSS_THRESHOLD,
  ALLOWANCE_LOSS_LIMIT,
  BASIC_RATE,
  HIGHER_RATE,
  ADDITIONAL_RATE,
  SCOTTISH_STARTER_RATE_THRESHOLD,
  SCOTTISH_BASIC_RATE_THRESHOLD,
  SCOTTISH_INTERMEDIATE_RATE_THRESHOLD,
  SCOTTISH_HIGHER_RATE_THRESHOLD,
  SCOTTISH_ADVANCED_RATE_THRESHOLD,
  SCOTTISH_STARTER_RATE,
  SCOTTISH_BASIC_RATE,
  SCOTTISH_INTERMEDIATE_RATE,
  SCOTTISH_HIGHER_RATE,
  SCOTTISH_ADVANCED_RATE,
  SCOTTISH_TOP_RATE
} from './taxConstants';

// Interfaces
export interface TaxBreakdown {
  [key: string]: number;
}

export interface TaxResult {
  tax: number;
  breakdown: TaxBreakdown;
}

// Calculate personal allowance
export function calculatePersonalAllowance(income: number): number {
  if (income <= ALLOWANCE_LOSS_THRESHOLD) {
    return PERSONAL_ALLOWANCE;
  } else if (income <= ALLOWANCE_LOSS_LIMIT) {
    return PERSONAL_ALLOWANCE - ((income - ALLOWANCE_LOSS_THRESHOLD) / 2);
  } else {
    return 0;
  }
}

// Calculate Scottish tax
export function calculateScottishTax(salary: number, overridePersonalAllowance?: number): { tax: number; breakdown: TaxBreakdown } {
  const personalAllowance = overridePersonalAllowance ?? calculatePersonalAllowance(salary);
  let taxableSalary = Math.max(0, salary - personalAllowance);
  let tax = 0;
  const breakdown: TaxBreakdown = {
    starter_rate: 0,
    basic_rate: 0,
    intermediate_rate: 0,
    higher_rate: 0,
    advanced_rate: 0,
    top_rate: 0
  };

  // Apply Starter Rate with cap
  if (taxableSalary > 0) {
    const starterRateTaxable = Math.min(taxableSalary, SCOTTISH_STARTER_RATE_THRESHOLD - personalAllowance);
    let starterRateTax = starterRateTaxable * SCOTTISH_STARTER_RATE;
    let excessStarterRate = 0;
    
    if (starterRateTax > 438.14) {
      breakdown.starter_rate = 438.14;
      excessStarterRate = starterRateTax - 438.14;
    } else {
      breakdown.starter_rate = starterRateTax;
    }
    tax += breakdown.starter_rate;
    taxableSalary -= starterRateTaxable;

    // Adjust excess starter rate to advanced rate
    const adjustedExcessStarterRate = excessStarterRate > 0 
      ? (excessStarterRate / SCOTTISH_STARTER_RATE) * SCOTTISH_ADVANCED_RATE 
      : 0;
    breakdown.advanced_rate += adjustedExcessStarterRate;
    tax += adjustedExcessStarterRate;
  }

  // Apply Basic Rate
  if (taxableSalary > 0) {
    const basicRateTaxable = Math.min(taxableSalary, SCOTTISH_BASIC_RATE_THRESHOLD - SCOTTISH_STARTER_RATE_THRESHOLD);
    breakdown.basic_rate = basicRateTaxable * SCOTTISH_BASIC_RATE;
    tax += breakdown.basic_rate;
    taxableSalary -= basicRateTaxable;
  }

  // Apply Intermediate Rate
  if (taxableSalary > 0) {
    const intermediateRateTaxable = Math.min(taxableSalary, SCOTTISH_INTERMEDIATE_RATE_THRESHOLD - SCOTTISH_BASIC_RATE_THRESHOLD);
    breakdown.intermediate_rate = intermediateRateTaxable * SCOTTISH_INTERMEDIATE_RATE;
    tax += breakdown.intermediate_rate;
    taxableSalary -= intermediateRateTaxable;
  }

  // Apply Higher Rate
  if (taxableSalary > 0) {
    const higherRateTaxable = Math.min(taxableSalary, SCOTTISH_HIGHER_RATE_THRESHOLD - SCOTTISH_INTERMEDIATE_RATE_THRESHOLD);
    breakdown.higher_rate = higherRateTaxable * SCOTTISH_HIGHER_RATE;
    tax += breakdown.higher_rate;
    taxableSalary -= higherRateTaxable;
  }

  // Apply Advanced Rate
  if (taxableSalary > 0) {
    const advancedRateTaxable = Math.min(taxableSalary, SCOTTISH_ADVANCED_RATE_THRESHOLD - SCOTTISH_HIGHER_RATE_THRESHOLD);
    breakdown.advanced_rate = advancedRateTaxable * SCOTTISH_ADVANCED_RATE;
    tax += breakdown.advanced_rate;
    taxableSalary -= advancedRateTaxable;
  }

  // Apply Top Rate
  if (taxableSalary > 0) {
    breakdown.top_rate = taxableSalary * SCOTTISH_TOP_RATE;
    tax += breakdown.top_rate;
  }

  return { tax, breakdown };
}

// Calculate standard UK tax
export function calculateTax(salary: number, overridePersonalAllowance?: number): { tax: number; breakdown: TaxBreakdown } {
  const personalAllowance = overridePersonalAllowance ?? calculatePersonalAllowance(salary);
  let taxableSalary = Math.max(0, salary - personalAllowance);
  let tax = 0;
  const breakdown: TaxBreakdown = {
    basic_rate: 0,
    higher_rate: 0,
    additional_rate: 0
  };

  // Apply Basic Rate
  if (taxableSalary > 0) {
    const basicRateTaxable = Math.min(taxableSalary, 37700);
    breakdown.basic_rate = basicRateTaxable * BASIC_RATE;
    tax += breakdown.basic_rate;
    taxableSalary -= basicRateTaxable;
  }

  // Apply Higher Rate
  if (taxableSalary > 0) {
    const higherRateTaxable = Math.min(taxableSalary, 125140 - 37700);
    breakdown.higher_rate = higherRateTaxable * HIGHER_RATE;
    tax += breakdown.higher_rate;
    taxableSalary -= higherRateTaxable;
  }

  // Apply Additional Rate
  if (taxableSalary > 0) {
    breakdown.additional_rate = taxableSalary * ADDITIONAL_RATE;
    tax += breakdown.additional_rate;
  }

  return { tax, breakdown };
}