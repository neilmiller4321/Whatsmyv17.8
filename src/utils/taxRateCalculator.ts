import * as taxConstants24 from './taxConstants';
import * as taxConstants25 from './taxConstants25';

// Interfaces
export interface TaxBreakdown {
  [key: string]: number;
}

export interface TaxResult {
  tax: number;
  breakdown: TaxBreakdown;
}

// Get tax constants based on tax year
function getTaxConstants(taxYear: string = '2024/25') {
  return taxYear === '2025/26' ? taxConstants25 : taxConstants24;
}

// Calculate personal allowance
export function calculatePersonalAllowance(income: number, taxYear: string = '2024/25'): number {
  const constants = getTaxConstants(taxYear);
  
  if (income <= constants.ALLOWANCE_LOSS_THRESHOLD) {
    return constants.PERSONAL_ALLOWANCE;
  } else if (income <= constants.ALLOWANCE_LOSS_LIMIT) {
    return constants.PERSONAL_ALLOWANCE - ((income - constants.ALLOWANCE_LOSS_THRESHOLD) / 2);
  } else {
    return 0;
  }
}

// Calculate Scottish tax
export function calculateScottishTax(
  salary: number, 
  overridePersonalAllowance?: number, 
  taxYear: string = '2024/25'
): { tax: number; breakdown: TaxBreakdown } {
  const constants = getTaxConstants(taxYear);
  const personalAllowance = overridePersonalAllowance ?? calculatePersonalAllowance(salary, taxYear);
  
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
    const starterRateTaxable = Math.min(taxableSalary, constants.SCOTTISH_STARTER_RATE_THRESHOLD - personalAllowance);
    let starterRateTax = starterRateTaxable * constants.SCOTTISH_STARTER_RATE;
    let excessStarterRate = 0;
    
  const starterRateCap = 
    (constants.SCOTTISH_STARTER_RATE_THRESHOLD - constants.SCOTTISH_PERSONAL_ALLOWANCE) 
     * constants.SCOTTISH_STARTER_RATE;

  if (starterRateTax > starterRateCap) {
    breakdown.starter_rate = starterRateCap;
    excessStarterRate = starterRateTax - starterRateCap;
  } else {
    breakdown.starter_rate = starterRateTax;
  }

    tax += breakdown.starter_rate;
    taxableSalary -= starterRateTaxable;

    // Adjust excess starter rate to advanced rate
    const adjustedExcessStarterRate = excessStarterRate > 0 
      ? (excessStarterRate / constants.SCOTTISH_STARTER_RATE) * constants.SCOTTISH_ADVANCED_RATE 
      : 0;
    breakdown.advanced_rate += adjustedExcessStarterRate;
    tax += adjustedExcessStarterRate;
  }

  // Apply Basic Rate
  if (taxableSalary > 0) {
    const basicRateTaxable = Math.min(taxableSalary, constants.SCOTTISH_BASIC_RATE_THRESHOLD - constants.SCOTTISH_STARTER_RATE_THRESHOLD);
    breakdown.basic_rate = basicRateTaxable * constants.SCOTTISH_BASIC_RATE;
    tax += breakdown.basic_rate;
    taxableSalary -= basicRateTaxable;
  }

  // Apply Intermediate Rate
  if (taxableSalary > 0) {
    const intermediateRateTaxable = Math.min(taxableSalary, constants.SCOTTISH_INTERMEDIATE_RATE_THRESHOLD - constants.SCOTTISH_BASIC_RATE_THRESHOLD);
    breakdown.intermediate_rate = intermediateRateTaxable * constants.SCOTTISH_INTERMEDIATE_RATE;
    tax += breakdown.intermediate_rate;
    taxableSalary -= intermediateRateTaxable;
  }

  // Apply Higher Rate
  if (taxableSalary > 0) {
    const higherRateTaxable = Math.min(taxableSalary, constants.SCOTTISH_HIGHER_RATE_THRESHOLD - constants.SCOTTISH_INTERMEDIATE_RATE_THRESHOLD);
    breakdown.higher_rate = higherRateTaxable * constants.SCOTTISH_HIGHER_RATE;
    tax += breakdown.higher_rate;
    taxableSalary -= higherRateTaxable;
  }

  // Apply Advanced Rate
  if (taxableSalary > 0) {
    const advancedRateTaxable = Math.min(taxableSalary, constants.SCOTTISH_ADVANCED_RATE_THRESHOLD - constants.SCOTTISH_HIGHER_RATE_THRESHOLD);
    breakdown.advanced_rate = advancedRateTaxable * constants.SCOTTISH_ADVANCED_RATE;
    tax += breakdown.advanced_rate;
    taxableSalary -= advancedRateTaxable;
  }

  // Apply Top Rate
  if (taxableSalary > 0) {
    breakdown.top_rate = taxableSalary * constants.SCOTTISH_TOP_RATE;
    tax += breakdown.top_rate;
  }

  return { tax, breakdown };
}

// Calculate standard UK tax
export function calculateTax(
  salary: number, 
  overridePersonalAllowance?: number, 
  taxYear: string = '2024/25'
): { tax: number; breakdown: TaxBreakdown } {
  const constants = getTaxConstants(taxYear);
  const personalAllowance = overridePersonalAllowance ?? calculatePersonalAllowance(salary, taxYear);
  
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
    breakdown.basic_rate = basicRateTaxable * constants.BASIC_RATE;
    tax += breakdown.basic_rate;
    taxableSalary -= basicRateTaxable;
  }

  // Apply Higher Rate
  if (taxableSalary > 0) {
    const higherRateTaxable = Math.min(taxableSalary, 125140 - 37700);
    breakdown.higher_rate = higherRateTaxable * constants.HIGHER_RATE;
    tax += breakdown.higher_rate;
    taxableSalary -= higherRateTaxable;
  }

  // Apply Additional Rate
  if (taxableSalary > 0) {
    breakdown.additional_rate = taxableSalary * constants.ADDITIONAL_RATE;
    tax += breakdown.additional_rate;
  }

  return { tax, breakdown };
}