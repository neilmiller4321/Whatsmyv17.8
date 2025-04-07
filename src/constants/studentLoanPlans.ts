// Student loan plan details
export const repaymentPlans = {
  plan1: {
    name: 'Plan 1',
    annualThreshold: 26_065,
    threshold: 2_172,
    rate: 9,
    interestRate: 4.3,
    writeOffYears: 25,
    description: 'For students who started before September 2012',
    interestRateType: 'fixed'
  },
  plan2: {
    name: 'Plan 2',
    annualThreshold: 28_470,
    threshold: 2_373,
    rate: 9,
    writeOffYears: 30,
    description: 'For students who started after September 2012 in England/Wales',
    interestRateType: 'variable',
    interestRateDetails: {
      baseRate: 4.3, // RPI
      maxRate: 7.3,  // RPI + 3%
      lowerThreshold: 28_470,
      upperThreshold: 51_245
    }
  },
  plan4: {
    name: 'Plan 4',
    annualThreshold: 32_745,
    threshold: 2_729,
    rate: 9,
    interestRate: 4.3,
    writeOffYears: 30,
    description: 'For Scottish students who started after September 2012',
    interestRateType: 'fixed'
  },
  plan5: {
    name: 'Plan 5',
    annualThreshold: 25_000,
    threshold: 2_083,
    rate: 9,
    interestRate: 4.3,
    writeOffYears: 40,
    description: 'For students starting university from September 2023 in England',
    interestRateType: 'fixed'
  },
  postgrad: {
    name: 'Postgraduate Loan',
    annualThreshold: 21_000,
    threshold: 1_750,
    rate: 6,
    interestRate: 7.3,
    writeOffYears: 30,
    description: "For Postgraduate Master's or Doctoral loans",
    interestRateType: 'fixed'
  }
} as const;

// Calculate Plan 2 interest rate based on income
export function calculatePlan2InterestRate(income: number): number {
  const plan = repaymentPlans.plan2;
  const details = plan.interestRateDetails;
  
  if (income <= details.lowerThreshold) {
    return details.baseRate;
  }
  
  if (income >= details.upperThreshold) {
    return details.maxRate;
  }
  
  // Linear interpolation
  const incomeRange = details.upperThreshold - details.lowerThreshold;
  const rateRange = details.maxRate - details.baseRate;
  const incomeAboveThreshold = income - details.lowerThreshold;
  
  const interpolatedRate = details.baseRate + (incomeAboveThreshold / incomeRange) * rateRange;
  return Number(interpolatedRate.toFixed(1));
}

// Helper function to format threshold values
export const formatPlanDetails = (plan: keyof typeof repaymentPlans) => {
  const details = repaymentPlans[plan];
  const interestRate = plan === 'plan2' 
    ? `${details.interestRateDetails.baseRate}% to ${details.interestRateDetails.maxRate}%`
    : `${details.interestRate}%`;
  
  return {
    threshold: details.annualThreshold.toLocaleString(),
    monthly: details.threshold.toLocaleString(),
    rate: details.rate.toString(),
    interest: interestRate,
    writeOff: details.writeOffYears
  };
};