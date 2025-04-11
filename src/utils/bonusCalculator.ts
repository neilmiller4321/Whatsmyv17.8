import {
  NI_LOWER_MONTHLY_THRESHOLD,
  NI_UPPER_MONTHLY_THRESHOLD,
  NI_BASIC_RATE,
  NI_HIGHER_RATE,
  SCOTTISH_HIGHER_RATE,
  HIGHER_RATE
} from './taxConstants';

import * as taxConstants24 from './taxConstants';
import * as taxConstants25 from './taxConstants25';

// Import directly from taxRateCalculator instead of taxCalculator to avoid circular references
import { calculateScottishTax, calculateTax, calculatePersonalAllowance } from './taxRateCalculator';
import { calculateTotalStudentLoans } from './studentLoanCalculator';
import type { TaxCodeSettings } from './taxCodes';

// Get tax constants based on tax year
function getTaxConstants(taxYear: string = '2024/25') {
  return taxYear === '2025/26' ? taxConstants25 : taxConstants24;
}

// Calculate salary sacrifice contribution
function calculateSalaryContribution(
  grossSalary: number,
  pensionValue: number,
  valueType: string, 
  earningsBasis: 'total' | 'qualifying' = 'total',
  frequency: 'monthly' | 'yearly' = 'monthly'
): number {
  const PENSION_LOWER_THRESHOLD = 6240;
  const PENSION_UPPER_THRESHOLD = 50270;
  
  // For nominal/fixed values, handle monthly vs yearly correctly
  if (valueType === 'nominal' || valueType === 'fixed') {
    if (frequency === 'yearly') {
      // If yearly amount specified, return the yearly amount
      return pensionValue;
    } else {
      // If monthly amount specified, convert to yearly
      return pensionValue * 12;
    }
  }
  
  // For percentage values, calculation remains the same
  if (earningsBasis === 'total') {
    return valueType === 'percentage'
      ? grossSalary * (pensionValue / 100)
      : (frequency === 'yearly' ? pensionValue : pensionValue * 12);
  } else {
    if (grossSalary < PENSION_LOWER_THRESHOLD) {
      return 0;
    } else if (grossSalary > PENSION_UPPER_THRESHOLD) {
      const qualifyingEarnings = PENSION_UPPER_THRESHOLD - PENSION_LOWER_THRESHOLD;
      return valueType === 'percentage'
        ? qualifyingEarnings * (pensionValue / 100)
        : (frequency === 'yearly' ? pensionValue : pensionValue * 12);
    } else {
      const qualifyingEarnings = grossSalary - PENSION_LOWER_THRESHOLD;
      return valueType === 'percentage'
        ? qualifyingEarnings * (pensionValue / 100)
        : (frequency === 'yearly' ? pensionValue : pensionValue * 12);
    }
  }
}

interface BonusCalculationInputs {
  regularMonthlyGross: number;
  bonusAmount: number;
  taxCodeSettings?: TaxCodeSettings;
  monthlyNiAdjustedGross: number;
  pensionContribution: number;
  pension?: {
    type: string;
    value: number;
    valueType: string;
    frequency?: 'monthly' | 'yearly';
    includeBonusPension?: boolean;
    earningsBasis?: 'total' | 'qualifying';
  };
  studentLoanPlans: string[];
  residentInScotland: boolean;
  noNI: boolean;
  taxYear?: string;
}

interface BonusMonthResult {
  grossPay: number;
  taxableIncome: number;
  tax: number;
  ni: number;
  studentLoan: number;
  pensionContribution: number;
  takeHome: number;
  personalAllowance: number; // Add this line
  annualTaxable: number; // Add this line
}

// Calculate monthly NI for bonus month
function calculateBonusMonthNI(monthlySalary: number, taxYear: string = '2024/25'): number {
  const constants = getTaxConstants(taxYear);
  
  if (monthlySalary <= constants.NI_LOWER_MONTHLY_THRESHOLD) return 0;
  if (monthlySalary <= constants.NI_UPPER_MONTHLY_THRESHOLD) {
    return Math.floor((monthlySalary - constants.NI_LOWER_MONTHLY_THRESHOLD) * constants.NI_BASIC_RATE * 100) / 100;
  }
  return Math.floor((
    (constants.NI_UPPER_MONTHLY_THRESHOLD - constants.NI_LOWER_MONTHLY_THRESHOLD) * constants.NI_BASIC_RATE +
    (monthlySalary - constants.NI_UPPER_MONTHLY_THRESHOLD) * constants.NI_HIGHER_RATE
  ) * 100) / 100;
}

// Helper function to adjust income for personal allowance calculation based on pension
function adjustPensionForPA(income: number, pension?: {
  type: string;
  value: number;
  valueType: string;
  frequency?: 'monthly' | 'yearly';
  earningsBasis?: 'total' | 'qualifying';
}, bonusMonthPensionContribution?: number): number {
  if (!pension || pension.value <= 0) return income;
  
  // For salary sacrifice, reduce the income directly
  if (pension.type === 'salary_sacrifice') {
    return income - (bonusMonthPensionContribution * 12);
  }
  
  // For auto enrollment, reduce the income for PA calculation
  if (['auto_enrolment', 'auto_unbanded'].includes(pension.type)) {
    return income - (bonusMonthPensionContribution * 12);
  }
  
  return income;
}

export function calculateBonusMonth(inputs: BonusCalculationInputs): BonusMonthResult {
  const taxYear = inputs.taxYear || '2024/25';
  const constants = getTaxConstants(taxYear);
  
  const bonusMonthGross = inputs.regularMonthlyGross + inputs.bonusAmount;
  const annualisedIncomeWithoutBonus = inputs.regularMonthlyGross * 12;
  const annualisedIncomeWithBonus = annualisedIncomeWithoutBonus + inputs.bonusAmount;

  // Define these variables first, before they're used
  const isSalarySacrifice = inputs.pension?.type === 'salary_sacrifice';
  const isAutoEnrollment = ['auto_enrolment', 'auto_unbanded'].includes(inputs.pension?.type || '');

  let bonusMonthPensionContribution = inputs.pensionContribution;
  
  // For salary sacrifice, we need to calculate the pension contribution
  if (inputs.pension?.type === 'salary_sacrifice') {
    // For nominal values, properly handle yearly vs monthly amounts
    if (inputs.pension.valueType === 'nominal') {
      const frequency = inputs.pension.frequency || 'monthly';
      bonusMonthPensionContribution = frequency === 'yearly' 
        ? inputs.pension.value / 12  // Convert yearly to monthly
        : inputs.pension.value;      // Use monthly value directly
    } else {
      // Calculate pension contribution based on whether bonus is included
      const pensionCalcSalary = inputs.pension.includeBonusPension 
        ? bonusMonthGross * 12  // Include bonus in pension calculation
        : inputs.regularMonthlyGross * 12;  // Regular salary only
        
      bonusMonthPensionContribution = calculateSalaryContribution(
        pensionCalcSalary,
        inputs.pension.value,
        inputs.pension.valueType,
        inputs.pension.earningsBasis
      ) / 12;
    }
  }

  // For pension handling
  if (inputs.pension?.type) {
    const frequency = inputs.pension.frequency || 'monthly';
    
    // For nominal values, handle monthly vs yearly frequency
    if (inputs.pension.valueType === 'nominal') {
      // Always use the monthly value for monthly calculations
      bonusMonthPensionContribution = frequency === 'yearly' 
        ? inputs.pension.value / 12  // Convert yearly to monthly
        : inputs.pension.value;      // Use monthly value directly
    } else if (inputs.pension.type === 'salary_sacrifice') {
      // For percentage values with salary sacrifice
      const pensionCalcSalary = inputs.pension.includeBonusPension 
        ? bonusMonthGross * 12  // Include bonus in pension calculation
        : inputs.regularMonthlyGross * 12;  // Regular salary only
      
      bonusMonthPensionContribution = calculateSalaryContribution(
        pensionCalcSalary,
        inputs.pension.value,
        inputs.pension.valueType,
        inputs.pension.earningsBasis,
        frequency
      ) / 12;
    }
    // Handle other pension types if needed...
  }

  const usePersonalAllowance = inputs.taxCodeSettings?.applyPersonalAllowance ?? true;
  const forcedRate = inputs.taxCodeSettings?.forcedRate;
  const noTax = inputs.taxCodeSettings?.noTax ?? false;

  // 1. Annualise the gross for bonus month (HMRC method)
  const annualisedBonusMonthIncome = bonusMonthGross * 12;
  
  // For both salary sacrifice and auto-enrollment, we need to reduce the income by 
  // pension contributions when calculating personal allowance for high earners (>£100k)
  
  // Calculate annual pension contribution correctly
  const annualPensionContribution = (() => {
    if (!inputs.pension || inputs.pension.value <= 0) return 0;
    
    // For percentage-based pensions, calculate the amount directly
    if (inputs.pension.valueType === 'percentage') {
      const rate = inputs.pension.value / 100;
      const baseAmount = inputs.pension.includeBonusPension 
        ? annualisedIncomeWithBonus  // Include bonus in the calculation
        : annualisedIncomeWithoutBonus;  // Just the regular salary
      return baseAmount * rate;
    }
    
    // For nominal values, ensure we're using the correct annual amount
    if (inputs.pension.valueType === 'nominal') {
      const frequency = inputs.pension.frequency || 'monthly';
      return frequency === 'yearly' 
        ? inputs.pension.value  // Already an annual amount
        : inputs.pension.value * 12;  // Convert monthly to annual
    }
    
    // Fallback to the input pension contribution
    return bonusMonthPensionContribution * 12;
  })();
  
  // Now calculate the adjusted income for personal allowance correctly
  const adjustedIncomeForPA = (isSalarySacrifice || isAutoEnrollment) && inputs.pension
    ? annualisedIncomeWithBonus - annualPensionContribution
    : annualisedIncomeWithBonus;

  // Make sure the correct value is being used in our calculation
  const personalAllowance = usePersonalAllowance
    ? calculatePersonalAllowance(adjustedIncomeForPA, taxYear)
    : 0;

  // 3. Monthly equivalent for tax calc - divide by 12 to get monthly allowance
  const monthlyAllowance = personalAllowance / 12;

  // Calculate adjusted gross for tax and NI purposes separately
  let adjustedBonusMonthGross = bonusMonthGross;
  let taxableAdjustment = 0;
  
  // For salary sacrifice, reduce both NI-eligible and taxable income
  if (isSalarySacrifice) {
    adjustedBonusMonthGross -= bonusMonthPensionContribution;
  }
  
  // For auto enrollment, only reduce taxable income, not NI-eligible income
  if (isAutoEnrollment) {
    taxableAdjustment = bonusMonthPensionContribution;
  }

  // For the personal allowance calculation for high earners, we need to ensure
  // both salary sacrifice AND auto enrollment reduce the income before annualizing
  const bonusMonthAnnualizedIncome = (() => {
    // For salary sacrifice, the gross already accounts for pension reduction
    if (isSalarySacrifice) {
      return adjustedBonusMonthGross * 12;
    } 
    // For auto enrollment, explicitly reduce by pension for PA calculation
    else if (isAutoEnrollment) {
      return (bonusMonthGross - bonusMonthPensionContribution) * 12;
    } 
    // No pension, or relief-at-source (different mechanism)
    else {
      return bonusMonthGross * 12;
    }
  })();

  const bonusMonthPersonalAllowance = usePersonalAllowance
    ? calculatePersonalAllowance(bonusMonthAnnualizedIncome, taxYear)
    : 0;
  const bonusMonthMonthlyAllowance = bonusMonthPersonalAllowance / 12;

  // Ensure auto enrollment is properly handled for taxable income
  const bonusMonthTaxableIncome = Math.max(
    0,
    // For salary sacrifice, income is already reduced
    isSalarySacrifice
      ? adjustedBonusMonthGross - bonusMonthMonthlyAllowance
      // For auto enrollment, subtract both allowance and pension
      : isAutoEnrollment
        ? bonusMonthGross - bonusMonthMonthlyAllowance - bonusMonthPensionContribution
        // Otherwise just subtract allowance
        : bonusMonthGross - bonusMonthMonthlyAllowance
  );

  // Fix expected annual taxable calculation
  const annualTaxable = annualisedIncomeWithBonus - annualPensionContribution - personalAllowance;

  let bonusMonthTax = 0;

  if (noTax) {
    bonusMonthTax = 0;
  } else if (forcedRate) {
    const rateMap: Record<string, number> = {
      basic: 0.2, higher: 0.4, additional: 0.45,
      scottish_basic: 0.2, scottish_intermediate: 0.21,
      scottish_higher: 0.42, scottish_advanced: 0.45, scottish_top: 0.48,
    };
    const rate = rateMap[forcedRate] ?? 0.2;
    bonusMonthTax = bonusMonthTaxableIncome * rate;
  } else {
    // We need separate pension contribution calculations for regular months and bonus month
    // Define regularAnnualGross first - it was missing in the code
    const regularAnnualGross = inputs.regularMonthlyGross * 12;
    
    // For regular months (11 months)
    const regularMonthPensionContribution = (() => {
      if (inputs.pension?.type === 'salary_sacrifice' || isAutoEnrollment) {
        // For salary sacrifice and auto-enrollment, calculate normal contribution without bonus
        if (inputs.pension?.valueType === 'nominal') {
          const frequency = inputs.pension.frequency || 'monthly';
          return frequency === 'yearly' ? inputs.pension.value / 12 : inputs.pension.value;
        } else {
          // Use regular monthly gross for calculating normal monthly contribution
          return calculateSalaryContribution(
            regularAnnualGross,  // Use annual gross without bonus
            inputs.pension.value,
            inputs.pension.valueType,
            inputs.pension.earningsBasis,
            inputs.pension.frequency
          ) / 12;
        }
      }
      return 0;
    })();

    // Calculate the correct pension difference between regular and bonus months
    const bonusMonthPensionDifference = (() => {
      // Only calculate this if pension includes bonus
      if (!inputs.pension?.includeBonusPension) return 0;
      
      // Calculate the difference between:
      // 1. Pension contribution for month with bonus
      // 2. Regular monthly pension contribution
      if (inputs.pension?.valueType === 'percentage') {
        // For percentage-based pensions, calculate based on percentage of bonus
        const rate = inputs.pension.value / 100;
        return inputs.bonusAmount * rate;
      } else {
        // For nominal pensions, there's no difference
        return 0;
      }
    })();

    // Calculate regular annual tax correctly - this is unchanged
    const regularMonthlyPensionAdjustment = isSalarySacrifice || isAutoEnrollment 
      ? regularMonthPensionContribution 
      : 0;
    
    const adjustedRegularIncome = regularAnnualGross - (regularMonthlyPensionAdjustment * 12);

    // For bonus month, use correct pension adjustment based on whether bonus is included
    const adjustedBonusIncome = (() => {
      if (isSalarySacrifice || isAutoEnrollment) {
        const totalPensionReduction = regularMonthlyPensionAdjustment * 12;
        
        // If pension includes bonus, add the additional pension contribution from bonus
        if (inputs.pension?.includeBonusPension) {
          return annualisedIncomeWithBonus - (totalPensionReduction + bonusMonthPensionDifference);
        } else {
          // No bonus in pension - use same pension reduction as regular income
          return annualisedIncomeWithBonus - totalPensionReduction;
        }
      }
      return annualisedIncomeWithBonus;
    })();

    // Calculate regular annual tax using the appropriate tax function
    const regularAnnualTax = inputs.residentInScotland
      ? calculateScottishTax(adjustedRegularIncome, undefined, taxYear).tax
      : calculateTax(adjustedRegularIncome, undefined, taxYear).tax;

    // Calculate total annual tax with bonus included
    const totalAnnualTax = inputs.residentInScotland
      ? calculateScottishTax(adjustedBonusIncome, undefined, taxYear).tax
      : calculateTax(adjustedBonusIncome, undefined, taxYear).tax;

    // Derive the bonus month tax by subtracting 11 months of regular tax from the annual tax
    bonusMonthTax = Math.floor((totalAnnualTax - (regularAnnualTax * 11 / 12)) * 100) / 100;
  }

  // For NI calculation, use the adjustedBonusMonthGross (which is reduced for salary sacrifice only)
  const bonusMonthNI = inputs.noNI ? 0 : calculateBonusMonthNI(adjustedBonusMonthGross, taxYear);

  const bonusMonthStudentLoan = calculateTotalStudentLoans(
    adjustedBonusMonthGross * 12,
    inputs.studentLoanPlans,
    taxYear
  ).monthlyRepayment;

  const bonusMonthDeductions =
    bonusMonthTax +
    bonusMonthNI +
    bonusMonthStudentLoan +
    bonusMonthPensionContribution;

  const bonusMonthTakeHome = bonusMonthGross - bonusMonthDeductions;

  return {
    grossPay: bonusMonthGross,
    taxableIncome: bonusMonthTaxableIncome,
    tax: bonusMonthTax,
    ni: bonusMonthNI,
    studentLoan: bonusMonthStudentLoan,
    pensionContribution: bonusMonthPensionContribution,
    takeHome: bonusMonthTakeHome,
    personalAllowance: bonusMonthPersonalAllowance,
    annualTaxable: annualTaxable
  };
}