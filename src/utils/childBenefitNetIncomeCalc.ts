// Format a number with commas as thousands separators
export function formatNumberWithCommas(value: number | string): string {
  const numStr = value.toString().replace(/,/g, '');
  if (isNaN(Number(numStr))) return numStr;
  return Number(numStr).toLocaleString('en-GB');
}

// Parse a string with commas to a number
export function parseFormattedNumber(value: string): number {
  return Number(value.replace(/,/g, ''));
}

// Calculate cursor position after formatting
export function calculateCursorPosition(
  value: string,
  oldValue: string,
  oldPosition: number | null,
  newValue: string
): number {
  if (oldPosition === null) return newValue.length;
  
  const oldCommasBefore = (oldValue.substring(0, oldPosition).match(/,/g) || []).length;
  const oldDigitsBefore = oldPosition - oldCommasBefore;
  
  let newCommasBefore = 0;
  let newDigitsCounted = 0;
  let newPosition = 0;
  
  for (let i = 0; i < newValue.length; i++) {
    if (newValue[i] !== ',') {
      newDigitsCounted++;
    } else {
      newCommasBefore++;
    }
    
    if (newDigitsCounted === oldDigitsBefore) {
      newPosition = i + 1;
      break;
    }
  }
  
  if (newDigitsCounted < oldDigitsBefore) {
    newPosition = newValue.length;
  }
  
  return newPosition;
}

// Calculate adjusted net income for Child Benefit
export function calculateAdjustedNetIncome(inputs: {
  grossSalary: number;
  pensionContribution: number;
  pensionContributionType: 'percentage' | 'amount';
  additionalIncome: number;
  giftAid: number;
  otherSalarySacrifice: number;
}): number {
  let adjustedIncome = inputs.grossSalary + inputs.additionalIncome;
  
  // Subtract pension contributions
  if (inputs.pensionContributionType === 'percentage') {
    adjustedIncome -= (inputs.grossSalary * inputs.pensionContribution / 100);
  } else {
    adjustedIncome -= inputs.pensionContribution;
  }
  
  // Subtract Gift Aid donations
  adjustedIncome -= inputs.giftAid;
  
  // Subtract other salary sacrifice payments
  adjustedIncome -= inputs.otherSalarySacrifice;
  
  // Ensure we don't go below 0
  return Math.max(0, adjustedIncome);
}