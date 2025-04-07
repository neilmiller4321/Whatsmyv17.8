import { BLIND_PERSONS_ALLOWANCE, 
  BASIC_RATE, HIGHER_RATE, ADDITIONAL_RATE,
  SCOTTISH_STARTER_RATE, SCOTTISH_BASIC_RATE, SCOTTISH_INTERMEDIATE_RATE,
  SCOTTISH_HIGHER_RATE, SCOTTISH_ADVANCED_RATE, SCOTTISH_TOP_RATE,
  SCOTTISH_STARTER_RATE_THRESHOLD, SCOTTISH_BASIC_RATE_THRESHOLD,
  SCOTTISH_INTERMEDIATE_RATE_THRESHOLD, SCOTTISH_HIGHER_RATE_THRESHOLD,
  SCOTTISH_ADVANCED_RATE_THRESHOLD,
  NI_LOWER_THRESHOLD, NI_UPPER_THRESHOLD,
  NI_LOWER_MONTHLY_THRESHOLD, NI_UPPER_MONTHLY_THRESHOLD,
  NI_BASIC_RATE, NI_HIGHER_RATE
} from './taxConstants';
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
  };
}

// Moved from niCalculator.ts
// Calculate National Insurance
export function calculateNI(salary: number): number {
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
export function calculateMonthlyNI(salary: number): number {
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

  let pensionContribution = 0;
  if (inputs.pension && inputs.pension.value > 0) {
    const regularPensionContribution = (() => {
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

    const bonusPensionContribution = inputs.annualGrossBonus > 0 ? (() => {
      const bonusMonthGross = (inputs.annualGrossSalary / 12) + (
  inputs.pension?.includeBonusPension ? inputs.annualGrossBonus : 0
);
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

    pensionContribution = inputs.annualGrossBonus > 0
      ? (regularPensionContribution * 11) + bonusPensionContribution
      : regularPensionContribution * 12;
  }

  const adjustedGrossIncome = ['salary_sacrifice', 'auto_enrolment', 'auto_unbanded'].includes(inputs.pension?.type || 'none')
    ? annualGrossIncome - (inputs.pension.value > 0 ? pensionContribution : 0)
    : annualGrossIncome;
  
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
       : calculatePersonalAllowance(adjustedGrossIncome)) + marriageAllowanceAdjustment + (inputs.blind ? BLIND_PERSONS_ALLOWANCE : 0)
    : 0;
  
  // Calculate personal allowances
  const personalAllowanceWithBonus = usePersonalAllowance
    ? (taxCodeSettings?.numericAllowance !== undefined 
       ? taxCodeSettings.numericAllowance 
       : calculatePersonalAllowance(adjustedGrossIncome)) + marriageAllowanceAdjustment + (inputs.blind ? BLIND_PERSONS_ALLOWANCE : 0)
    : 0;

  const personalAllowanceWithoutBonus = usePersonalAllowance
    ? (taxCodeSettings?.numericAllowance !== undefined 
       ? taxCodeSettings.numericAllowance 
       : calculatePersonalAllowance(inputs.annualGrossSalary)) + marriageAllowanceAdjustment + (inputs.blind ? BLIND_PERSONS_ALLOWANCE : 0)
    : 0;

  // Monthly calculations
  const regularMonthlyGross = inputs.annualGrossSalary / 12;
  const regularMonthlyStudentLoan = calculateTotalStudentLoans(inputs.annualGrossSalary, inputs.studentLoan).monthlyRepayment;
  let regularMonthlyPensionContribution = 0;
  let regularPensionContribution = 0;
  if (inputs.pension?.value > 0) {
    regularPensionContribution = (() => {
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

  const regularMonthlyTaxableIncome = (() => {
    const salaryOnly = inputs.annualGrossSalary;
    const allowance = personalAllowanceWithoutBonus; // no bonus

    const isSalarySacrifice = inputs.pension?.type === 'salary_sacrifice';
    const isAutoEnrollment = ['auto_enrolment', 'auto_unbanded'].includes(inputs.pension?.type || '');
    let salaryAfterPension = salaryOnly;

    // Only subtract for salary sacrifice
    if (isSalarySacrifice) {
      salaryAfterPension -= calculateSalaryContribution(
        salaryOnly,
        inputs.pension.value,
        inputs.pension.valueType,
        inputs.pension.earningsBasis
      );
    }

    // For auto enrollment, also reduce taxable income (but not NI-eligible income)
    const pensionDeduction = isAutoEnrollment
      ? calculatePensionContribution(salaryOnly, {
          type: inputs.pension.type,
          value: inputs.pension.value,
          valueType: inputs.pension.valueType,
          earningsBasis: inputs.pension.earningsBasis
        })
      : 0;

    const annualTaxable = Math.max(0, salaryAfterPension - allowance - pensionDeduction);
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
      basic: 0.2, higher: 0.4, additional: 0.45,
      scottish_basic: 0.2, scottish_intermediate: 0.21,
      scottish_higher: 0.42, scottish_advanced: 0.45, scottish_top: 0.48,
    };
    const rate = rateMap[forcedRate] ?? 0.2;
    initialTax = taxable * rate;
    initialBreakdown = { [`${forcedRate.replace('_', ' ').toUpperCase()} (Tax Code Override)`]: initialTax };
  } else {
    // Determine if auto enrollment pension should reduce taxable income
    const isAutoEnrollment = ['auto_enrolment', 'auto_unbanded'].includes(inputs.pension?.type || '');
    const pensionDeduction = isAutoEnrollment ? pensionContribution : 0;

    const result = isScottish
      ? calculateScottishTax(adjustedGrossIncome - pensionDeduction, personalAllowanceWithBonus)
      : calculateTax(adjustedGrossIncome - pensionDeduction, personalAllowanceWithBonus);

    initialTax = result.tax;
    initialBreakdown = result.breakdown;
  }

  const annualTax = initialTax;

  const niAdjustedGross = inputs.pension?.type === 'salary_sacrifice'
    ? inputs.annualGrossSalary - pensionContribution
    : inputs.annualGrossSalary;
  const monthlyNiAdjustedGross = niAdjustedGross / 12;

  let employeeNI = 0;
  if (inputs.annualGrossBonus > 0) {
    const regularMonthlyNI = inputs.noNI ? 0 : calculateMonthlyNI(monthlyNiAdjustedGross);
    const bonusMonthNI = inputs.noNI ? 0 : calculateMonthlyNI(monthlyNiAdjustedGross + inputs.annualGrossBonus);
    employeeNI = bonusMonthNI + (regularMonthlyNI * 11);
  } else {
    employeeNI = inputs.noNI ? 0 : calculateNI(niAdjustedGross);
  }

  const regularMonthlyNI = inputs.noNI ? 0 : calculateMonthlyNI(monthlyNiAdjustedGross);

  const regularMonthlyTax = (() => {
    if (noTax) return 0;

    const taxable = regularMonthlyTaxableIncome;

    // Flat rate tax codes (e.g. BR, D0, D1, SD0, SD1)
    if (forcedRate) {
      const rateMap: Record<string, number> = {
        basic: 0.2, higher: 0.4, additional: 0.45,
        scottish_basic: 0.2,
        scottish_intermediate: 0.21,
        scottish_higher: 0.42,
        scottish_advanced: 0.45,
        scottish_top: 0.48,
      };

      const rate = rateMap[forcedRate] ?? 0.2;
      return taxable * rate;
    }

    // Remove require statements and use the imported constants
    if (isScottish) {
      let monthlyTax = 0;
      let remainingIncome = taxable;

      const starterMonthly = (SCOTTISH_STARTER_RATE_THRESHOLD - personalAllowanceWithoutBonus) / 12;
      const basicMonthly = (SCOTTISH_BASIC_RATE_THRESHOLD - SCOTTISH_STARTER_RATE_THRESHOLD) / 12;
      const intermediateMonthly = (SCOTTISH_INTERMEDIATE_RATE_THRESHOLD - SCOTTISH_BASIC_RATE_THRESHOLD) / 12;
      const higherMonthly = (SCOTTISH_HIGHER_RATE_THRESHOLD - SCOTTISH_INTERMEDIATE_RATE_THRESHOLD) / 12;
      const advancedMonthly = (SCOTTISH_ADVANCED_RATE_THRESHOLD - SCOTTISH_HIGHER_RATE_THRESHOLD) / 12;

      if (remainingIncome > 0) {
        const starterAmount = Math.min(remainingIncome, starterMonthly);
        monthlyTax += starterAmount * SCOTTISH_STARTER_RATE;
        remainingIncome -= starterAmount;
      }

      if (remainingIncome > 0) {
        const basicAmount = Math.min(remainingIncome, basicMonthly);
        monthlyTax += basicAmount * SCOTTISH_BASIC_RATE;
        remainingIncome -= basicAmount;
      }

      if (remainingIncome > 0) {
        const intermediateAmount = Math.min(remainingIncome, intermediateMonthly);
        monthlyTax += intermediateAmount * SCOTTISH_INTERMEDIATE_RATE;
        remainingIncome -= intermediateAmount;
      }

      if (remainingIncome > 0) {
        const higherAmount = Math.min(remainingIncome, higherMonthly);
        monthlyTax += higherAmount * SCOTTISH_HIGHER_RATE;
        remainingIncome -= higherAmount;
      }

      if (remainingIncome > 0) {
        const advancedAmount = Math.min(remainingIncome, advancedMonthly);
        monthlyTax += advancedAmount * SCOTTISH_ADVANCED_RATE;
        remainingIncome -= advancedAmount;
      }

      if (remainingIncome > 0) {
        monthlyTax += remainingIncome * SCOTTISH_TOP_RATE;
      }

      return monthlyTax;
    } else {
      // UK standard tax calculation logic
      const basicMonthly = 37700 / 12;
      const higherMonthly = (125140 - 37700) / 12;

      let monthlyTax = 0;
      let remainingIncome = taxable;

      if (remainingIncome > 0) {
        const basicAmount = Math.min(remainingIncome, basicMonthly);
        monthlyTax += basicAmount * BASIC_RATE;
        remainingIncome -= basicAmount;
      }

      if (remainingIncome > 0) {
        const higherAmount = Math.min(remainingIncome, higherMonthly);
        monthlyTax += higherAmount * HIGHER_RATE;
        remainingIncome -= higherAmount;
      }

      if (remainingIncome > 0) {
        monthlyTax += remainingIncome * ADDITIONAL_RATE;
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
    pension: inputs.pension,
  });
  
  const studentLoanCalc = calculateTotalStudentLoans(adjustedGrossIncome, inputs.studentLoan);
  
  // Recalculate annual student loan based on regular months and bonus month
  const annualStudentLoan = inputs.annualGrossBonus > 0
    ? (regularMonthlyStudentLoan * 11) + bonusMonth.studentLoan
    : regularMonthlyStudentLoan * 12;

  // Calculate total deductions using corrected student loan amount
  const combinedTaxes = annualTax + employeeNI + annualStudentLoan;
  
  // Calculate annual values including bonus
  // For auto enrollment, reduce taxable income but not NI-eligible income
  const isAutoEnrollment = ['auto_enrolment', 'auto_unbanded'].includes(inputs.pension?.type || '');
  const pensionDeduction = isAutoEnrollment ? pensionContribution : 0;
  const annualTaxableIncome = Math.max(0, adjustedGrossIncome - personalAllowance - pensionDeduction);
  
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
        { rate: "Personal Allowance", amount: personalAllowanceWithBonus - (inputs.blind ? BLIND_PERSONS_ALLOWANCE : 0) },
        ...(inputs.blind ? [{ rate: "Blind Person's Allowance", amount: BLIND_PERSONS_ALLOWANCE }] : [])
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
      value: inputs.pension?.value || 0
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