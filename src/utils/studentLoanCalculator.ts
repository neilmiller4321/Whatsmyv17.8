import { STUDENT_LOAN_PLANS } from './taxConstants';
import * as taxConstants25 from './taxConstants25';

// Get the appropriate student loan plans based on tax year
function getStudentLoanPlans(taxYear: string = '2024/25') {
  return taxYear === '2025/26' ? taxConstants25.STUDENT_LOAN_PLANS : STUDENT_LOAN_PLANS;
}

interface LoanBreakdown {
  plan: string;
  threshold: number;
  rate: number;
  annualRepayment: number;
  monthlyRepayment: number;
}

// Calculate total student loan repayments
export function calculateTotalStudentLoans(
  annualSalary: number,
  plans: string[] = [],
  taxYear: string = '2024/25'
): {
  totalAnnualRepayment: number;
  totalMonthlyRepayment: number;
  breakdown: LoanBreakdown[];
  monthlyRepayment: number;
} {
  const studentLoanPlans = getStudentLoanPlans(taxYear);

  const monthlySalary = annualSalary / 12;
  let totalMonthlyRepayment = 0;
  const breakdown: LoanBreakdown[] = [];

  for (const plan of plans) {
    const planInfo = studentLoanPlans[plan as keyof typeof studentLoanPlans];
    if (!planInfo) continue;

    const monthlyThreshold = planInfo.threshold / 12;
    let monthlyRepayment = 0;

    if (monthlySalary > monthlyThreshold) {
      monthlyRepayment = Math.floor((monthlySalary - monthlyThreshold) * planInfo.rate);
    }

    const annualRepayment = monthlyRepayment * 12;

    totalMonthlyRepayment += monthlyRepayment;

    breakdown.push({
      plan,
      threshold: planInfo.threshold,
      rate: planInfo.rate,
      monthlyRepayment,
      annualRepayment
    });
  }

  const totalAnnualRepayment = totalMonthlyRepayment * 12;

  return {
    totalAnnualRepayment,
    totalMonthlyRepayment,
    breakdown,
    monthlyRepayment: totalMonthlyRepayment
  };
}

export function calculateMonthlyStudentLoan(annualSalary: number, plan: string): number {
  const planInfo = STUDENT_LOAN_PLANS[plan as keyof typeof STUDENT_LOAN_PLANS];
  if (!planInfo) return 0;

  const monthlySalary = annualSalary / 12;
  const monthlyThreshold = planInfo.threshold / 12;

  if (monthlySalary <= monthlyThreshold) {
    return 0;
  }

  const monthlyRepayment = (monthlySalary - monthlyThreshold) * planInfo.rate;
  return Math.floor(monthlyRepayment);
}