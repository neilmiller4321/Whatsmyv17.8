
import React, { useState, useEffect, useRef } from 'react';
import { Home } from 'lucide-react';
import { MortgageAmortizationChart } from '../components/mortgage/MortgageAmortizationChart';
import { 
  calculateMortgageResults, 
  formatCurrency, 
  formatPeriod 
} from '../utils/mortgageCalculator';
import { 
  calculatePropertyTax
} from '../utils/propertyTaxCalculator';
import { MortgageForm } from '../components/mortgagepayment/MortgageForm';
import { ResultsPanel } from '../components/mortgagepayment/ResultsPanel';
import { InterestOnlySummary } from '../components/mortgagepayment/InterestOnlySummary';
import { MobileOverpaymentSummary } from '../components/mortgagepayment/MobileOverpaymentSummary';
import { EducationalContent } from '../components/mortgagepayment/EducationalContent';

interface MortgageFormData {
  homePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  monthlyOverpayment: number;
  isInterestOnly: boolean;
  isFirstTimeBuyer: boolean;
  isAdditionalProperty: boolean;
  region: 'england' | 'scotland';
}

interface MortgageResults {
  monthlyPayment: number;
  principalAndInterest: number;
  totalPayment: number;
  totalInterest: number;
  loanAmount: number;
  // Overpayment results
  totalInterestWithOverpayment: number;
  interestSaved: number;
  newLoanTermMonths: number;
  monthsReduced: number;
  // Interest rate scenarios
  higherRatePayment: number;
  lowerRatePayment: number;
  // Stamp duty / LBTT
  stampDuty: number;
  effectiveRate: number;
}

interface InputFieldState {
  homePrice: string;
  downPayment: string;
  loanTerm: string;
  interestRate: string;
  monthlyOverpayment: string;
  downPaymentPercent: string;
}

export function MortgagePayment() {
  // Use numeric values for calculations
  const [formData, setFormData] = useState<MortgageFormData>({
    homePrice: 250000,
    downPayment: 25000,
    loanTerm: 25,
    interestRate: 4.5,
    monthlyOverpayment: 0,
    isInterestOnly: false,
    isFirstTimeBuyer: false,
    isAdditionalProperty: false,
    region: 'england'
  });

  // Use string values for input fields to handle empty state better
  const [inputValues, setInputValues] = useState<InputFieldState>({
    homePrice: '250,000',
    downPayment: '25,000',
    loanTerm: '25',
    interestRate: '4.5',
    monthlyOverpayment: '0',
    downPaymentPercent: '10'
  });

  const [results, setResults] = useState<MortgageResults | null>(null);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(10);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showPropertyTax, setShowPropertyTax] = useState<boolean>(false);
  
  // Track if field is being edited
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Store cursor position for formatted inputs
  const cursorPositionRef = useRef<number | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({
    homePrice: null,
    downPayment: null,
    monthlyOverpayment: null
  });

  // Calculate mortgage payment when form data changes
  useEffect(() => {
    calculateMortgage();
  }, [formData]);

  // Update deposit amount when percentage changes
  useEffect(() => {
    if (focusedField === 'downPaymentPercent') {
      // Calculate new down payment based on percentage (capped at 100%)
      const cappedPercentage = Math.min(downPaymentPercent, 100);
      const newDownPayment = Math.round(formData.homePrice * (cappedPercentage / 100));
      
      setFormData({
        ...formData,
        downPayment: newDownPayment
      });
      
      setInputValues({
        ...inputValues,
        downPayment: formatNumberWithCommas(newDownPayment)
      });
    }
  }, [downPaymentPercent, formData.homePrice, focusedField]);

  // Update deposit percentage when amount changes
  useEffect(() => {
    if (focusedField === 'downPayment') {
      const newPercent = (formData.downPayment / formData.homePrice) * 100;
      if (Math.abs(newPercent - downPaymentPercent) > 0.1) {
        setDownPaymentPercent(Number(newPercent.toFixed(1)));
        setInputValues({
          ...inputValues,
          downPaymentPercent: newPercent.toFixed(1)
        });
      }
    }
  }, [formData.downPayment, formData.homePrice, focusedField]);

  // Update deposit amount when home price changes
  useEffect(() => {
    if (focusedField === 'homePrice') {
      // Only update the percentage value
      const newPercent = (formData.downPayment / formData.homePrice) * 100;
      setDownPaymentPercent(Number(newPercent.toFixed(1)));
      setInputValues({
        ...inputValues,
        downPaymentPercent: newPercent.toFixed(1)
      });
    }
  }, [formData.homePrice, downPaymentPercent, focusedField]);

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
    
    // If the field is empty, set it back to "0" with appropriate formatting
    if (value === '') {
      const defaultValue = name === 'interestRate' ? '0.0' : '0';
      setInputValues({
        ...inputValues,
        [name]: defaultValue
      });
      
      // Update the numeric value for calculations
      setFormData({
        ...formData,
        [name]: 0
      });
    } else if (['homePrice', 'downPayment', 'monthlyOverpayment'].includes(name)) {
      // Ensure proper formatting on blur for numeric fields
      const numericValue = parseFormattedNumber(value);
      setInputValues({
        ...inputValues,
        [name]: formatNumberWithCommas(numericValue)
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Store current cursor position before update
    const cursorPos = e.target.selectionStart;
    cursorPositionRef.current = cursorPos;
    
    // Handle different input types
    if (['homePrice', 'downPayment', 'monthlyOverpayment'].includes(name)) {
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
        
        // For down payment, ensure it doesn't exceed home price
        if (name === 'downPayment') {
          const homePrice = formData.homePrice;
          const cappedValue = Math.min(numericValue, homePrice);
          
          // Update numeric value for calculations
          setFormData({
            ...formData,
            [name]: cappedValue
          });
        } else {
          // Update numeric value for calculations
          setFormData({
            ...formData,
            [name]: numericValue
          });
        }
        
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
    } else if (name === 'loanTerm') {
      // For loan term, only allow integers
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
    } else if (name === 'interestRate') {
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
    } else {
      // For other fields, use standard handling
      setInputValues({
        ...inputValues,
        [name]: value
      });
      
      if (value !== '') {
        let parsedValue: number;
        
        if (name === 'loanTerm') {
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

  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Update the input value
    setInputValues({
      ...inputValues,
      downPaymentPercent: value
    });
    
    // Only update the numeric value if the input is not empty
    if (value !== '') {
      // Cap the percentage at 100%
      const parsedValue = parseFloat(value) || 0;
      const cappedValue = Math.min(parsedValue, 100);
      
      setDownPaymentPercent(cappedValue);
      
      // If the input was capped, update the input field to show the capped value
      if (cappedValue !== parsedValue) {
        setInputValues({
          ...inputValues,
          downPaymentPercent: cappedValue.toString()
        });
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === 'isFirstTimeBuyer' && checked) {
      // If first-time buyer is checked, additional property must be unchecked
      setFormData({
        ...formData,
        isFirstTimeBuyer: checked,
        isAdditionalProperty: false
      });
    } else if (name === 'isAdditionalProperty' && checked) {
      // If additional property is checked, first-time buyer must be unchecked
      setFormData({
        ...formData,
        isAdditionalProperty: checked,
        isFirstTimeBuyer: false
      });
    } else {
      // Normal case
      setFormData({
        ...formData,
        [name]: checked
      });
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const region = e.target.value as 'england' | 'scotland';
    setFormData({
      ...formData,
      region
    });
  };

  const calculateMortgage = () => {
    setIsCalculating(true);
    
    // Short delay to show calculation animation if needed
    setTimeout(() => {
      try {
        // Calculate mortgage results
        const mortgageResults = calculateMortgageResults(
          formData.homePrice,
          formData.downPayment,
          formData.loanTerm,
          formData.interestRate,
          formData.monthlyOverpayment,
          formData.isInterestOnly
        );
        
        // Calculate property tax
        const propertyTaxResults = calculatePropertyTax(
          formData.homePrice,
          formData.isFirstTimeBuyer,
          formData.isAdditionalProperty,
          formData.region
        );
        
        // Combine results
        setResults({
          ...mortgageResults,
          ...propertyTaxResults
        });
      } catch (error) {
        console.error("Error calculating mortgage:", error);
      } finally {
        setIsCalculating(false);
      }
    }, 300);
  };

  return (
    <main className="pt-24 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center mb-6">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 logo-text bg-gradient-to-r from-sunset-start via-sunset-middle to-sunset-end bg-clip-text text-transparent leading-tight">
            What's My<br className="sm:hidden" /> Mortgage Payment?
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate your monthly mortgage payment based on property price, deposit, interest rate and term.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Calculator Form */}
          <MortgageForm
            formData={formData}
            setFormData={setFormData}
            inputValues={inputValues}
            setInputValues={setInputValues}
            downPaymentPercent={downPaymentPercent}
            setDownPaymentPercent={setDownPaymentPercent}
            showPropertyTax={showPropertyTax}
            setShowPropertyTax={setShowPropertyTax}
            isCalculating={isCalculating}
            calculateMortgage={calculateMortgage}
            handleInputChange={handleInputChange}
            handlePercentChange={handlePercentChange}
            handleInputFocus={handleInputFocus}
            handleInputBlur={handleInputBlur}
            handleCheckboxChange={handleCheckboxChange}
            handleRegionChange={handleRegionChange}
            focusedField={focusedField}
          />
          
          {/* Results Panel */}
          <ResultsPanel 
            results={results}
            formData={{
              monthlyOverpayment: formData.monthlyOverpayment,
              interestRate: formData.interestRate,
              mortgageTerm: formData.loanTerm,
              region: formData.region,
              isFirstTimeBuyer: formData.isFirstTimeBuyer,
              isAdditionalProperty: formData.isAdditionalProperty
            }}
          />
        </div>
        
        {/* Amortization Chart - Hidden on mobile */}
        {results && (
          <div className="hidden md:block mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
            {formData.isInterestOnly ? (
              <InterestOnlySummary 
                results={results}
                formData={{
                  interestRate: formData.interestRate,
                  loanTerm: formData.loanTerm,
                  monthlyOverpayment: formData.monthlyOverpayment
                }}
              />
            ) : (
              <>
                <MortgageAmortizationChart 
                  loanAmount={results.loanAmount} 
                  interestRate={formData.interestRate} 
                  loanTerm={formData.loanTerm}
                  startYear={new Date().getFullYear()}
                  monthlyOverpayment={formData.monthlyOverpayment}
                />
                
                {formData.monthlyOverpayment > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-sunset-start mr-2"></div>
                      <p className="text-sm text-gray-700">
                        With your monthly overpayment of {formatCurrency(formData.monthlyOverpayment)}, 
                        you could pay off your mortgage {formatPeriod(results.monthsReduced)} earlier 
                        and save {formatCurrency(results.interestSaved)} in interest.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Mobile-only summary of overpayment benefits */}
        {results && formData.monthlyOverpayment > 0 && (
          <MobileOverpaymentSummary 
            results={results}
            formData={{
              isInterestOnly: formData.isInterestOnly,
              monthlyOverpayment: formData.monthlyOverpayment,
              loanTerm: formData.loanTerm
            }}
          />
        )}
        
        {/* Educational Content */}
        <EducationalContent />
      </div>
    </main>
  );
}
