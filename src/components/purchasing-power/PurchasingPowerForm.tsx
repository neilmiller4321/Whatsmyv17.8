
import React, { useRef, useState } from 'react';
import { HelpCircle, Calendar } from 'lucide-react';

// Format a number with commas as thousands separators
const formatNumberWithCommas = (value: number | string): string => {
  // Convert to string and remove any existing commas
  const numStr = value.toString().replace(/,/g, '');
  
  // Check if it's a valid number
  if (isNaN(Number(numStr))) return numStr;
  
  // Format with commas
  return Number(numStr).toLocaleString('en-GB');
};

interface InputFieldState {
  amount: string;
  startYear: string;
  endYear: string;
}

interface FormData {
  amount: number;
  startYear: number;
  endYear: number;
  dataType: 'cpi' | 'rpi';
}

interface PurchasingPowerFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isCalculating: boolean;
  calculatePurchasingPower: () => void;
  earliestCpiYear: number;
  earliestRpiYear: number;
  maxFutureYear: number;
}

export function PurchasingPowerForm({
  formData,
  setFormData,
  isCalculating,
  calculatePurchasingPower,
  earliestCpiYear,
  earliestRpiYear,
  maxFutureYear
}: PurchasingPowerFormProps) {
  const [inputValues, setInputValues] = useState<InputFieldState>({
    amount: formatNumberWithCommas(formData.amount || 0),
    startYear: formData.startYear.toString(),
    endYear: formData.endYear.toString()
  });
  
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<string | null>(null);
  
  // Store cursor position for formatted inputs
  const cursorPositionRef = useRef<number | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({
    amount: null,
    startYear: null,
    endYear: null
  });

  // Parse a string with commas to a number
  const parseFormattedNumber = (value: string): number => {
    // Remove commas and convert to number
    return Number(value.replace(/,/g, ''));
  };

  // Calculate cursor position after formatting
  const calculateCursorPosition = (
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

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFocusedField(name);
    
    // If the value is "0" or "0,000", clear it when the user focuses on the field
    if (value === '0' || value === '0,000') {
      setInputValues({
        ...inputValues,
        [name]: ''
      });
    }
    
    // Store current cursor position
    cursorPositionRef.current = e.target.selectionStart;
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFocusedField(null);
    setShowInfo(null);
    
    // If the field is empty, set it back to "0" with appropriate formatting
    if (value === '') {
      const defaultValue = '0';
      setInputValues({
        ...inputValues,
        [name]: defaultValue
      });
      
      // Update the numeric value for calculations
      setFormData({
        ...formData,
        [name]: 0
      });
    } else if (name === 'amount') {
      // Ensure proper formatting on blur for numeric fields
      const numericValue = parseFormattedNumber(value);
      setInputValues({
        ...inputValues,
        [name]: formatNumberWithCommas(numericValue)
      });
    } else if (name === 'startYear' || name === 'endYear') {
      // Validate year inputs
      let numericValue = parseInt(value, 10);
      const earliestYear = formData.dataType === 'cpi' ? earliestCpiYear : earliestRpiYear;
      
      // Ensure years are within valid range
      if (name === 'startYear') {
        numericValue = Math.max(earliestYear, Math.min(numericValue, formData.endYear));
      } else if (name === 'endYear') {
        numericValue = Math.max(formData.startYear, Math.min(numericValue, maxFutureYear));
      }
      
      setInputValues({
        ...inputValues,
        [name]: numericValue.toString()
      });
      
      setFormData({
        ...formData,
        [name]: numericValue
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Store current cursor position before update
    const cursorPos = e.target.selectionStart;
    cursorPositionRef.current = cursorPos;
    
    // Handle different input types
    if (name === 'amount') {
      // For currency fields, only allow digits and commas
      const cleanValue = value.replace(/[^\d,]/g, '');
      
      // Remove existing commas for processing
      const numericString = cleanValue.replace(/,/g, '');
      
      if (numericString === '') {
        // Handle empty input
        setInputValues({
          ...inputValues,
          [name]: ''
        });
        return;
      }
      
      // Parse to number and format with commas
      const numericValue = Number(numericString);
      
      if (!isNaN(numericValue)) {
        const oldValue = inputValues[name as keyof InputFieldState];
        const formattedValue = formatNumberWithCommas(numericValue);
        
        // Update input value with formatted string
        setInputValues({
          ...inputValues,
          [name]: formattedValue
        });
        
        // Update numeric value for calculations
        setFormData({
          ...formData,
          [name]: numericValue
        });
        
        // Calculate new cursor position after formatting
        setTimeout(() => {
          const inputElement = inputRefs.current[name];
          if (inputElement) {
            const newCursorPos = calculateCursorPosition(
              cleanValue,
              oldValue,
              cursorPos,
              formattedValue
            );
            inputElement.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);
      }
    } else if (name === 'startYear' || name === 'endYear') {
      // For year fields, only allow digits
      const cleanValue = value.replace(/[^\d]/g, '');
      
      setInputValues({
        ...inputValues,
        [name]: cleanValue
      });
      
      if (cleanValue !== '') {
        const numericValue = parseInt(cleanValue, 10);
        const earliestYear = formData.dataType === 'cpi' ? earliestCpiYear : earliestRpiYear;
        
        // Validate year range
        if (numericValue >= earliestYear && numericValue <= maxFutureYear) {
          setFormData({
            ...formData,
            [name]: numericValue
          });
        }
      }
    } else {
      // For other fields, use standard handling
      setInputValues({
        ...inputValues,
        [name]: value
      });
      
      if (value !== '') {
        let parsedValue: number;
        
        if (name === 'startYear' || name === 'endYear') {
          parsedValue = parseInt(value, 10) || 0;
        } else {
          parsedValue = parseFloat(value) || 0;
        }
        
        setFormData({
          ...formData,
          [name]: parsedValue
        });
      }
    }
  };

  const getInfoText = (field: string): string => {
    const earliestYear = formData.dataType === 'cpi' ? earliestCpiYear : earliestRpiYear;
    
    switch (field) {
      case 'amount':
        return 'Enter the amount of money you want to calculate the purchasing power for.';
      case 'startYear':
        return `Enter the starting year (minimum ${earliestYear}). This is the year your money's value is based on.`;
      case 'endYear':
        return `Enter the end year (up to ${maxFutureYear}). This is the year you want to compare your money's value to.`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Amount */}
      <div className="relative">
        <div className="flex items-center mb-1">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <button 
            type="button"
            className="ml-2 text-gray-400 hover:text-sunset-text transition-colors"
            onClick={() => setShowInfo(showInfo === 'amount' ? null : 'amount')}
            aria-label="Show information about amount"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
        
        {showInfo === 'amount' && (
          <div className="mb-2 p-2 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg text-sm text-gray-600">
            {getInfoText('amount')}
          </div>
        )}
        
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
          <input
            ref={(el) => inputRefs.current.amount = el}
            type="text"
            inputMode="numeric"
            id="amount"
            name="amount"
            value={inputValues.amount}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
          />
        </div>
      </div>
      
      {/* Start Year */}
      <div className="relative">
        <div className="flex items-center mb-1">
          <label htmlFor="startYear" className="block text-sm font-medium text-gray-700">
            Start Year
          </label>
          <button 
            type="button"
            className="ml-2 text-gray-400 hover:text-sunset-text transition-colors"
            onClick={() => setShowInfo(showInfo === 'startYear' ? null : 'startYear')}
            aria-label="Show information about start year"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
        
        {showInfo === 'startYear' && (
          <div className="mb-2 p-2 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg text-sm text-gray-600">
            {getInfoText('startYear')}
          </div>
        )}
        
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Calendar className="w-4 h-4" />
          </span>
          <input
            ref={(el) => inputRefs.current.startYear = el}
            type="text"
            inputMode="numeric"
            id="startYear"
            name="startYear"
            value={inputValues.startYear}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
            min={formData.dataType === 'cpi' ? earliestCpiYear : earliestRpiYear}
            max={formData.endYear}
          />
        </div>
        {parseInt(inputValues.startYear) < (formData.dataType === 'cpi' ? earliestCpiYear : earliestRpiYear) && (
          <p className="text-xs text-sunset-text mt-1">
            Start year must be {formData.dataType === 'cpi' ? earliestCpiYear : earliestRpiYear} or later (earliest data available).
          </p>
        )}
      </div>
      
      {/* End Year */}
      <div className="relative">
        <div className="flex items-center mb-1">
          <label htmlFor="endYear" className="block text-sm font-medium text-gray-700">
            End Year
          </label>
          <button 
            type="button"
            className="ml-2 text-gray-400 hover:text-sunset-text transition-colors"
            onClick={() => setShowInfo(showInfo === 'endYear' ? null : 'endYear')}
            aria-label="Show information about end year"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
        
        {showInfo === 'endYear' && (
          <div className="mb-2 p-2 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg text-sm text-gray-600">
            {getInfoText('endYear')}
          </div>
        )}
        
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Calendar className="w-4 h-4" />
          </span>
          <input
            ref={(el) => inputRefs.current.endYear = el}
            type="text"
            inputMode="numeric"
            id="endYear"
            name="endYear"
            value={inputValues.endYear}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
            min={formData.dataType === 'cpi' ? earliestCpiYear : earliestRpiYear}
            max={maxFutureYear}
          />
        </div>
        {parseInt(inputValues.endYear) > maxFutureYear && (
          <p className="text-xs text-sunset-text mt-1">
            End year cannot be more than 50 years in the future.
          </p>
        )}
        {parseInt(inputValues.endYear) < parseInt(inputValues.startYear) && parseInt(inputValues.endYear) > 0 && (
          <p className="text-xs text-sunset-text mt-1">
            End year must be greater than or equal to start year.
          </p>
        )}
      </div>
      
      {/* Calculate Button */}
      <div className="mt-6">
        <button
          onClick={calculatePurchasingPower}
          disabled={isCalculating || 
            parseInt(inputValues.startYear) < (formData.dataType === 'cpi' ? earliestCpiYear : earliestRpiYear) || 
            parseInt(inputValues.endYear) > maxFutureYear ||
            parseInt(inputValues.endYear) < parseInt(inputValues.startYear)}
          className={`w-full gradient-button text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg ${
            isCalculating || 
            parseInt(inputValues.startYear) < (formData.dataType === 'cpi' ? earliestCpiYear : earliestRpiYear) || 
            parseInt(inputValues.endYear) > maxFutureYear ||
            parseInt(inputValues.endYear) < parseInt(inputValues.startYear)
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          }`}
        >
          {isCalculating ? 'Calculating...' : 'Calculate Purchasing Power'}
        </button>
      </div>
    </div>
  );
}
