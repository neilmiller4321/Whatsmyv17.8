import React from 'react';
import { Settings, Info, Calendar, Clock } from 'lucide-react';
import { FormData, InputFieldState } from '../../../hooks/useTakeHomePay';
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

interface SalaryTabProps {
  formData: FormData;
  inputValues: InputFieldState;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  inputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
}

const SalaryTab: React.FC<SalaryTabProps> = ({ formData, inputValues, handleInputChange, inputRefs }) => {
  return (
    <div>
      <label htmlFor="annualGrossSalary" className="block text-sm font-medium text-gray-700 mb-2">
        Annual Gross Salary
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 text-base">£</span>
        <input
          ref={(el) => inputRefs.current.annualGrossSalary = el}
          type="text"
          inputMode="numeric"
          id="annualGrossSalary"
          name="annualGrossSalary"
          value={inputValues.annualGrossSalary}
          onChange={handleInputChange}
          className="block w-full h-12 pl-8 pr-4 border border-gray-300 rounded-lg bg-white shadow-sm transition-shadow duration-150 ease-in-out focus:ring-2 focus:ring-sunset-start focus:border-transparent"
        />
      </div>

      <label htmlFor="annualGrossBonus" className="block text-sm font-medium text-gray-700 mt-4 mb-2">
        Annual Bonus (Optional)
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 text-base">£</span>
        <input
          ref={(el) => inputRefs.current.annualGrossBonus = el}
          type="text"
          inputMode="numeric"
          id="annualGrossBonus"
          name="annualGrossBonus"
          value={inputValues.annualGrossBonus}
          onChange={handleInputChange}
          className="block w-full h-12 pl-8 pr-4 border border-gray-300 rounded-lg bg-white shadow-sm transition-shadow duration-150 ease-in-out focus:ring-2 focus:ring-sunset-start focus:border-transparent"
        />
      </div>

      <label className="inline-flex items-center mt-4">
        <input
          type="checkbox"
          name="residentInScotland"
          checked={formData.residentInScotland}
          onChange={handleInputChange}
          className="h-4 w-4 text-sunset-start focus:ring-sunset-start border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-700">Resident in Scotland</span>
      </label>

      {/* Additional Settings Accordion */}
      <div className="mt-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="additional-settings" className="border-none">
            <AccordionTrigger className="px-1 py-3 hover:bg-gray-50/50 rounded-t-lg text-sm font-medium text-gray-700 [&[data-state=open]]:rounded-b-none hover:no-underline justify-start">
              <span className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                See Advanced Settings
              </span>
            </AccordionTrigger>
            <Separator className="m-0 border-none bg-blue-50" /> 
            <AccordionContent className="px-0 pb-0 pt-0 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              {/* Content Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 pt-3">
                {/* Left Column - Allowances and Settings */}
                <div className="space-y-6">
                  {/* No NI */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">Exclude National Insurance</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button" className="ml-1.5 text-gray-400 hover:text-sunset-text transition-colors">
                              <Info className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" align="start" className="w-80 p-4 text-sm bg-white shadow-lg rounded-lg border border-gray-200 z-20">
                            <p>Select this if you're exempt from National Insurance contributions, such as if you're over state pension age.</p>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <Switch
                      id="no-ni-switch"
                      checked={formData.noNI}
                      onCheckedChange={(checked) => handleInputChange({
                        target: { name: 'noNI', checked, type: 'checkbox' }
                      } as React.ChangeEvent<HTMLInputElement>)}
                    />
                  </div>

                  {/* Blind Person's Allowance */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">Blind Person's Allowance</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button" className="ml-1.5 text-gray-400 hover:text-sunset-text transition-colors">
                              <Info className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" align="start" className="w-80 p-4 text-sm bg-white shadow-lg rounded-lg border border-gray-200 z-20">
                            <p>Blind Person's Allowance is an additional tax-free allowance for people who are registered as blind or severely sight impaired.</p>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <Switch
                      id="blind-switch"
                      checked={formData.blind}
                      onCheckedChange={(checked) => handleInputChange({
                        target: { name: 'blind', checked, type: 'checkbox' }
                      } as React.ChangeEvent<HTMLInputElement>)}
                    />
                  </div>

                  {/* Show Hourly Column Switch */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">Show Hourly Column</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button" className="ml-1.5 text-gray-400 hover:text-sunset-text transition-colors">
                              <Info className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" align="start" className="w-80 p-4 text-sm bg-white shadow-lg rounded-lg border border-gray-200 z-20">
                            <p>Display hourly rate calculations in the results table.</p>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <Switch
                      id="hourly-column-switch"
                      checked={formData.showHourlyColumn}
                      onCheckedChange={(checked) => handleInputChange({
                        target: { name: 'showHourlyColumn', checked, type: 'checkbox' }
                      } as React.ChangeEvent<HTMLInputElement>)}
                    />
                  </div>
                </div>

                {/* Right Column - Tax Year and Working Schedule */}
                <div className="space-y-5">
                  {/* Tax Year Selector */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-sunset-text" />
                      <label htmlFor="taxYearAccordion" className="text-sm font-medium text-gray-700">
                        Tax year <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <select
                      id="taxYearAccordion"
                      name="taxYear"
                      value={formData.taxYear}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start h-10 text-sm"
                    >
                      <option value="2024/25">2024/25</option>
                      <option value="2025/26">2025/26</option>
                    </select>
                  </div>

                  {/* Working days per week */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-sunset-text" />
                      <label htmlFor="workingDaysPerWeekAccordion" className="text-sm font-medium text-gray-700">
                        Working days per week <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      id="workingDaysPerWeekAccordion"
                      name="workingDaysPerWeek"
                      value={formData.workingDaysPerWeek === 0 ? '' : formData.workingDaysPerWeek}
                      onChange={handleInputChange}
                      min="1"
                      max="7"
                      placeholder="5"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start h-10 text-sm"
                    />
                  </div>

                  {/* Working hours per day */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-sunset-text" />
                      <label htmlFor="workingHoursPerDayAccordion" className="text-sm font-medium text-gray-700">
                        Working hours per day <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      id="workingHoursPerDayAccordion"
                      name="workingHoursPerDay"
                      value={formData.workingHoursPerDay === 0 ? '' : formData.workingHoursPerDay}
                      onChange={handleInputChange}
                      min="0.5"
                      step="0.1"
                      max="24"
                      placeholder="7"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start h-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default SalaryTab;