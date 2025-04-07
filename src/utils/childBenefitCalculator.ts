// Constants for 2024/25 tax year
export const FIRST_CHILD_RATE = 26.05; // Weekly rate for first child
export const ADDITIONAL_CHILD_RATE = 17.25; // Weekly rate for each additional child
export const HICBC_THRESHOLD = 60000; // High Income Child Benefit Charge threshold (£60,000)
export const HICBC_UPPER_LIMIT = 80000; // Upper limit for HICBC (£80,000)
export const HICBC_STEP = 200; // Amount per 1% charge (£200)

export interface ChildBenefitResult {
  weeklyAmount: number;
  fourWeeklyAmount: number;
  annualAmount: number;
  firstChildAmount: number;
  additionalChildrenAmount: number;
  taxCharge: number;
  netBenefit: number;
  chargePercentage: number;
}

export function calculateChildBenefit(
  numberOfChildren: number,
  highestIncome: number
): ChildBenefitResult {
  // Calculate base amounts
  const firstChildAmount = FIRST_CHILD_RATE;
  const additionalChildrenAmount = (numberOfChildren - 1) * ADDITIONAL_CHILD_RATE;
  const weeklyAmount = firstChildAmount + additionalChildrenAmount;
  const fourWeeklyAmount = weeklyAmount * 4;
  const annualAmount = weeklyAmount * 52;

  // Calculate High Income Child Benefit Charge
  let chargePercentage = 0;
  let taxCharge = 0;

  if (highestIncome > HICBC_THRESHOLD) {
    // Calculate percentage charge (1% for every £200 over £60,000)
    chargePercentage = Math.min(100, Math.floor((highestIncome - HICBC_THRESHOLD) / HICBC_STEP));
    taxCharge = (annualAmount * chargePercentage) / 100;
  }

  // Calculate net benefit after tax charge
  const netBenefit = annualAmount - taxCharge;

  return {
    weeklyAmount,
    fourWeeklyAmount,
    annualAmount,
    firstChildAmount,
    additionalChildrenAmount,
    taxCharge,
    netBenefit,
    chargePercentage
  };
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format weekly amount for display
export function formatWeeklyAmount(amount: number): string {
  return `${formatCurrency(amount)}/week`;
}

// Get tax charge explanation text
export function getTaxChargeExplanation(chargePercentage: number): string {
  if (chargePercentage === 0) {
    return 'No High Income Child Benefit Charge applies.';
  } else if (chargePercentage === 100) {
    return 'Child Benefit fully reclaimed through tax charge.';
  } else {
    return `${chargePercentage}% of Child Benefit reclaimed through tax charge.`;
  }
}