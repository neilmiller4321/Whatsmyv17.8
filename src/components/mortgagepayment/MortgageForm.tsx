import React, { useRef } from 'react';
import { InputField } from './InputField';
import { MortgageTypeSelector } from './MortgageTypeSelector';
import { PropertyTaxSection } from './PropertyTaxSection';

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

interface InputFieldState {
  homePrice: string;
  downPayment: string;
  loanTerm: string;
  interestRate: string;
  monthlyOverpayment: string;
  downPaymentPercent: string;
}

interface MortgageFormProps {
  formData: MortgageFormData;
  setFormData: React.Dispatch<React.SetStateAction<MortgageFormData>>;
  inputValues: InputFieldState;
  setInputValues: React.Dispatch<React.SetStateAction<InputFieldState>>;
  downPaymentPercent: number;
  setDownPaymentPercent: React.Dispatch<React.SetStateAction<number>>;
  showPropertyTax: boolean;
  setShowPropertyTax: React.Dispatch<React.SetStateAction<boolean>>;
  isCalculating: boolean;
  calculateMortgage: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePercentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRegionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  focusedField: string | null;
}

export const MortgageForm: React.FC<MortgageFormProps> = ({
  formData,
  setFormData,
  inputValues,
  setInputValues,
  downPaymentPercent,
  setDownPaymentPercent,
  showPropertyTax,
  setShowPropertyTax,
  isCalculating,
  calculateMortgage,
  handleInputChange,
  handlePercentChange,
  handleInputFocus,
  handleInputBlur,
  handleCheckboxChange,
  handleRegionChange,
  focusedField
}) => {
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({
    homePrice: null,
    downPayment: null,
    monthlyOverpayment: null,
  });

  return (
    <div className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
      <h2 className="text-xl font-semibold mb-4">Mortgage Details</h2>
      
      <div className="space-y-4">
        {/* Mortgage Type */}
        <MortgageTypeSelector 
          isInterestOnly={formData.isInterestOnly} 
          onChange={(isInterestOnly) => setFormData({ ...formData, isInterestOnly })} 
        />

        {/* Property Price and Deposit Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Property Price */}
          <div>
            <label htmlFor="homePrice" className="block text-sm font-medium text-gray-700 mb-1">
              Property Price
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
              <input
                ref={(el) => inputRefs.current.homePrice = el}
                type="text"
                inputMode="numeric"
                id="homePrice"
                name="homePrice"
                value={inputValues.homePrice}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              />
            </div>
          </div>
          
          {/* Deposit */}
          <div>
            <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700 mb-1">
              Deposit
            </label>
            <div className="relative">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                  <input
                    ref={(el) => inputRefs.current.downPayment = el}
                    type="text"
                    inputMode="numeric"
                    id="downPayment"
                    name="downPayment"
                    value={inputValues.downPayment}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    id="downPaymentPercent"
                    name="downPaymentPercent"
                    value={inputValues.downPaymentPercent}
                    onChange={handlePercentChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loan Term and Interest Rate Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Loan Term */}
          <div>
            <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 mb-1">
              Mortgage Term
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                id="loanTerm"
                name="loanTerm"
                value={inputValues.loanTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="block w-full pl-3 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">years</span>
            </div>
          </div>
          
          {/* Interest Rate */}
          <div>
            <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                id="interestRate"
                name="interestRate"
                value={inputValues.interestRate}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">%</span>
            </div>
          </div>
        </div>
        
        {downPaymentPercent >= 100 && (
          <p className="text-xs text-sunset-text mt-1">
            Deposit cannot be equal to or greater than the property price.
          </p>
        )}
        
        {/* Monthly Overpayment */}
        <div>
          <label htmlFor="monthlyOverpayment" className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Overpayment (optional)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
            <input
              ref={(el) => inputRefs.current.monthlyOverpayment = el}
              type="text"
              inputMode="numeric"
              id="monthlyOverpayment"
              name="monthlyOverpayment"
              value={inputValues.monthlyOverpayment}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="block w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
              placeholder="0"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Adding a regular overpayment can significantly reduce your interest costs and mortgage term.
          </p>
        </div>
        
        {/* Property Tax Calculator */}
        <PropertyTaxSection
          showPropertyTax={showPropertyTax}
          setShowPropertyTax={setShowPropertyTax}
          region={formData.region}
          isFirstTimeBuyer={formData.isFirstTimeBuyer}
          isAdditionalProperty={formData.isAdditionalProperty}
          handleRegionChange={handleRegionChange}
          handleCheckboxChange={handleCheckboxChange}
        />
        
        {/* Calculate Button */}
        <div className="mt-6">
          <button
            onClick={calculateMortgage}
            disabled={isCalculating || formData.downPayment >= formData.homePrice}
            className={`w-full gradient-button text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg ${
              formData.downPayment >= formData.homePrice ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isCalculating ? 'Calculating...' : 'Calculate Mortgage Payment'}
          </button>
          {formData.downPayment >= formData.homePrice && (
            <p className="text-sm text-sunset-text mt-2 text-center">
              Deposit cannot be equal to or greater than the property price.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};