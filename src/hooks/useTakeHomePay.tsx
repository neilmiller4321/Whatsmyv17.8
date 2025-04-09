import { useState } from 'react';
import { calculateTaxes } from '../utils/taxCalculator';
import { calculateSalaryPercentile } from '../utils/salaryPercentiles';
import { toast } from './use-toast';

export type PensionType = 'none' | 'auto_enrolment' | 'auto_unbanded' | 'relief_at_source' | 'relief_at_source_unbanded' | 'salary_sacrifice' | 'personal';
export type PensionValueType = 'percentage' | 'nominal';
export type EarningsBasis = 'qualifying' | 'total';
export type PensionFrequency = 'monthly' | 'yearly';
export type StudentLoanPlan = string;

export interface FormData {
  annualGrossSalary: number;
  annualGrossBonus: number;
  studentLoan: StudentLoanPlan[];
  residentInScotland: boolean;
  noNI: boolean;
  blind: boolean;
  selfEmployed: boolean;
  marriedCouplesAllowance: boolean;
  workingDaysPerWeek: number;
  workingHoursPerDay: number;
  taxYear: string;
  pensionType: PensionType;
  pensionValue: number;
  pensionValueType: PensionValueType;
  pensionFrequency: PensionFrequency;
  earningsBasis: EarningsBasis;
  includeBonusPension: boolean;
  showHourlyColumn: boolean;
  taxCode?: string;
}

export interface InputFieldState {
  annualGrossSalary: string;
  annualGrossBonus: string;
  pensionValue: string;
}

export const useTakeHomePay = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    annualGrossSalary: 30000,
    annualGrossBonus: 0,
    studentLoan: [],
    residentInScotland: false,
    noNI: false,
    blind: false,
    selfEmployed: false,
    marriedCouplesAllowance: false,
    workingDaysPerWeek: 5,
    workingHoursPerDay: 7,
    taxYear: '2025/26', // Changed from '2024/25' to '2025/26'
    pensionType: 'none',
    pensionValue: 0,
    pensionValueType: 'percentage',
    pensionFrequency: 'monthly',
    earningsBasis: 'total',
    includeBonusPension: false,
    showHourlyColumn: false
  });

  // Input field values (as strings to handle formatting)
  const [inputValues, setInputValues] = useState<InputFieldState>({
    annualGrossSalary: '30,000',
    annualGrossBonus: '0',
    pensionValue: '0',
  });

  // Results state
  const [results, setResults] = useState<ReturnType<typeof calculateTaxes> | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'salary' | 'pension' | 'student-loans' | 'tax-code' | 'additional'>('salary');

  // Add toast state
  const [toastShown, setToastShown] = useState(false);

  // Format a number with commas as thousands separators
  const formatNumberWithCommas = (value: number | string): string => {
    const numStr = value.toString().replace(/,/g, '');
    if (isNaN(Number(numStr)) || numStr === '') return numStr;
    if (/^0+$/.test(numStr)) return numStr;
    return Number(numStr).toLocaleString('en-GB');
  };

  // Parse a string with commas to a number
  const parseFormattedNumber = (value: string): number => {
    return Number(value.replace(/,/g, ''));
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'workingHoursPerDay') {
      // Allow decimal values for working hours
      const numValue = parseFloat(value);
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : isNaN(numValue) ? 0 : numValue
      });
      return;
    }
    
    if (name === 'earningsBasis') {
      setFormData({
        ...formData,
        earningsBasis: value as 'total' | 'qualifying'
      });
    } else if (name === 'workingDaysPerWeek' || name === 'workingHoursPerDay') {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setFormData({
          ...formData,
          [name]: numValue
        });
      }
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'studentLoan') {
        const newStudentLoan = checked 
          ? [...formData.studentLoan, value]
          : formData.studentLoan.filter(plan => plan !== value);
        setFormData({
          ...formData,
          studentLoan: newStudentLoan
        });
      } else {
        setFormData({
          ...formData,
          [name]: checked
        });
      }
    } else if (name === 'taxYear' || name === 'pensionType' || name === 'pensionValueType' || name === 'taxCode') {
      setFormData({
        ...formData,
        [name]: value
      });
    } else if (name === 'pensionFrequency') {
      setFormData({
        ...formData,
        pensionFrequency: value as PensionFrequency
      });
    } else {
      // For currency fields, only allow digits and commas
      const cleanValue = value.replace(/[^\d,.]/g, '');
      const numericString = cleanValue.replace(/,/g, '');
      
      if (numericString === '') {
        setInputValues({
          ...inputValues,
          [name]: ''
        });
        
        // For bonus field, reset to 0 when empty
        if (name === 'annualGrossBonus') {
          setFormData({
            ...formData,
            [name]: 0
          });
          setInputValues({
            ...inputValues,
            [name]: '0'
          });
          setFormData({
            ...formData,
            [name]: 0
          });
        }
        return;
      }
      
      // Handle multiple zeros
      if (/^0+$/.test(numericString)) {
        setInputValues({
          ...inputValues,
          [name]: numericString
        });
        setFormData({
          ...formData,
          [name]: 0
        });
        return;
      }
      
      const numericValue = parseInt(numericString.replace(/^0+/, '')) || 0;
      const isPercentage = name === 'pensionValue' && formData.pensionValueType === 'percentage';
      
      if (!isNaN(numericValue)) {
        const cappedValue = isPercentage ? Math.min(numericValue, 100) : numericValue;
        
        const formattedValue = formatNumberWithCommas(cappedValue);
        
        setInputValues({
          ...inputValues,
          [name]: formattedValue
        });
        
        // Only update form data if it's not the salary field being cleared
        if (!(name === 'annualGrossSalary' && numericString === '')) {
          setFormData({
            ...formData,
            [name]: cappedValue
          });
        }
      }
    }
  };

  const calculateTakeHome = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        const results = calculateTaxes({
          ...formData,
          taxYear: formData.taxYear || '2024/25',
          pension: formData.pensionType === 'none' ? undefined : {
            type: formData.pensionType,
            value: formData.pensionValue,
            valueType: formData.pensionValueType,
            earningsBasis: formData.earningsBasis,
            includeBonusPension: formData.includeBonusPension,
            // Make sure to include the frequency from the form
            frequency: formData.pensionFrequency
          }
        });
        setResults(results);

        // Show toast on successful calculation
        if (!toastShown) {
          toast({
            title: "Calculation Complete",
            description: "Your take-home pay has been calculated successfully."
          });
          setToastShown(true);
        }
      } catch (error) {
        console.error("Error calculating take-home pay:", error);
        toast({
          title: "Calculation Error",
          description: "There was an error calculating your take-home pay. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsCalculating(false);
      }
    }, 300);
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getSalaryPercentile = () => {
    if (!results) return 0;
    return Math.round(calculateSalaryPercentile(results.annualGrossIncome.total));
  };

  return {
    formData,
    setFormData,
    inputValues,
    setInputValues,
    results,
    isCalculating,
    showInfo,
    setShowInfo,
    openItems,
    activeTab,
    setActiveTab,
    formatNumberWithCommas,
    parseFormattedNumber,
    formatCurrency,
    handleInputChange,
    calculateTakeHome,
    toggleItem,
    getSalaryPercentile
  };
};