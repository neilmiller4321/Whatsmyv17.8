import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Info, X } from 'lucide-react';

interface FormData {
  grossSalary: number;
  pensionContribution: number;
  pensionContributionType: 'percentage' | 'amount';
  additionalIncome: number;
  giftAid: number;
  otherSalarySacrifice: number;
}

interface InputValues {
  grossSalary: string;
  pensionContribution: string;
  additionalIncome: string;
  giftAid: string;
  otherSalarySacrifice: string;
}

interface TooltipInfo {
  grossSalary: string;
  pensionContribution: string;
  additionalIncome: string;
  giftAid: string;
  otherSalarySacrifice: string;
}

export function AdjustedNetIncomeCalculator() {
  const [adjustedNetIncome, setAdjustedNetIncome] = useState<number>(0);
  const [activeTooltip, setActiveTooltip] = useState<keyof TooltipInfo | null>(null);
  
  const tooltipInfo: TooltipInfo = {
    grossSalary: 'Your total annual salary before any deductions.',
    pensionContribution: 'Include:\n• Pension contributions paid gross (before tax relief)\n• For contributions where your pension provider has already given you tax relief at the basic rate, enter the "grossed-up" amount',
    additionalIncome: 'Other taxable income such as rental income, dividends, or self-employment profits.',
    giftAid: 'The actual amount you donated - enter the "grossed-up" amount',
    otherSalarySacrifice: 'Other salary sacrifice arrangements like childcare vouchers, cycle to work scheme, or electric car scheme.'
  };
  const [formData, setFormData] = useState<FormData>({
    grossSalary: 0,
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    additionalIncome: 0,
    giftAid: 0,
    otherSalarySacrifice: 0
  });
  
  const [inputValues, setInputValues] = useState<InputValues>({
    grossSalary: '',
    pensionContribution: '',
    additionalIncome: '',
    giftAid: '',
    otherSalarySacrifice: ''
  });

  // Format a number with commas as thousands separators
  const formatNumberWithCommas = (value: number | string): string => {
    const numStr = value.toString().replace(/,/g, '');
    if (isNaN(Number(numStr))) return numStr;
    return Number(numStr).toLocaleString('en-GB');
  };

  // Parse a string with commas to a number
  const parseFormattedNumber = (value: string): number => {
    return Number(value.replace(/,/g, ''));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'pensionContributionType') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }
    
    // For numeric inputs
    const cleanValue = value.replace(/[^\d,]/g, '');
    const numericString = cleanValue.replace(/,/g, '');
    
    if (numericString === '') {
      setInputValues(prev => ({
        ...prev,
        [name]: ''
      }));
      setFormData(prev => ({
        ...prev,
        [name]: 0
      }));
      return;
    }
    
    const numericValue = parseInt(numericString);
    if (!isNaN(numericValue)) {
      setInputValues(prev => ({
        ...prev,
        [name]: formatNumberWithCommas(numericValue)
      }));
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '0' || value === '0,000') {
      setInputValues(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '') {
      setInputValues(prev => ({
        ...prev,
        [name]: '0'
      }));
      setFormData(prev => ({
        ...prev,
        [name]: 0
      }));
    } else {
      const numericValue = parseFormattedNumber(value);
      setInputValues(prev => ({
        ...prev,
        [name]: formatNumberWithCommas(numericValue)
      }));
    }
  };

  const calculateAdjustedNetIncome = () => {
    let adjustedIncome = formData.grossSalary + formData.additionalIncome;
    
    // Subtract pension contributions
    if (formData.pensionContributionType === 'percentage') {
      adjustedIncome -= (formData.grossSalary * formData.pensionContribution / 100);
    } else {
      adjustedIncome -= formData.pensionContribution;
    }
    
    // Subtract Gift Aid donations
    adjustedIncome -= formData.giftAid;
    
    // Subtract other salary sacrifice payments
    adjustedIncome -= formData.otherSalarySacrifice;
    
    // Ensure we don't go below 0
    adjustedIncome = Math.max(0, adjustedIncome);
    
    setAdjustedNetIncome(adjustedIncome);
  };

  return (
    <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border max-w-4xl mx-auto AdjustedNetIncomeCalculator">
      <h2 className="text-xl font-semibold mb-4">Calculate Your Adjusted Net Income</h2>
      <p className="text-gray-600 mb-6">
        Use this calculator to check if your adjusted net income is above £60,000 (when the High Income Child Benefit Charge starts) or £80,000 (when 100% of Child Benefit must be repaid).
      </p>
      
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Annual Gross Salary */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <span>Annual Gross Salary</span>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'grossSalary' ? null : 'grossSalary')}
              className="text-gray-400 hover:text-sunset-text transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </label>
          {activeTooltip === 'grossSalary' && (
            <div className="mb-2 p-2 bg-white rounded-lg text-sm text-gray-600 border border-gray-200 relative">
              <button
                onClick={() => setActiveTooltip(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-sunset-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {tooltipInfo.grossSalary}
            </div>
          )}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
            <input
              type="text"
              inputMode="numeric"
              name="grossSalary"
              value={inputValues.grossSalary}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              placeholder="0"
            />
          </div>
        </div>
        
        {/* Your Pension Contributions */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <span>Your Annual Pension Contributions</span>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'pensionContribution' ? null : 'pensionContribution')}
              className="text-gray-400 hover:text-sunset-text transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </label>
          {activeTooltip === 'pensionContribution' && (
            <div className="mb-2 p-2 bg-white rounded-lg text-sm text-gray-600 border border-gray-200 relative">
              <button
                onClick={() => setActiveTooltip(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-sunset-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="whitespace-pre-line">{tooltipInfo.pensionContribution}</div>
            </div>
          )}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  name="pensionContribution"
                  value={inputValues.pensionContribution}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="block w-full pl-3 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <select
                    name="pensionContributionType"
                    value={formData.pensionContributionType}
                    onChange={handleInputChange}
                    className="h-full rounded-r-lg border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-sunset-start"
                  >
                    <option value="percentage">%</option>
                    <option value="amount">£</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Income */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <span>Additional Income</span>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'additionalIncome' ? null : 'additionalIncome')}
              className="text-gray-400 hover:text-sunset-text transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </label>
          {activeTooltip === 'additionalIncome' && (
            <div className="mb-2 p-2 bg-white rounded-lg text-sm text-gray-600 border border-gray-200 relative">
              <button
                onClick={() => setActiveTooltip(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-sunset-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {tooltipInfo.additionalIncome}
            </div>
          )}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
            <input
              type="text"
              inputMode="numeric"
              name="additionalIncome"
              value={inputValues.additionalIncome}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              placeholder="0"
            />
          </div>
        </div>
        
        {/* Gift Aid Donations */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <span>Gift Aid Donations</span>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'giftAid' ? null : 'giftAid')}
              className="text-gray-400 hover:text-sunset-text transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </label>
          {activeTooltip === 'giftAid' && (
            <div className="mb-2 p-2 bg-white rounded-lg text-sm text-gray-600 border border-gray-200 relative">
              <button
                onClick={() => setActiveTooltip(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-sunset-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {tooltipInfo.giftAid}
            </div>
          )}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
            <input
              type="text"
              inputMode="numeric"
              name="giftAid"
              value={inputValues.giftAid}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              placeholder="0"
            />
          </div>
        </div>
        
        {/* Other Salary Sacrifice */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <span>Other Salary Sacrifice Payments (Annual Amount)</span>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'otherSalarySacrifice' ? null : 'otherSalarySacrifice')}
              className="text-gray-400 hover:text-sunset-text transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </label>
          {activeTooltip === 'otherSalarySacrifice' && (
            <div className="mb-2 p-2 bg-white rounded-lg text-sm text-gray-600 border border-gray-200 relative">
              <button
                onClick={() => setActiveTooltip(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-sunset-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {tooltipInfo.otherSalarySacrifice}
            </div>
          )}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
            <input
              type="text"
              inputMode="numeric"
              name="otherSalarySacrifice"
              value={inputValues.otherSalarySacrifice}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              placeholder="0"
            />
          </div>
        </div>
        
        {/* Calculate Button */}
        <button
          onClick={calculateAdjustedNetIncome}
          className="w-full gradient-button text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg"
        >
          Calculate Adjusted Net Annual Income
        </button>
        
        {/* Results Section */}
        <div className="mt-6 p-4 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg text-center">
          <h4 className="text-sm font-semibold mb-2">Your Adjusted Net Income</h4>
          <p className="text-2xl font-bold text-gray-900 mb-0">£{adjustedNetIncome.toLocaleString()}</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-4 text-sm font-bold text-sunset-text hover:text-sunset-text-hover transition-colors inline-flex items-center gap-1"
          >
            Back to top
            <ArrowRight className="w-3 h-3 rotate-[-90deg]" />
          </button>
        </div>
      </div>
    </div>
  );
}