import {
  NI_LOWER_MONTHLY_THRESHOLD,
  NI_UPPER_MONTHLY_THRESHOLD,
  NI_BASIC_RATE,
  NI_HIGHER_RATE,
  SCOTTISH_HIGHER_RATE,
  HIGHER_RATE
} from './taxConstants';

import { calculateScottishTax, calculateTax, calculatePersonalAllowance } from './taxCalculator';
import { calculateTotalStudentLoans } from './studentLoanCalculator';
import type { TaxCodeSettings } from './taxCodes';

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
    includeBonusInPension?: boolean;
    earningsBasis?: 'total' | 'qualifying';
  };
  studentLoanPlans: string[];
  residentInScotland: boolean;
  noNI: boolean;
}

interface BonusMonthResult {
  grossPay: number;
  taxableIncome: number;
  tax: number;
  ni: number;
  studentLoan: number;
  pensionContribution: number;
  takeHome: number;
}

// Calculate monthly NI for bonus month
function calculateBonusMonthNI(monthlySalary: number): number {
  if (monthlySalary <= NI_LOWER_MONTHLY_THRESHOLD) return 0;
  if (monthlySalary <= NI_UPPER_MONTHLY_THRESHOLD) {
    return Math.floor((monthlySalary - NI_LOWER_MONTHLY_THRESHOLD) * NI_BASIC_RATE * 100) / 100;
  }
  return Math.floor((
    (NI_UPPER_MONTHLY_THRESHOLD - NI_LOWER_MONTHLY_THRESHOLD) * NI_BASIC_RATE +
    (monthlySalary - NI_UPPER_MONTHLY_THRESHOLD) * NI_HIGHER_RATE
  ) * 100) / 100;
}

export function calculateBonusMonth(inputs: BonusCalculationInputs): BonusMonthResult {
  const bonusMonthGross = inputs.regularMonthlyGross + inputs.bonusAmount;
  const annualisedIncomeWithBonus = inputs.regularMonthlyGross * 12 + inputs.bonusAmount;

  let bonusMonthPensionContribution = inputs.pensionContribution;
  
  // For salary sacrifice, we need to calculate the pension contribution
  // even if includeBonusPension is false, as it still affects taxable income and NI
  if (inputs.pension?.type === 'salary_sacrifice') {
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

  const usePersonalAllowance = inputs.taxCodeSettings?.applyPersonalAllowance ?? true;
  const forcedRate = inputs.taxCodeSettings?.forcedRate;
  const noTax = inputs.taxCodeSettings?.noTax ?? false;

  const personalAllowance = usePersonalAllowance
    ? calculatePersonalAllowance(annualisedIncomeWithBonus)
    : 0;

  const monthlyAllowance = personalAllowance / 12;
  const isSalarySacrifice = inputs.pension?.type === 'salary_sacrifice';
  const isAutoEnrollment = ['auto_enrolment', 'auto_unbanded'].includes(inputs.pension?.type || '');

  // Calculate adjusted gross for tax and NI purposes
  let adjustedBonusMonthGross = bonusMonthGross;
  
  // For salary sacrifice, always reduce the gross amount for tax and NI calculations
  // regardless of whether the bonus is included in the pension calculation
  if (isSalarySacrifice) {
    adjustedBonusMonthGross -= bonusMonthPensionContribution;
  }

  // For auto enrollment, reduce taxable income but not NI-eligible income
  const bonusMonthTaxableIncome = Math.max(
    0,
    adjustedBonusMonthGross - monthlyAllowance - (isAutoEnrollment ? bonusMonthPensionContribution : 0)
  );

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

  // For NI calculation, use the adjusted gross for salary sacrifice
  const bonusMonthNI = inputs.noNI ? 0 : calculateBonusMonthNI(adjustedBonusMonthGross);

  const bonusMonthStudentLoan = calculateTotalStudentLoans(
    adjustedBonusMonthGross * 12,
    inputs.studentLoanPlans
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
    takeHome: bonusMonthTakeHome
  };
}