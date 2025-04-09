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

import { calculateScottishTax, calculateTax, calculatePersonalAllowance } from './taxCalculator';
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

export function calculateBonusMonth(inputs: BonusCalculationInputs): BonusMonthResult {
  const taxYear = inputs.taxYear || '2024/25';
  const constants = getTaxConstants(taxYear);
  
  const bonusMonthGross = inputs.regularMonthlyGross + inputs.bonusAmount;
  const annualisedIncomeWithoutBonus = inputs.regularMonthlyGross * 12;
  const annualisedIncomeWithBonus = annualisedIncomeWithoutBonus + inputs.bonusAmount;

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

// 2. Calculate personal allowance based on annualised bonus month income
  const personalAllowance = usePersonalAllowance
    ? calculatePersonalAllowance(annualisedBonusMonthIncome)
    : 0;

// 3. Monthly equivalent for tax calc
  const monthlyAllowance = personalAllowance / 12;

  // Debug log
  console.log('Annual income without bonus:', annualisedIncomeWithoutBonus);
  console.log('Annual income with bonus:', annualisedIncomeWithBonus);
  console.log('Base personal allowance:', 12570);
  console.log('Calculated bonus month allowance:', personalAllowance);
  console.log('Monthly allowance for bonus month:', monthlyAllowance);

  const isSalarySacrifice = inputs.pension?.type === 'salary_sacrifice';
  const isAutoEnrollment = ['auto_enrolment', 'auto_unbanded'].includes(inputs.pension?.type || '');

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

  // Calculate taxable income for the bonus month
  // For high earners, this should correctly reflect the reduced personal allowance
  const bonusMonthTaxableIncome = Math.max(
    0, 
    adjustedBonusMonthGross - monthlyAllowance - taxableAdjustment
  );

  console.log('Adjusted bonus month gross:', adjustedBonusMonthGross);
  console.log('Taxable adjustment (pension):', taxableAdjustment);  
  console.log('Final bonus month taxable income:', bonusMonthTaxableIncome);

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
    const regularAnnualGross = inputs.regularMonthlyGross * 12;
    const adjustedRegularIncome = isSalarySacrifice
      ? regularAnnualGross - (bonusMonthPensionContribution * 12) // note: even if bonus excluded, affects gross
      : isAutoEnrollment
        ? regularAnnualGross - (bonusMonthPensionContribution * 12) // Auto enrollment reduces taxable income
        : regularAnnualGross;

    const adjustedBonusIncome = isSalarySacrifice
      ? annualisedIncomeWithBonus - (bonusMonthPensionContribution * 12)
      : isAutoEnrollment
        ? annualisedIncomeWithBonus - (bonusMonthPensionContribution * 12) // Auto enrollment reduces taxable income
        : annualisedIncomeWithBonus;

    const regularAnnualTax = inputs.residentInScotland
      ? calculateScottishTax(adjustedRegularIncome).tax
      : calculateTax(adjustedRegularIncome).tax;

    const totalAnnualTax = inputs.residentInScotland
      ? calculateScottishTax(adjustedBonusIncome).tax
      : calculateTax(adjustedBonusIncome).tax;

    bonusMonthTax = (totalAnnualTax - regularAnnualTax) + (regularAnnualTax / 12);

    // Apply tapering reduction ONLY if personal allowance is being used
    let additionalTax = 0;
    const adjustedAnnualIncome = isSalarySacrifice
      ? annualisedIncomeWithBonus - (bonusMonthPensionContribution * 12)
      : isAutoEnrollment
        ? annualisedIncomeWithBonus - (bonusMonthPensionContribution * 12) // Auto enrollment reduces taxable income
        : annualisedIncomeWithBonus;

    if (usePersonalAllowance && adjustedAnnualIncome > 100000) {
      const personalAllowanceReduction = Math.min(
        12570,
        Math.max(0, (adjustedAnnualIncome - 100000) / 2)
      );
      additionalTax = inputs.residentInScotland
        ? (personalAllowanceReduction * SCOTTISH_HIGHER_RATE) / 12
        : (personalAllowanceReduction * HIGHER_RATE) / 12;
    }

    bonusMonthTax += additionalTax;
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
    personalAllowance: personalAllowance,
  };
}