import { CompoundInterestResult, FormData } from './types';

export function calculateCompoundInterest(
  formData: FormData,
  mode: 'balance' | 'target'
): CompoundInterestResult {
  const {
    initialInvestment,
    monthlyContribution,
    annualInterestRate,
    compoundingFrequency,
    investmentTimeframe,
    timeframeUnit,
    targetAmount
  } = formData;

  let timeframeInYears = investmentTimeframe;
  if (timeframeUnit === 'months') {
    timeframeInYears = investmentTimeframe / 12;
  }

  const totalMonths = timeframeInYears * 12;
  const totalContributions = initialInvestment + monthlyContribution * totalMonths;

  const getEffectiveAnnualRate = (nominalRate: number): number =>
    Math.pow(1 + nominalRate / 100 / 365, 365) - 1;

  const calculateWithEffectiveMonthlyCompounding = (
    startBalance: number,
    monthlyContribution: number,
    months: number,
    effectiveAnnualRate: number
  ): { endBalance: number; interestEarned: number; monthlySnapshots: number[] } => {
    const monthlyRate = Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1;
    let balance = startBalance;
    const monthlySnapshots: number[] = [];

    for (let month = 0; month < months; month++) {
      balance += monthlyContribution;       // Contribution at start of month
      balance *= 1 + monthlyRate;           // Apply monthly compounding
      if ((month + 1) % 12 === 0) {
        monthlySnapshots.push(balance);     // Save end-of-year snapshot
      }
    }

    const interestEarned = balance - (startBalance + monthlyContribution * months);
    return { endBalance: balance, interestEarned, monthlySnapshots };
  };

  const calculateAnnualTimeWeightedInterest = (
    startBalance: number,
    monthlyContribution: number,
    annualRate: number
  ): { endBalance: number; totalContributions: number } => {
    let balance = startBalance;
    let totalContributions = 0;

    for (let month = 0; month < 12; month++) {
      const contribution = monthlyContribution;
      totalContributions += contribution;
      const monthsRemaining = (12 - month - 1) / 12;
      const proRatedInterest = contribution * (annualRate / 100) * monthsRemaining;
      balance += contribution + proRatedInterest;
    }

    balance += startBalance * (annualRate / 100);
    return { endBalance: balance, totalContributions };
  };

  if (mode === 'target' && targetAmount) {
    let monthlyContribution = 1;
    let step = 100;
    let lastResult = null;

    while (true) {
      const result = calculateCompoundInterest(
        { ...formData, monthlyContribution, targetAmount: undefined },
        'balance'
      );

      if (Math.abs(result.finalBalance - targetAmount) < 1) {
        return { ...result, requiredContribution: monthlyContribution };
      }

      if (result.finalBalance > targetAmount && step < 0.01) {
        return { ...lastResult!, requiredContribution: monthlyContribution - step };
      }

      if (result.finalBalance < targetAmount) {
        monthlyContribution += step;
      } else {
        monthlyContribution -= step;
        step /= 2;
        monthlyContribution += step;
      }

      lastResult = result;
    }
  }

  let balance = initialInvestment;
  let totalInterestEarned = 0;
  const yearlyData = [];

  if (compoundingFrequency === 'daily') {
    // Use the effective annual rate instead of nominal
    const effectiveRate = getEffectiveAnnualRate(annualInterestRate);
    const { endBalance, interestEarned, monthlySnapshots } =
      calculateWithEffectiveMonthlyCompounding(
        initialInvestment,
        monthlyContribution,
        totalMonths,
        effectiveRate
      );

    balance = endBalance;
    totalInterestEarned = interestEarned;

    for (let year = 1; year <= timeframeInYears; year++) {
      const snapshot = monthlySnapshots[year - 1] ?? balance;
      const contributionSoFar = initialInvestment + monthlyContribution * 12 * year;
      const interestSoFar = snapshot - contributionSoFar;

      yearlyData.push({
        year,
        balance: snapshot,
        contributions: monthlyContribution * 12,
        interestEarned: interestSoFar - (yearlyData.at(-1)?.totalInterestEarned ?? 0),
        totalContributions: contributionSoFar,
        totalInterestEarned: interestSoFar
      });
    }

  } else {
    const compoundsPerYear =
      compoundingFrequency === 'monthly' ? 12 : compoundingFrequency === 'annually' ? 1 : 12;
    const interestRatePerCompound = annualInterestRate / 100 / compoundsPerYear;
    const totalCompounds = compoundsPerYear * timeframeInYears;

    for (let i = 1; i <= totalCompounds; i++) {
      if (compoundingFrequency === 'annually') {
        const startBalance = balance;
        const { endBalance, totalContributions: yearContributions } =
          calculateAnnualTimeWeightedInterest(balance, monthlyContribution, annualInterestRate);

        const yearInterestEarned = endBalance - startBalance - monthlyContribution * 12;
        balance = endBalance;
        totalInterestEarned += yearInterestEarned;
      } else {
        const contributionPerCompound = monthlyContribution * (12 / compoundsPerYear);
        const interestEarned = balance * interestRatePerCompound;
        balance += interestEarned + contributionPerCompound;
        totalInterestEarned += interestEarned;
      }

      if (i % compoundsPerYear === 0 || i === totalCompounds) {
        const currentYear = Math.ceil(i / compoundsPerYear);
        yearlyData.push({
          year: currentYear,
          balance,
          contributions: monthlyContribution * 12,
          interestEarned: totalInterestEarned - (yearlyData.at(-1)?.totalInterestEarned ?? 0),
          totalContributions: initialInvestment + monthlyContribution * 12 * currentYear,
          totalInterestEarned
        });
      }
    }
  }

  return {
    finalBalance: balance,
    totalContributions,
    totalInterestEarned,
    yearlyData
  };
}