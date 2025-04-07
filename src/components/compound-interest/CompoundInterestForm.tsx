import React, { useRef, useState } from 'react';
import { Percent, PlusCircle, MinusCircle, HelpCircle, Target, Calculator } from 'lucide-react';
import { FormData, InputFieldState } from './types';

interface CompoundInterestFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  inputValues: InputFieldState;
  setInputValues: React.Dispatch<React.SetStateAction<InputFieldState>>;
  onCalculate: () => void;
  isCalculating: boolean;
  calculationMode: 'balance' | 'target';
  setCalculationMode: React.Dispatch<React.SetStateAction<'balance' | 'target'>>;
}

export function CompoundInterestForm({
  formData,
  setFormData,
  inputValues,
  setInputValues,
  isCalculating,
  calculationMode,
  setCalculationMode
}: CompoundInterestFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<string | null>(null);
  
  // Store cursor position for formatted inputs
  const cursorPositionRef = useRef<number | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({
    initialInvestment: null,
    monthlyContribution: null,
    annualInterestRate: null,
    investmentTimeframe: null
  });

  // Format a number with commas as thousands separators
  const formatNumberWithCommas = (value: number | string): string => {
    // Convert to string and remove any existing commas
    const numStr = value.toString().replace(/,/g, '');
    
    // Check if it's a valid number
    if (isNaN(Number(numStr))) return numStr;
    
    // Format with commas
    return Number(numStr).toLocaleString('en-GB');
  };

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
      const defaultValue = name === 'annualInterestRate' ? '0.0' : '0';
      setInputValues({
        ...inputValues,
        [name]: defaultValue
      });
      
      // Update the numeric value for calculations
      setFormData({
        ...formData,
        [name]: 0
      });
    } else if (['initialInvestment', 'monthlyContribution', 'targetAmount'].includes(name)) {
      // Ensure proper formatting on blur for numeric fields
      const numericValue = parseFormattedNumber(value);
      setInputValues({
        ...inputValues,
        [name]: formatNumberWithCommas(numericValue)
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For select inputs, handle differently
    if (name === 'compoundingFrequency' || name === 'timeframeUnit') {
      setInputValues({
        ...inputValues,
        [name]: value
      });
      
      setFormData({
        ...formData,
        [name]: value
      });
      return;
    }
    
    // For input elements, store current cursor position before update
    if (e.target instanceof HTMLInputElement) {
      const cursorPos = e.target.selectionStart;
      cursorPositionRef.current = cursorPos;
    }
    
    // Handle different input types
    if (['initialInvestment', 'monthlyContribution', 'targetAmount'].includes(name)) {
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
        setFormData({
          ...formData,
          [name]: 0
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
              cursorPositionRef.current,
              formattedValue
            );
            inputElement.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);
      }
    } else if (name === 'investmentTimeframe') {
      // For timeframe, only allow integers
      const cleanValue = value.replace(/[^\d]/g, '');
      
      setInputValues({
        ...inputValues,
        [name]: cleanValue
      });
      
      if (cleanValue !== '') {
        const numericValue = parseInt(cleanValue, 10);
        setFormData({
          ...formData,
          [name]: numericValue
        });
      }
    } else if (name === 'annualInterestRate') {
      // For interest rate, allow decimals
      const cleanValue = value.replace(/[^\d.]/g, '');
      
      // Ensure only one decimal point
      const parts = cleanValue.split('.');
      const formattedValue = parts.length > 1 
        ? `${parts[0]}.${parts.slice(1).join('')}`
        : cleanValue;
      
      setInputValues({
        ...inputValues,
        [name]: formattedValue
      });
      
      if (formattedValue !== '' && formattedValue !== '.') {
        const numericValue = parseFloat(formattedValue);
        setFormData({
          ...formData,
          [name]: numericValue
        });
      }
    }
  };

  const handleAdjustValue = (field: keyof FormData, increment: boolean) => {
    let currentValue = formData[field];
    let step = 1;
    
    // Use different step sizes for different fields
    if (field === 'initialInvestment' || field === 'targetAmount') {
      step = 1000;
    } else if (field === 'monthlyContribution') {
      step = 50;
    } else if (field === 'annualInterestRate') {
      step = 0.5;
    }
    
    // Calculate new value
    const newValue = increment 
      ? currentValue + step 
      : Math.max(0, currentValue - step);
    
    // Update form data
    setFormData({
      ...formData,
      [field]: newValue
    });
    
    // Update input value with formatting
    let formattedValue: string;
    if (field === 'annualInterestRate') {
      formattedValue = newValue.toString();
    } else {
      formattedValue = formatNumberWithCommas(newValue);
    }
    
    setInputValues({
      ...inputValues,
      [field]: formattedValue
    });
  };

  const getInfoText = (field: string): string => {
    switch (field) {
      case 'targetAmount':
        return 'The amount you want to reach through compound interest and regular contributions.';
      case 'initialInvestment':
        return 'The amount you start with. This is your initial deposit or lump sum investment.';
      case 'monthlyContribution':
        return 'The amount you plan to add to your investment regularly. Consistent contributions can significantly boost your returns over time.';
      case 'annualInterestRate':
        return 'The annual percentage rate your investment is expected to earn. This is typically based on historical market returns or the stated interest rate for savings products.';
      case 'compoundingFrequency':
        return 'How often interest is calculated and added to your balance. More frequent compounding generally results in higher returns.';
      case 'investmentTimeframe':
        return 'The length of time you plan to keep your money invested. Longer timeframes typically allow for greater compound growth.';
      default:
        return '';
    }
  };

  return (
    <div className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-lg p-4 gradient-border h-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Investment Details</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setCalculationMode('balance')}
            className={`py-3 px-4 rounded-lg text-center transition-all duration-200 flex items-center justify-center gap-2 ${
              calculationMode === 'balance'
                ? 'gradient-button text-white font-medium'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Compound Growth</span>
          </button>
          <button
            type="button"
            onClick={() => setCalculationMode('target')}
            className={`py-3 px-4 rounded-lg text-center transition-all duration-200 flex items-center justify-center gap-2 ${
              calculationMode === 'target'
                ? 'gradient-button text-white font-medium'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Savings Target</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Initial Investment */}
        <div className="relative">
          <div className="flex items-center mb-1">
            <label htmlFor="initialInvestment" className="block text-sm font-medium text-gray-700">
              Initial Investment
            </label>
            <button 
              type="button"
              className="ml-2 text-gray-400 hover:text-sunset-text transition-colors"
              onClick={() => setShowInfo(showInfo === 'initialInvestment' ? null : 'initialInvestment')}
              aria-label="Show information about initial investment"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          
          {showInfo === 'initialInvestment' && (
            <div className="mb-2 p-2 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg text-sm text-gray-600">
              {getInfoText('initialInvestment')}
            </div>
          )}
          
          <div className="flex">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
              <input
                ref={(el) => inputRefs.current.initialInvestment = el}
                type="text"
                inputMode="numeric"
                id="initialInvestment"
                name="initialInvestment"
                value={inputValues.initialInvestment}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="block w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              />
            </div>
            <div className="flex ml-2">
              <button
                type="button"
                onClick={() => handleAdjustValue('initialInvestment', false)}
                className="p-2 rounded-l-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Decrease initial investment"
              >
                <MinusCircle className="w-5 h-5 text-gray-500" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustValue('initialInvestment', true)}
                className="p-2 rounded-r-lg border-t border-r border-b border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Increase initial investment"
              >
                <PlusCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Monthly Contribution */}
        <div className={calculationMode === 'target' ? 'hidden' : ''}>
          <label htmlFor="monthlyContribution" className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Contribution
          </label>
          <div className="flex">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
              <input
                ref={(el) => inputRefs.current.monthlyContribution = el}
                type="text"
                inputMode="numeric"
                id="monthlyContribution"
                name="monthlyContribution"
                value={inputValues.monthlyContribution}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="block w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              />
            </div>
            <div className="flex ml-2">
              <button
                type="button"
                onClick={() => handleAdjustValue('monthlyContribution', false)}
                className="p-2 rounded-l-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Decrease monthly contribution"
              >
                <MinusCircle className="w-5 h-5 text-gray-500" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustValue('monthlyContribution', true)}
                className="p-2 rounded-r-lg border-t border-r border-b border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Increase monthly contribution"
              >
                <PlusCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Target Amount - Only show in target mode */}
        <div className={calculationMode === 'balance' ? 'hidden' : ''}>
          <div className="flex items-center mb-1">
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
            Target Amount
            </label>
            <button 
              type="button"
              className="ml-2 text-gray-400 hover:text-sunset-text transition-colors"
              onClick={() => setShowInfo(showInfo === 'targetAmount' ? null : 'targetAmount')}
              aria-label="Show information about target amount"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          
          {showInfo === 'targetAmount' && (
            <div className="mb-2 p-2 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg text-sm text-gray-600">
              The amount you want to reach through compound interest and regular contributions.
            </div>
          )}
          
          <div className="flex">
            <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
            <input
              ref={(el) => inputRefs.current.targetAmount = el}
              type="text"
              inputMode="numeric"
              id="targetAmount"
              name="targetAmount"
              value={inputValues.targetAmount}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="block w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
            />
            </div>
            <div className="flex ml-2">
              <button
                type="button"
                onClick={() => handleAdjustValue('targetAmount', false)}
                className="p-2 rounded-l-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Decrease target amount"
              >
                <MinusCircle className="w-5 h-5 text-gray-500" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustValue('targetAmount', true)}
                className="p-2 rounded-r-lg border-t border-r border-b border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Increase target amount"
              >
                <PlusCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Annual Interest Rate */}
        <div>
          <label htmlFor="annualInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
            Annual Interest Rate
          </label>
          <div className="flex">
            <div className="relative flex-grow">
              <input
                ref={(el) => inputRefs.current.annualInterestRate = el}
                type="text"
                inputMode="decimal"
                id="annualInterestRate"
                name="annualInterestRate"
                value={inputValues.annualInterestRate}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="block w-full pl-3 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">%</span>
            </div>
            <div className="flex ml-2">
              <button
                type="button"
                onClick={() => handleAdjustValue('annualInterestRate', false)}
                className="p-2 rounded-l-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Decrease interest rate"
              >
                <MinusCircle className="w-5 h-5 text-gray-500" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustValue('annualInterestRate', true)}
                className="p-2 rounded-r-lg border-t border-r border-b border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Increase interest rate"
              >
                <PlusCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Compounding Frequency */}
        <div>
          <div className="flex items-center mb-1">
            <label htmlFor="compoundingFrequency" className="block text-sm font-medium text-gray-700">
            Compounding Frequency
            </label>
            <button 
              type="button"
              className="ml-2 text-gray-400 hover:text-sunset-text transition-colors"
              onClick={() => setShowInfo(showInfo === 'compoundingFrequency' ? null : 'compoundingFrequency')}
              aria-label="Show information about compounding frequency"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          
          {showInfo === 'compoundingFrequency' && (
            <div className="mb-2 p-3 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg text-sm text-gray-600 space-y-2">
              <p><strong>Monthly (default)</strong> – Commonly used for mortgages, loans, and regular savings accounts. Interest is added each month, offering a realistic view of balance growth in everyday products.</p>
              <p><strong>Annually</strong> – Often used in fixed-rate bonds, pensions, and long-term investment plans. Interest is applied once per year, keeping things simple but slightly less precise for regular saving.</p>
              <p><strong>Daily</strong> – Reflects how many savings accounts, cash ISAs, overdrafts, and credit cards work. Interest is calculated daily, which can result in better growth (or faster debt accrual) over time.</p>
              <p className="mt-4 text-xs flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>Even if interest is charged or paid monthly, many financial products calculate it daily behind the scenes — this gives a more accurate reflection of how balances grow or shrink.</span>
              </p>
            </div>
          )}
          <select
            id="compoundingFrequency"
            name="compoundingFrequency"
            value={inputValues.compoundingFrequency}
            onChange={handleInputChange}
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
          >
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        
        {/* Investment Timeframe */}
        <div>
          <label htmlFor="investmentTimeframe" className="block text-sm font-medium text-gray-700 mb-1">
            Investment Timeframe
          </label>
          <div className="flex">
            <div className="relative flex-grow">
              <input
                ref={(el) => inputRefs.current.investmentTimeframe = el}
                type="text"
                inputMode="numeric"
                id="investmentTimeframe"
                name="investmentTimeframe"
                value={inputValues.investmentTimeframe}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              />
            </div>
            <select
              id="timeframeUnit"
              name="timeframeUnit"
              value={inputValues.timeframeUnit}
              onChange={handleInputChange}
              className="border-l-0 border border-gray-300 rounded-r-lg focus:ring-sunset-start focus:border-sunset-start"
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
            </select>
            <div className="flex ml-2">
              <button
                type="button"
                onClick={() => handleAdjustValue('investmentTimeframe', false)}
                className="p-2 rounded-l-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Decrease timeframe"
              >
                <MinusCircle className="w-5 h-5 text-gray-500" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustValue('investmentTimeframe', true)}
                className="p-2 rounded-r-lg border-t border-r border-b border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Increase timeframe"
              >
                <PlusCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}