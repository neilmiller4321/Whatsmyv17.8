
import React from 'react';
import { Info, Calendar, Clock } from 'lucide-react';
import { FormData } from '../../../hooks/useTakeHomePay';
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AdditionalSettingsTabProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const AdditionalSettingsTab: React.FC<AdditionalSettingsTabProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 pt-3">
      {/* Left Column - Allowances and Settings */}
      <div className="space-y-6">
        {/* No NI */}
        <div>
          <label htmlFor='no-ni-switch' className="text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>
              Exclude National Insurance
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="ml-1.5 text-gray-400 hover:text-sunset-text transition-colors relative top-px">
                    <Info className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-80 p-4 text-sm bg-white shadow-lg rounded-lg border border-gray-200 z-20">
                  <p>Select this if you're exempt from National Insurance contributions, such as if you're over state pension age.</p>
                </PopoverContent>
              </Popover>
            </span>
            <Switch
              id="no-ni-switch"
              checked={formData.noNI}
              onCheckedChange={(checked) => handleInputChange({
                target: { name: 'noNI', checked, type: 'checkbox' }
              } as React.ChangeEvent<HTMLInputElement>)}
            />
          </label>
        </div>

        {/* Blind Person's Allowance */}
        <div>
          <label htmlFor='blind-switch' className="text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>
              Blind Person's Allowance
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="ml-1.5 text-gray-400 hover:text-sunset-text transition-colors relative top-px">
                    <Info className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-80 p-4 text-sm bg-white shadow-lg rounded-lg border border-gray-200 z-20">
                  <p>Blind Person's Allowance is an additional tax-free allowance for people who are registered as blind or severely sight impaired.</p>
                </PopoverContent>
              </Popover>
            </span>
            <Switch
              id="blind-switch"
              checked={formData.blind}
              onCheckedChange={(checked) => handleInputChange({
                target: { name: 'blind', checked, type: 'checkbox' }
              } as React.ChangeEvent<HTMLInputElement>)}
            />
          </label>
        </div>
      </div>

      {/* Right Column - Tax Year and Working Schedule */}
      <div className="space-y-5">
        {/* Tax Year Selector */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-sunset-text" />
            <label htmlFor="taxYear" className="text-sm font-medium text-gray-700">
              Tax year <span className="text-red-500">*</span>
            </label>
          </div>
          <select
            id="taxYear"
            name="taxYear"
            value={formData.taxYear}
            onChange={handleInputChange}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start h-10 text-sm"
          >
            <option value="2024/25">2024/25</option>
          </select>
        </div>

        {/* Working days per week */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-sunset-text" />
            <label htmlFor="workingDaysPerWeek" className="text-sm font-medium text-gray-700">
              Working days per week <span className="text-red-500">*</span>
            </label>
          </div>
          <input
            type="number"
            id="workingDaysPerWeek"
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
            <label htmlFor="workingHoursPerDay" className="text-sm font-medium text-gray-700">
              Working hours per day <span className="text-red-500">*</span>
            </label>
          </div>
          <input
            type="number"
            id="workingHoursPerDay"
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
  );
};

export default AdditionalSettingsTab;