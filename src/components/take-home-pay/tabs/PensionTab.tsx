import React from 'react';
import { FormData, InputFieldState } from '../../../hooks/useTakeHomePay';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface PensionTabProps {
  formData: FormData;
  inputValues: InputFieldState;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  inputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
}

const PensionTab: React.FC<PensionTabProps> = ({ formData, inputValues, handleInputChange, inputRefs }) => {
  const isPensionNominal = formData.pensionValueType === 'nominal';

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Pension Contributions</label>

      {/* Pension Type Selector */}
      <select
        name="pensionType"
        value={formData.pensionType}
        onChange={handleInputChange}
        className="block w-full h-12 px-4 border border-gray-300 rounded-lg bg-white shadow-sm transition-shadow duration-150 ease-in-out focus:ring-2 focus:ring-sunset-start focus:border-transparent"
      >
        <option value="none">No Pension</option>
        <option value="auto_enrolment">Auto Enrolment (Qualifying Earnings)</option>
        <option value="relief_at_source">Relief at Source</option>
        <option value="salary_sacrifice">Salary Sacrifice</option>
        <option value="personal">Personal Pension</option>
      </select>

      {formData.pensionType !== 'none' && (
        <div className="space-y-4 mt-4">
          {/* Pension Value Input Row */}
          <div className="flex items-center gap-3">
            {/* Pension Value Input with Conditional Symbols */}
            <div className="relative flex-grow">
              <span className={`absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-base pointer-events-none ${!isPensionNominal && 'hidden'}`}>
                £
              </span>
              <input
                ref={(el) => inputRefs.current.pensionValue = el}
                type="text"
                inputMode="numeric"
                name="pensionValue"
                value={inputValues.pensionValue}
                onChange={handleInputChange}
                className={`block w-full h-12 border border-gray-300 rounded-lg bg-white shadow-sm transition-shadow duration-150 ease-in-out focus:ring-2 focus:ring-sunset-start focus:border-transparent ${
                  isPensionNominal ? 'pl-8 pr-4' : 'pl-4 pr-12'
                }`}
                placeholder={isPensionNominal ? '100' : '5.0'}
              />
              <span className={`absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 text-base pointer-events-none ${isPensionNominal && 'hidden'}`}>
                %
              </span>
            </div>

            {/* Frequency Dropdown */}
            <select
              name="pensionFrequency"
              value={formData.pensionFrequency || 'monthly'}
              onChange={handleInputChange}
              className="h-12 px-4 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-sunset-start focus:border-transparent text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Pension Value Type Checkbox */}
          <div className="flex items-center mt-3 space-x-2">
            <Switch
              id="pension-value-type-toggle"
              checked={formData.pensionValueType === 'nominal'}
              onCheckedChange={(checked) => {
                handleInputChange({
                  target: {
                    name: 'pensionValueType',
                    value: checked ? 'nominal' : 'percentage',
                    type: 'text'
                  }
                } as React.ChangeEvent<HTMLInputElement>);
              }}
            />

            <Label
              htmlFor="pension-value-type-toggle"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Use fixed amount (£) instead of percentage
            </Label>
          </div>

          {/* Earnings Basis Selection */}
          {['relief_at_source', 'salary_sacrifice', 'personal'].includes(formData.pensionType) && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Calculate pension on
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex items-center">
                  <input
                    type="radio"
                    name="earningsBasis"
                    value="total"
                    checked={formData.earningsBasis === 'total'}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-full h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg peer-checked:border-sunset-start peer-checked:bg-sunset-start/5 transition-all duration-200">
                    <span className="text-sm font-medium peer-checked:text-sunset-text">Gross Salary</span>
                  </div>
                </label>
                <label className="relative flex items-center">
                  <input
                    type="radio"
                    name="earningsBasis"
                    value="qualifying"
                    checked={formData.earningsBasis === 'qualifying'}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-full h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg peer-checked:border-sunset-start peer-checked:bg-sunset-start/5 transition-all duration-200">
                    <span className="text-sm font-medium peer-checked:text-sunset-text">Qualifying Earnings</span>
                  </div>
                </label>
              </div>
            </div>
          )}
          
          {/* Pension Description Text */}
          <p className="text-xs text-gray-500 mt-4">
            {formData.pensionType === 'salary_sacrifice'
              ? `Salary sacrifice reduces your ${formData.earningsBasis === 'total' ? 'gross salary' : 'qualifying earnings'} before tax and NI calculations.`
              : formData.pensionType.includes('relief_at_source')
              ? `Relief at source contributions are taken from ${formData.earningsBasis === 'total' ? 'gross salary' : 'qualifying earnings'} after tax, with basic rate relief added automatically.`
              : `Pension contributions reduce your taxable income based on ${formData.earningsBasis === 'total' ? 'gross salary' : 'qualifying earnings'}.`} 
            {` This is a ${formData.pensionFrequency} ${isPensionNominal ? 'amount' : 'rate'}.`}
          </p>

          {/* Include Bonus Checkbox - Only show for percentage-based pensions */}
          {!isPensionNominal && (
            <div className="mt-4">
              <label className="inline-flex items-center">
                <Checkbox
                  checked={formData.includeBonusPension}
                  onCheckedChange={(checked) => {
                    handleInputChange({
                      target: {
                        name: 'includeBonusPension',
                        type: 'checkbox',
                        checked: !!checked
                      }
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                />
                <span className="ml-2 text-sm text-gray-700">Include bonus in pension calculation</span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PensionTab;