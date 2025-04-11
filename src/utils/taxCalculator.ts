import { BLIND_PERSONS_ALLOWANCE as BLIND_PERSONS_ALLOWANCE_24, 
  BASIC_RATE as BASIC_RATE_24, 
  HIGHER_RATE as HIGHER_RATE_24, 
  ADDITIONAL_RATE as ADDITIONAL_RATE_24,
  SCOTTISH_STARTER_RATE as SCOTTISH_STARTER_RATE_24, 
  SCOTTISH_BASIC_RATE as SCOTTISH_BASIC_RATE_24, 
  SCOTTISH_INTERMEDIATE_RATE as SCOTTISH_INTERMEDIATE_RATE_24,
  SCOTTISH_HIGHER_RATE as SCOTTISH_HIGHER_RATE_24, 
  SCOTTISH_ADVANCED_RATE as SCOTTISH_ADVANCED_RATE_24, 
  SCOTTISH_TOP_RATE as SCOTTISH_TOP_RATE_24,
  SCOTTISH_STARTER_RATE_THRESHOLD as SCOTTISH_STARTER_RATE_THRESHOLD_24, 
  SCOTTISH_BASIC_RATE_THRESHOLD as SCOTTISH_BASIC_RATE_THRESHOLD_24,
  SCOTTISH_INTERMEDIATE_RATE_THRESHOLD as SCOTTISH_INTERMEDIATE_RATE_THRESHOLD_24, 
  SCOTTISH_HIGHER_RATE_THRESHOLD as SCOTTISH_HIGHER_RATE_THRESHOLD_24,
  SCOTTISH_ADVANCED_RATE_THRESHOLD as SCOTTISH_ADVANCED_RATE_THRESHOLD_24,
  NI_LOWER_THRESHOLD as NI_LOWER_THRESHOLD_24, 
  NI_UPPER_THRESHOLD as NI_UPPER_THRESHOLD_24,
  NI_LOWER_MONTHLY_THRESHOLD as NI_LOWER_MONTHLY_THRESHOLD_24, 
  NI_UPPER_MONTHLY_THRESHOLD as NI_UPPER_MONTHLY_THRESHOLD_24,
  NI_BASIC_RATE as NI_BASIC_RATE_24, 
  NI_HIGHER_RATE as NI_HIGHER_RATE_24
} from './taxConstants';

import * as taxConstants25 from './taxConstants25';
import { calculateTotalStudentLoans } from './studentLoanCalculator';
import { getTaxCodeSettings } from './taxCodes';
import { calculateBonusMonth } from './bonusCalculator';
import { 
  calculateAutoEnrolmentContribution, 
  calculateAutoUnbandedContribution,
  calculateReliefAtSourceContribution,
  calculateReliefAtSourceUnbandedContribution,
  calculateSalaryContribution,
  calculatePersonalPensionContribution,
  calculatePensionContribution,
  PensionType,
  PensionValueType
} from './pensionCalculator';
import {
  calculatePersonalAllowance,
  calculateScottishTax,
  calculateTax,
  TaxBreakdown
} from './taxRateCalculator';

// Helper function to get tax constants based on tax year
function getTaxConstants(taxYear: string) {
  if (taxYear === '2025/26') {
    return {
      BLIND_PERSONS_ALLOWANCE: taxConstants25.BLIND_PERSONS_ALLOWANCE,
      BASIC_RATE: taxConstants25.BASIC_RATE,
      HIGHER_RATE: taxConstants25.HIGHER_RATE,
      ADDITIONAL_RATE: taxConstants25.ADDITIONAL_RATE,
      SCOTTISH_STARTER_RATE: taxConstants25.SCOTTISH_STARTER_RATE,
      SCOTTISH_BASIC_RATE: taxConstants25.SCOTTISH_BASIC_RATE,
      SCOTTISH_INTERMEDIATE_RATE: taxConstants25.SCOTTISH_INTERMEDIATE_RATE,
      SCOTTISH_HIGHER_RATE: taxConstants25.SCOTTISH_HIGHER_RATE,
      SCOTTISH_ADVANCED_RATE: taxConstants25.SCOTTISH_ADVANCED_RATE,
      SCOTTISH_TOP_RATE: taxConstants25.SCOTTISH_TOP_RATE,
      SCOTTISH_STARTER_RATE_THRESHOLD: taxConstants25.SCOTTISH_STARTER_RATE_THRESHOLD,
      SCOTTISH_BASIC_RATE_THRESHOLD: taxConstants25.SCOTTISH_BASIC_RATE_THRESHOLD,
      SCOTTISH_INTERMEDIATE_RATE_THRESHOLD: taxConstants25.SCOTTISH_INTERMEDIATE_RATE_THRESHOLD,
      SCOTTISH_HIGHER_RATE_THRESHOLD: taxConstants25.SCOTTISH_HIGHER_RATE_THRESHOLD,
      SCOTTISH_ADVANCED_RATE_THRESHOLD: taxConstants25.SCOTTISH_ADVANCED_RATE_THRESHOLD,
      NI_LOWER_THRESHOLD: taxConstants25.NI_LOWER_THRESHOLD,
      NI_UPPER_THRESHOLD: taxConstants25.NI_UPPER_THRESHOLD,
      NI_LOWER_MONTHLY_THRESHOLD: taxConstants25.NI_LOWER_MONTHLY_THRESHOLD,
      NI_UPPER_MONTHLY_THRESHOLD: taxConstants25.NI_UPPER_MONTHLY_THRESHOLD,
      NI_BASIC_RATE: taxConstants25.NI_BASIC_RATE,
      NI_HIGHER_RATE: taxConstants25.NI_HIGHER_RATE,
    };
  }
  
  // Default to 2024/25
  return {
    BLIND_PERSONS_ALLOWANCE: BLIND_PERSONS_ALLOWANCE_24,
    BASIC_RATE: BASIC_RATE_24,
    HIGHER_RATE: HIGHER_RATE_24,
    ADDITIONAL_RATE: ADDITIONAL_RATE_24,
    SCOTTISH_STARTER_RATE: SCOTTISH_STARTER_RATE_24,
    SCOTTISH_BASIC_RATE: SCOTTISH_BASIC_RATE_24,
    SCOTTISH_INTERMEDIATE_RATE: SCOTTISH_INTERMEDIATE_RATE_24,
    SCOTTISH_HIGHER_RATE: SCOTTISH_HIGHER_RATE_24,
    SCOTTISH_ADVANCED_RATE: SCOTTISH_ADVANCED_RATE_24,
    SCOTTISH_TOP_RATE: SCOTTISH_TOP_RATE_24,
    SCOTTISH_STARTER_RATE_THRESHOLD: SCOTTISH_STARTER_RATE_THRESHOLD_24,
    SCOTTISH_BASIC_RATE_THRESHOLD: SCOTTISH_BASIC_RATE_THRESHOLD_24,
    SCOTTISH_INTERMEDIATE_RATE_THRESHOLD: SCOTTISH_INTERMEDIATE_RATE_THRESHOLD_24,
    SCOTTISH_HIGHER_RATE_THRESHOLD: SCOTTISH_HIGHER_RATE_THRESHOLD_24,
    SCOTTISH_ADVANCED_RATE_THRESHOLD: SCOTTISH_ADVANCED_RATE_THRESHOLD_24,
    NI_LOWER_THRESHOLD: NI_LOWER_THRESHOLD_24,
    NI_UPPER_THRESHOLD: NI_UPPER_THRESHOLD_24,
    NI_LOWER_MONTHLY_THRESHOLD: NI_LOWER_MONTHLY_THRESHOLD_24,
    NI_UPPER_MONTHLY_THRESHOLD: NI_UPPER_MONTHLY_THRESHOLD_24,
    NI_BASIC_RATE: NI_BASIC_RATE_24,
    NI_HIGHER_RATE: NI_HIGHER_RATE_24,
  };
}

// Moved from taxTypes.ts - Define TaxInputs interface here
export interface TaxInputs {
  taxCode?: string;
  annualGrossSalary: number;
  annualGrossBonus: number;
  studentLoan: string[];
  residentInScotland: boolean;
  noNI: boolean;
  blind: boolean;
  taxYear: string;
  pension?: {
    type: PensionType;
    value: number;
    valueType: PensionValueType;
    includeBonusPension?: boolean;
    earningsBasis?: 'total' | 'qualifying';
    frequency?: 'monthly' | 'yearly'; // Make sure frequency is in the interface
  };
}

// Moved from niCalculator.ts
// Calculate National Insurance
export function calculateNI(salary: number, taxYear: string = '2024/25'): number {
  const { 
    NI_LOWER_THRESHOLD, 
    NI_UPPER_THRESHOLD,
    NI_BASIC_RATE,
    NI_HIGHER_RATE
  } = getTaxConstants(taxYear);
  
  if (salary <= NI_LOWER_THRESHOLD) {
    return 0;
  } else if (salary <= NI_UPPER_THRESHOLD) {
    const niEligibleAmount = salary - NI_LOWER_THRESHOLD;
    return Math.floor(niEligibleAmount * NI_BASIC_RATE * 100) / 100;
  } else {
    const basicRateAmount = (NI_UPPER_THRESHOLD - NI_LOWER_THRESHOLD) * NI_BASIC_RATE;
    const higherRateAmount = (salary - NI_UPPER_THRESHOLD) * NI_HIGHER_RATE;
    return Math.floor((basicRateAmount + higherRateAmount) * 100) / 100;
  }
}

// Calculate monthly NI
export function calculateMonthlyNI(salary: number, taxYear: string = '2024/25'): number {
  const {
    NI_LOWER_MONTHLY_THRESHOLD,
    NI_UPPER_MONTHLY_THRESHOLD,
    NI_BASIC_RATE,
    NI_HIGHER_RATE
  } = getTaxConstants(taxYear);
  
  if (salary <= NI_LOWER_MONTHLY_THRESHOLD) {
    return 0;
  } else if (salary <= NI_UPPER_MONTHLY_THRESHOLD) {
    const niEligibleAmount = salary - NI_LOWER_MONTHLY_THRESHOLD;
    return Math.floor(niEligibleAmount * NI_BASIC_RATE * 100) / 100;
  } else {
    const basicRateAmount = (NI_UPPER_MONTHLY_THRESHOLD - NI_LOWER_MONTHLY_THRESHOLD) * NI_BASIC_RATE;
    const higherRateAmount = (salary - NI_UPPER_MONTHLY_THRESHOLD) * NI_HIGHER_RATE;
    return Math.floor((basicRateAmount + higherRateAmount) * 100) / 100;
  }
}

// Main tax calculation function
export function calculateTaxes(inputs: TaxInputs) {
  const annualGrossIncome = inputs.annualGrossSalary + inputs.annualGrossBonus;
  const taxYear = inputs.taxYear || '2024/25';
  const taxConstants = getTaxConstants(taxYear);

  let pensionContribution = 0;
  if (inputs.pension && inputs.pension.value > 0) {
    // Make sure we're getting the pension frequency correctly from the input
    const frequency = inputs.pension?.frequency || 'monthly';
    
    // For both nominal and percentage values, pass frequency properly
    const regularPensionContribution = (() => {
      // For nominal pension values, handle monthly vs yearly frequency
      if (inputs.pension.valueType === 'nominal') {
        return frequency === 'yearly' 
          ? inputs.pension.value / 12 
          : inputs.pension.value;
      }
      
      switch (inputs.pension.type) {
        case 'auto_enrolment':
          return calculateAutoEnrolmentContribution(
            inputs.annualGrossSalary, 
            inputs.pension.value, 
            inputs.pension.valueType,
            frequency
          ) / 12;
        case 'auto_unbanded':
          return calculateAutoUnbandedContribution(
            inputs.annualGrossSalary, 
            inputs.pension.value, 
            inputs.pension.valueType,
            frequency
          ) / 12;
        case 'relief_at_source':
          return calculateReliefAtSourceContribution(
            inputs.annualGrossSalary, 
            inputs.pension.value, 
            inputs.pension.valueType, 
            inputs.pension.earningsBasis,
            frequency
          ) / 12;
        case 'relief_at_source_unbanded':
          return calculateReliefAtSourceUnbandedContribution(
            inputs.annualGrossSalary, 
            inputs.pension.value, 
            inputs.pension.valueType,
            frequency
          ) / 12;
        case 'salary_sacrifice':
          return calculateSalaryContribution(
            inputs.annualGrossSalary, 
            inputs.pension.value, 
            inputs.pension.valueType, 
            inputs.pension.earningsBasis,
            frequency
          ) / 12;
        case 'personal':
          return calculatePersonalPensionContribution(
            inputs.annualGrossSalary, 
            inputs.pension.value, 
            inputs.pension.valueType, 
            inputs.pension.earningsBasis,
            frequency
          ) / 12;
        default:
          return 0;
      }
    })();

    // For nominal values with bonus month, properly handle bonus contribution
    const bonusPensionContribution = inputs.annualGrossBonus > 0 ? (() => {
      const bonusMonthGross = (inputs.annualGrossSalary / 12) + (
        inputs.pension?.includeBonusPension ? inputs.annualGrossBonus : 0
      );
      
      // For nominal values, don't recalculate but use the monthly amount
      if (inputs.pension.valueType === 'nominal') {
        const frequency = inputs.pension.frequency || 'monthly';
        return frequency === 'yearly' 
          ? inputs.pension.value / 12 
          : inputs.pension.value;
      }
      
      // For percentages, continue using the existing calculation
      switch (inputs.pension.type) {
        case 'auto_enrolment':
          return calculateAutoEnrolmentContribution(bonusMonthGross * 12, inputs.pension.value) / 12;
        case 'auto_unbanded':
          return calculateAutoUnbandedContribution(bonusMonthGross * 12, inputs.pension.value, inputs.pension.valueType) / 12;
        case 'relief_at_source':
          return calculateReliefAtSourceContribution(bonusMonthGross * 12, inputs.pension.value, inputs.pension.valueType, inputs.pension.earningsBasis) / 12;
        case 'relief_at_source_unbanded':
          return calculateReliefAtSourceUnbandedContribution(bonusMonthGross * 12, inputs.pension.value, inputs.pension.valueType) / 12;
        case 'salary_sacrifice':
          return calculateSalaryContribution(bonusMonthGross * 12, inputs.pension.value, inputs.pension.valueType, inputs.pension.earningsBasis) / 12;
        case 'personal':
          return calculatePersonalPensionContribution(bonusMonthGross * 12, inputs.pension.value, inputs.pension.valueType, inputs.pension.earningsBasis) / 12;
        default:
          return 0;
      }
    })() : 0;

    // Fix the yearly nominal calculation - for ALL cases
    if (inputs.pension.valueType === 'nominal') {
      // Always check against the original inputs.pension.frequency
      if (inputs.pension.frequency === 'yearly') {
        // For yearly nominal values, use the exact input value regardless of bonus
        pensionContribution = inputs.pension.value;
      } else {
        // For monthly nominal values, multiply by 12 (bonus shouldn't affect total)
        pensionContribution = inputs.pension.value * 12;
      }
    } else {
      // For percentage values, continue using existing calculation with bonus
      pensionContribution = inputs.annualGrossBonus > 0
        ? (regularPensionContribution * 11) + bonusPensionContribution
        : regularPensionContribution * 12;
    }
  }

  // Update the adjusted gross income calculation
  // For salary sacrifice: reduce BOTH taxable income and NI-eligible income
  // For auto enrollment: reduce ONLY taxable income
  const adjustedGrossIncome = (() => {
    if (inputs.pension?.value > 0) {
      if (inputs.pension.type === 'salary_sacrifice') {
        // Salary sacrifice reduces both tax and NI eligible income
        return annualGrossIncome - pensionContribution;
      } else if (['auto_enrolment', 'auto_unbanded'].includes(inputs.pension.type)) {
        // For auto enrollment, gross income remains the same for NI purposes
        // but we'll handle the reduction for tax calculations separately
        return annualGrossIncome;
      }
    }
    return annualGrossIncome;
  })();
  
  // Extract tax code overrides
  const taxCodeSettings = inputs.taxCode ? getTaxCodeSettings(inputs.taxCode) : null;

  const isScottish = taxCodeSettings?.forceScottish ?? inputs.residentInScotland;
  const usePersonalAllowance = taxCodeSettings ? taxCodeSettings.applyPersonalAllowance : true;
  const noTax = taxCodeSettings?.noTax ?? false;
  const forcedRate = taxCodeSettings?.forcedRate;
  const marriageAllowanceAdjustment = (() => {
    if (!taxCodeSettings) return 0;
    if (taxCodeSettings.code === 'M') return 1260;  // You gain 10% extra allowance
    if (taxCodeSettings.code === 'N') return -1260; // You give away 10% of your allowance
    return 0;
  })();
  
  // Calculate personal allowance
  const personalAllowance = usePersonalAllowance
    ? (taxCodeSettings?.numericAllowance !== undefined 
       ? taxCodeSettings.numericAllowance 
       : calculatePersonalAllowance(adjustedGrossIncome)) + marriageAllowanceAdjustment + (inputs.blind ? taxConstants.BLIND_PERSONS_ALLOWANCE : 0)
    : 0;
  
  // Calculate personal allowances
  const personalAllowanceWithBonus = usePersonalAllowance
    ? (taxCodeSettings?.numericAllowance !== undefined 
       ? taxCodeSettings.numericAllowance 
       : calculatePersonalAllowance(adjustPensionForPA(adjustedGrossIncome, inputs.pension))) + marriageAllowanceAdjustment + (inputs.blind ? taxConstants.BLIND_PERSONS_ALLOWANCE : 0)
    : 0;

  const personalAllowanceWithoutBonus = usePersonalAllowance
  ? (
      (taxCodeSettings?.numericAllowance !== undefined 
        ? taxCodeSettings.numericAllowance 
        : calculatePersonalAllowance(adjustPensionForPA(inputs.annualGrossSalary, inputs.pension))) + 
      marriageAllowanceAdjustment + 
      (inputs.blind ? taxConstants.BLIND_PERSONS_ALLOWANCE : 0)
    )
  : 0;

  // Helper function to adjust income for personal allowance calculation based on pension
  function adjustPensionForPA(income: number, pension?: TaxInputs['pension']): number {
    if (!pension || pension.value <= 0) return income;
    
    // For salary sacrifice, reduce the income directly
    if (pension.type === 'salary_sacrifice') {
      return income - calculateSalaryContribution(
        income,
        pension.value,
        pension.valueType,
        pension.earningsBasis,
        pension.frequency
      );
    }
    
    // For auto enrollment types, also reduce the income
    if (['auto_enrolment', 'auto_unbanded'].includes(pension.type)) {
      return income - calculatePensionContribution(income, {
        type: pension.type,
        value: pension.value,
        valueType: pension.valueType,
        earningsBasis: pension.earningsBasis,
        frequency: pension.frequency
      });
    }
    
    // For relief at source, do not reduce income for PA calculation
    return income;
  }

  const regularMonthlyGross = inputs.annualGrossSalary / 12;
  const regularMonthlyStudentLoan = calculateTotalStudentLoans(inputs.annualGrossSalary, inputs.studentLoan, taxYear).monthlyRepayment;
  let regularMonthlyPensionContribution = 0;
  let regularPensionContribution = 0;
  if (inputs.pension?.value > 0) {
    // Explicitly get frequency from original input
    const frequency = inputs.pension.frequency || 'monthly';
    
    regularPensionContribution = (() => {
      // For nominal pension values, properly handle frequency
      if (inputs.pension.valueType === 'nominal') {
        return frequency === 'yearly' 
          ? inputs.pension.value / 12 
          : inputs.pension.value;
      }
      
      switch (inputs.pension.type) {
        case 'auto_enrolment':
          return calculateAutoEnrolmentContribution(inputs.annualGrossSalary, inputs.pension.value) / 12;
        case 'auto_unbanded':
          return calculateAutoUnbandedContribution(inputs.annualGrossSalary, inputs.pension.value, inputs.pension.valueType) / 12;
        case 'relief_at_source':
          return calculateReliefAtSourceContribution(inputs.annualGrossSalary, inputs.pension.value, inputs.pension.valueType, inputs.pension.earningsBasis) / 12;
        case 'relief_at_source_unbanded':
          return calculateReliefAtSourceUnbandedContribution(inputs.annualGrossSalary, inputs.pension.value, inputs.pension.valueType) / 12;
        case 'salary_sacrifice':
          return calculateSalaryContribution(inputs.annualGrossSalary, inputs.pension.value, inputs.pension.valueType, inputs.pension.earningsBasis) / 12;
        case 'personal':
          return calculatePersonalPensionContribution(inputs.annualGrossSalary, inputs.pension.value, inputs.pension.valueType, inputs.pension.earningsBasis) / 12;
        default:
          return 0;
      }
    })();

    switch (inputs.pension.type) {
      case 'auto_enrolment':
      case 'auto_unbanded':
      case 'relief_at_source':
      case 'relief_at_source_unbanded':
      case 'salary_sacrifice':
      case 'personal':
        regularMonthlyPensionContribution = regularPensionContribution;
        break;
    }
  }

  // Update the regular monthly taxable income calculation
  const regularMonthlyTaxableIncome = (() => {
    const salaryOnly = inputs.annualGrossSalary;
    const allowance = personalAllowanceWithoutBonus; // no bonus

    // First, determine if pension affects taxable income
    const isSalarySacrifice = inputs.pension?.type === 'salary_sacrifice';
    const isAutoEnrollment = ['auto_enrolment', 'auto_unbanded'].includes(inputs.pension?.type || '');
    const isReliefAtSource = ['relief_at_source', 'relief_at_source_unbanded'].includes(inputs.pension?.type || '');
    
    // Start with base salary
    let salaryAfterPension = salaryOnly;

    // For salary sacrifice, reduce the actual salary
    if (isSalarySacrifice) {
      salaryAfterPension -= calculateSalaryContribution(
        salaryOnly,
        inputs.pension.value,
        inputs.pension.valueType,
        inputs.pension.earningsBasis,
        inputs.pension.frequency
      );
    }

    // For auto enrollment, calculate the pension deduction separately
    // We don't reduce the salary as with salary sacrifice, but we do reduce the taxable amount
    const pensionDeduction = isAutoEnrollment
      ? calculatePensionContribution(salaryOnly, {
          type: inputs.pension.type,
          value: inputs.pension.value,
          valueType: inputs.pension.valueType,
          earningsBasis: inputs.pension.earningsBasis,
          frequency: inputs.pension.frequency
        })
      : 0;

    // Relief at source gets tax relief via a different mechanism, so no deduction here
    const reliefAtSourceDeduction = 0; // Not applied to taxable income

    // Calculate the final taxable income
    const annualTaxable = Math.max(0, salaryAfterPension - allowance - pensionDeduction - reliefAtSourceDeduction);
    return annualTaxable / 12;
  })();

  let initialTax = 0;
  let initialBreakdown: TaxBreakdown = {};

  if (noTax) {
    initialTax = 0;
    initialBreakdown = { 'No Tax (NT Code)': 0 };
  } else if (forcedRate) {
    const pensionDeduction = 0;  // This variable is defined here for scope in the taxable calculation
    const taxable = Math.max(0, adjustedGrossIncome - personalAllowanceWithBonus - pensionDeduction);
    const rateMap: Record<string, number> = {
      basic: taxConstants.BASIC_RATE,
      higher: taxConstants.HIGHER_RATE, 
      additional: taxConstants.ADDITIONAL_RATE,
      scottish_basic: taxConstants.SCOTTISH_BASIC_RATE,
      scottish_intermediate: taxConstants.SCOTTISH_INTERMEDIATE_RATE,
      scottish_higher: taxConstants.SCOTTISH_HIGHER_RATE,
      scottish_advanced: taxConstants.SCOTTISH_ADVANCED_RATE,
      scottish_top: taxConstants.SCOTTISH_TOP_RATE,
    };
    const rate = rateMap[forcedRate] ?? taxConstants.BASIC_RATE;
    initialTax = taxable * rate;
    initialBreakdown = { [`${forcedRate.replace('_', ' ').toUpperCase()} (Tax Code Override)`]: initialTax };
  } else {
    // For auto enrollment and relief at source, reduce taxable income but not NI-eligible income
    const isAutoEnrollment = ['auto_enrolment', 'auto_unbanded'].includes(inputs.pension?.type || '');
    const isReliefAtSource = ['relief_at_source', 'relief_at_source_unbanded'].includes(inputs.pension?.type || '');
    
    // Calculate tax deduction based on pension type
    let taxableIncomeAdjustment = 0;
    
    if (isAutoEnrollment) {
      // Auto enrollment reduces taxable income
      taxableIncomeAdjustment = pensionContribution;
    } else if (isReliefAtSource) {
      // Relief at source gets tax relief differently (via HMRC adding basic rate tax relief)
      // So we don't reduce the taxable income for this calculation
      taxableIncomeAdjustment = 0;
    } else if (inputs.pension?.type === 'salary_sacrifice') {
      // Salary sacrifice already affected the adjustedGrossIncome, so no additional adjustment needed
      taxableIncomeAdjustment = 0;
    }
    
    // Calculate tax on the properly adjusted income
    const result = isScottish
      ? calculateScottishTax(adjustedGrossIncome - taxableIncomeAdjustment, personalAllowanceWithBonus, taxYear)
      : calculateTax(adjustedGrossIncome - taxableIncomeAdjustment, personalAllowanceWithBonus);

    initialTax = result.tax;
    initialBreakdown = result.breakdown;
  }

  const annualTax = initialTax;

  // Fix NI-adjusted gross calculation for different pension types
  const niAdjustedGross = inputs.pension?.type === 'salary_sacrifice'
    ? inputs.annualGrossSalary - pensionContribution  // Only salary sacrifice affects NI
    : inputs.annualGrossSalary;                       // Other pension types (including auto enrollment) don't affect NI
  const monthlyNiAdjustedGross = niAdjustedGross / 12;

  let employeeNI = 0;
  if (inputs.annualGrossBonus > 0) {
    const regularMonthlyNI = inputs.noNI ? 0 : calculateMonthlyNI(monthlyNiAdjustedGross, taxYear);
    const bonusMonthNI = inputs.noNI ? 0 : calculateMonthlyNI(monthlyNiAdjustedGross + inputs.annualGrossBonus, taxYear);
    employeeNI = bonusMonthNI + (regularMonthlyNI * 11);
  } else {
    employeeNI = inputs.noNI ? 0 : calculateNI(niAdjustedGross, taxYear);
  }

  const regularMonthlyNI = inputs.noNI ? 0 : calculateMonthlyNI(monthlyNiAdjustedGross, taxYear);

  const regularMonthlyTax = (() => {
    if (noTax) return 0;

    const taxable = regularMonthlyTaxableIncome;

    // Flat rate tax codes (e.g. BR, D0, D1, SD0, SD1)
    if (forcedRate) {
      const rateMap: Record<string, number> = {
        basic: taxConstants.BASIC_RATE,
        higher: taxConstants.HIGHER_RATE, 
        additional: taxConstants.ADDITIONAL_RATE,
        scottish_basic: taxConstants.SCOTTISH_BASIC_RATE,
        scottish_intermediate: taxConstants.SCOTTISH_INTERMEDIATE_RATE,
        scottish_higher: taxConstants.SCOTTISH_HIGHER_RATE,
        scottish_advanced: taxConstants.SCOTTISH_ADVANCED_RATE,
        scottish_top: taxConstants.SCOTTISH_TOP_RATE,
      };

      const rate = rateMap[forcedRate] ?? taxConstants.BASIC_RATE;
      return taxable * rate;
    }

    // For Scottish taxpayers, use a simplified approach
    if (isScottish) {
      // Calculate annual tax and divide by 12 to get monthly tax
      // This ensures consistency with the annual calculation
      
      // First, annualize the monthly taxable income
      const annualizedTaxableIncome = taxable * 12;
      
      // Apply the personal allowance - important for accurate calculation
      // We need to add it back because calculateScottishTax will apply it again
      const incomeForTaxCalc = annualizedTaxableIncome + personalAllowanceWithoutBonus;
      
      // Use our existing Scottish tax calculation function
      // This ensures all thresholds and rates are applied correctly
      const annualTaxResult = calculateScottishTax(
        incomeForTaxCalc,
        personalAllowanceWithoutBonus,
        taxYear
      );
      
      // Divide by 12 to get the monthly figure
      return annualTaxResult.tax / 12;
    } 
    else {
      // UK standard tax calculation logic - use tax year specific rate bands
      const basicMonthly = 37700 / 12;
      const higherMonthly = (125140 - 37700) / 12;

      let monthlyTax = 0;
      let remainingIncome = taxable;

      if (remainingIncome > 0) {
        const basicAmount = Math.min(remainingIncome, basicMonthly);
        monthlyTax += basicAmount * taxConstants.BASIC_RATE;
        remainingIncome -= basicAmount;
      }

      if (remainingIncome > 0) {
        const higherAmount = Math.min(remainingIncome, higherMonthly);
        monthlyTax += higherAmount * taxConstants.HIGHER_RATE;
        remainingIncome -= higherAmount;
      }

      if (remainingIncome > 0) {
        monthlyTax += remainingIncome * taxConstants.ADDITIONAL_RATE;
      }

      return monthlyTax;
    }
  })();

  const regularMonthlyTakeHome = regularMonthlyGross - regularMonthlyTax - regularMonthlyNI - regularMonthlyStudentLoan - regularMonthlyPensionContribution;

  // Calculate bonus month
  const bonusMonth = calculateBonusMonth({
    regularMonthlyGross,
    bonusAmount: inputs.annualGrossBonus,
    taxCodeSettings,
    monthlyNiAdjustedGross,
    pensionContribution: inputs.pension?.value > 0 ? (() => {
      const bonusMonthGross = regularMonthlyGross + (
        inputs.pension?.includeBonusPension ? inputs.annualGrossBonus : 0);
      
      // For nominal pension values, use the correct monthly amount
      if (inputs.pension.valueType === 'nominal') {
        const frequency = inputs.pension.frequency || 'monthly';
        return frequency === 'yearly' 
          ? inputs.pension.value / 12  // Always divide yearly by 12
          : inputs.pension.value;      // Use monthly as-is
      }
      
      // For percentage values, use existing calculation
      switch (inputs.pension.type) {
        case 'auto_enrolment':
          return calculateAutoEnrolmentContribution(bonusMonthGross * 12, inputs.pension.value) / 12;
        case 'auto_unbanded':
          return calculateAutoUnbandedContribution(bonusMonthGross * 12, inputs.pension.value, inputs.pension.valueType) / 12;
        case 'relief_at_source':
          return calculateReliefAtSourceContribution(bonusMonthGross * 12, inputs.pension.value, inputs.pension.valueType, inputs.pension.earningsBasis) / 12;
        case 'relief_at_source_unbanded':
          return calculateReliefAtSourceUnbandedContribution(bonusMonthGross * 12, inputs.pension.value, inputs.pension.valueType) / 12;
        case 'salary_sacrifice':
          return calculateSalaryContribution(bonusMonthGross * 12, inputs.pension.value, inputs.pension.valueType, inputs.pension.earningsBasis) / 12;
        case 'personal':
          return calculatePersonalPensionContribution(bonusMonthGross * 12, inputs.pension.value, inputs.pension.valueType, inputs.pension.earningsBasis) / 12;
        default:
          return 0;
      }
    })() : 0,
    studentLoanPlans: inputs.studentLoan,
    residentInScotland: inputs.residentInScotland,
    noNI: inputs.noNI,
    pensionType: inputs.pension?.type || 'none',
    pension: inputs.pension ? {
      ...inputs.pension,
      // Make sure we forward exactly the same frequency as in the input
      frequency: inputs.pension.frequency
    } : undefined,
    taxYear: taxYear, // Pass the tax year
  });
  
  const studentLoanCalc = calculateTotalStudentLoans(adjustedGrossIncome, inputs.studentLoan, taxYear);
  
  // Recalculate annual student loan based on regular months and bonus month
  const annualStudentLoan = inputs.annualGrossBonus > 0
    ? (regularMonthlyStudentLoan * 11) + bonusMonth.studentLoan
    : regularMonthlyStudentLoan * 12;

  // Calculate total deductions using corrected student loan amount
  const combinedTaxes = annualTax + employeeNI + annualStudentLoan;
  
  // Calculate annual values including bonus
  // For auto enrollment, reduce taxable income but not NI-eligible income
  const isAutoEnrollment = ['auto_enrolment', 'auto_unbanded'].includes(inputs.pension?.type || '');
  
  // For auto enrollment, always deduct the pension contribution
  const annualTaxableIncome = Math.max(0, adjustedGrossIncome - personalAllowanceWithBonus - 
    (isAutoEnrollment ? pensionContribution : 0));
  
  // Calculate take-home pay
  const takeHomePay = annualGrossIncome - combinedTaxes - pensionContribution;
  
  // Calculate monthly and weekly take-home
  const monthlyTakeHome = (inputs.annualGrossSalary - (combinedTaxes * (inputs.annualGrossSalary / annualGrossIncome)) - (pensionContribution * (inputs.annualGrossSalary / annualGrossIncome))) / 12;
  const weeklyTakeHome = takeHomePay / 52;

  // Return the final result structure
  return {
    annualGrossIncome: {
      total: annualGrossIncome,
      taxableIncome: annualTaxableIncome,
      breakdown: [
        { rate: "Annual Gross Salary", amount: inputs.annualGrossSalary },
        { rate: "Annual Gross Bonus", amount: inputs.annualGrossBonus }
      ]
    },
    taxAllowance: {
      total: personalAllowanceWithBonus,
      breakdown: [
        { rate: "Personal Allowance", amount: personalAllowanceWithBonus - (inputs.blind ? taxConstants.BLIND_PERSONS_ALLOWANCE : 0) },
        ...(inputs.blind ? [{ rate: "Blind Person's Allowance", amount: taxConstants.BLIND_PERSONS_ALLOWANCE }] : [])
      ]
    },
    taxableIncome: annualTaxableIncome,
    incomeTax: {
      total: annualTax,
      breakdown: Object.entries(initialBreakdown).map(([rate, amount]) => ({
        rate: rate.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        amount
      }))
    },
    employeeNI: {
      total: employeeNI,
      breakdown: []
    },
    studentLoanRepayments: {
      total: annualStudentLoan,
      breakdown: studentLoanCalc.breakdown.map(item => ({
        rate: item.plan.replace('plan', 'Plan '),
        amount: inputs.annualGrossBonus > 0
          ? (item.monthlyRepayment * 11) + (bonusMonth.studentLoan * (item.monthlyRepayment / regularMonthlyStudentLoan))
          : item.monthlyRepayment * 12
      }))
    },
    pensionContribution: {
      total: pensionContribution,
      type: inputs.pension?.type || 'none',
      valueType: inputs.pension?.valueType || 'percentage',
      value: inputs.pension?.value || 0,
      // Add frequency to help debug/display
      frequency: inputs.pension?.frequency
    },
    combinedTaxes,
    takeHomePay,
    monthlyTakeHome,
    weeklyTakeHome: monthlyTakeHome * 12 / 52,
    bonusMonth,
    regularMonth: {
      grossPay: regularMonthlyGross,
      taxableIncome: regularMonthlyTaxableIncome,
      tax: regularMonthlyTax,
      ni: regularMonthlyNI,
      studentLoan: regularMonthlyStudentLoan,
      pensionContribution: regularMonthlyPensionContribution,
      takeHome: regularMonthlyTakeHome
    }
  };
}

// Export necessary types for external use
export type { PensionType, PensionValueType };
export { calculatePersonalAllowance, calculateScottishTax, calculateTax };