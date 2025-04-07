// Format a number with commas as thousands separators
export const formatNumberWithCommas = (value: number | string): string => {
  const numStr = value.toString().replace(/,/g, '');
  if (isNaN(Number(numStr))) return numStr;
  return Number(numStr).toLocaleString('en-GB');
};

// Parse a string with commas to a number
export const parseFormattedNumber = (value: string): number => {
  return Number(value.replace(/,/g, ''));
};

// Calculate cursor position after formatting
export const calculateCursorPosition = (
  value: string,
  oldValue: string,
  oldPosition: number | null,
  newValue: string
): number => {
  if (oldPosition === null) return newValue.length;
  
  // Count commas before cursor in the old value
  const oldCommasBefore = (oldValue.substring(0, oldPosition).match(/,/g) || []).length;
  
  // Count digits before cursor in the old value
  const oldDigitsBefore = oldPosition - oldCommasBefore;
  
  // Count commas in the new value up to the same number of digits
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
  
  // If we didn't reach the same number of digits, put cursor at the end
  if (newDigitsCounted < oldDigitsBefore) {
    newPosition = newValue.length;
  }
  
  return newPosition;
};