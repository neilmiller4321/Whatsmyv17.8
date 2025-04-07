
// Calculate balloon payment using linear interpolation between retention points
function getBalloonPayment(originalValue: number, month: number): number {
  const points = [
    { month: 0, retention: 100 },
    { month: 12, retention: 81 },
    { month: 24, retention: 69 },
    { month: 36, retention: 58 },
    { month: 48, retention: 49 },
    { month: 60, retention: 40 },
  ];

  // Cap at 60 months
  const cappedMonth = Math.min(month, 60);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    if (cappedMonth <= curr.month) {
      const ratio = (cappedMonth - prev.month) / (curr.month - prev.month);
      const retention = prev.retention + (curr.retention - prev.retention) * ratio;
      return Math.round(originalValue * (retention / 100));
    }
  }

  // Fallback to 40% retention if beyond 60 months
  return Math.round(originalValue * 0.4);
}

/**
 * Calculates Personal Contract Purchase (PCP) finance details
 */
export function calculatePCP(carValue: number, depositPercentage: number, termMonths: number, customApr?: number) {
  // Standard values for UK PCP finance
  const apr = customApr !== undefined ? customApr : 9.9; // Use custom APR if provided
  const annualInterestRate = apr / 100;
  const monthlyInterestRate = annualInterestRate / 12;
  
  // Calculate deposit
  const deposit = Math.round((carValue * depositPercentage) / 100);
  
  // Calculate balloon payment using interpolation
  const balloonPayment = getBalloonPayment(carValue, termMonths);
  
  // Amount to finance = Car value - deposit
  const amountToFinance = carValue - deposit;
  
  // Calculate present value of balloon payment
  const presentValueOfBalloon = balloonPayment / Math.pow(1 + monthlyInterestRate, termMonths);
  
  // Amount to finance excluding present value of balloon
  const financeAmount = amountToFinance - presentValueOfBalloon;
  
  // Calculate monthly payment
  let monthlyPayment;
  if (monthlyInterestRate === 0) {
    monthlyPayment = Math.max(0, financeAmount / termMonths);
  } else {
    monthlyPayment = Math.max(0, (financeAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths)) / 
      (Math.pow(1 + monthlyInterestRate, termMonths) - 1));
  }
  
  // Round to 2 decimal places
  monthlyPayment = Math.round(monthlyPayment * 100) / 100;
  
  // Total amount payable = Deposit + (Monthly payment × Term) + Balloon payment
  const totalPayable = deposit + (monthlyPayment * termMonths) + balloonPayment;
  
  // Total interest = Total payable - Car value
  const totalInterest = totalPayable - carValue;
  
  // Check if monthly payment is below minimum
  const isPaymentTooLow = monthlyPayment < 30;
  
  return {
    monthlyPayment,
    deposit,
    balloonPayment,
    totalPayable,
    totalInterest,
    apr,
    termMonths,
    isPaymentTooLow
  };
}

/**
 * Calculates Hire Purchase (HP) finance details
 */
export function calculateHP(carValue: number, depositPercentage: number, termMonths: number, customApr?: number) {
  // Standard values for UK HP finance
  const apr = customApr !== undefined ? customApr : 9.9; // Use custom APR if provided
  const annualInterestRate = apr / 100;
  const monthlyInterestRate = annualInterestRate / 12;
  
  // Calculate deposit
  const deposit = Math.round((carValue * depositPercentage) / 100);
  
  // Amount to finance = Car value - deposit
  const amountToFinance = carValue - deposit;
  
  // Calculate monthly payment using standard loan amortization formula
  let monthlyPayment;
  if (monthlyInterestRate === 0) {
    monthlyPayment = amountToFinance / termMonths;
  } else {
    monthlyPayment = (amountToFinance * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths)) / 
      (Math.pow(1 + monthlyInterestRate, termMonths) - 1);
  }
  
  // Round to 2 decimal places
  monthlyPayment = Math.round(monthlyPayment * 100) / 100;
  
  // Total amount payable = Deposit + (Monthly payment × Term)
  const totalPayable = deposit + (monthlyPayment * termMonths);
  
  // Total interest = Total payable - Car value
  const totalInterest = totalPayable - carValue;
  
  // Check if monthly payment is below minimum
  const isPaymentTooLow = monthlyPayment < 30;
  
  return {
    monthlyPayment,
    deposit,
    totalPayable,
    totalInterest,
    apr,
    termMonths,
    isPaymentTooLow
  };
}
