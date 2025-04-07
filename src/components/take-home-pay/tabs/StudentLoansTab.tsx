
import React from 'react';
import { Info } from 'lucide-react';
import { FormData } from '../../../hooks/useTakeHomePay';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface StudentLoansTabProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const StudentLoansTab: React.FC<StudentLoansTabProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">Student Loan Plans</label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-gray-400 hover:text-sunset-text transition-colors flex items-center text-xs"
            >
              <Info className="w-4 h-4 mr-1" />
              About the plans
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 text-sm bg-orange-50 shadow-lg rounded-lg border border-gray-200">
            <div className="space-y-2">
              <p><strong>Plan 1:</strong> For students who started before September 2012 in England/Wales, or since September 1998 in Scotland/Northern Ireland.</p>
              <p><strong>Plan 2:</strong> For students who started after September 2012 in England/Wales.</p>
              <p><strong>Plan 4:</strong> For Scottish students who started after September 2012.</p>
              <p><strong>Plan 5:</strong> For students starting university from September 2023 in England.</p>
              <p><strong>Postgraduate Loan:</strong> For Master's or Doctoral degrees.</p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            handleInputChange({
              target: { name: 'studentLoan', value: 'plan1', type: 'checkbox', checked: !formData.studentLoan.includes('plan1') }
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          className={`py-3 px-4 rounded-lg text-center transition-all duration-200 ${
            formData.studentLoan.includes('plan1')
              ? 'gradient-button text-white font-medium shadow-lg'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Plan 1
        </button>
        <button
          type="button"
          onClick={() => {
            handleInputChange({
              target: { name: 'studentLoan', value: 'plan2', type: 'checkbox', checked: !formData.studentLoan.includes('plan2') }
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          className={`py-3 px-4 rounded-lg text-center transition-all duration-200 ${
            formData.studentLoan.includes('plan2')
              ? 'gradient-button text-white font-medium shadow-lg'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Plan 2
        </button>
        <button
          type="button"
          onClick={() => {
            handleInputChange({
              target: { name: 'studentLoan', value: 'plan4', type: 'checkbox', checked: !formData.studentLoan.includes('plan4') }
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          className={`py-3 px-4 rounded-lg text-center transition-all duration-200 ${
            formData.studentLoan.includes('plan4')
              ? 'gradient-button text-white font-medium shadow-lg'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Plan 4 (Scotland)
        </button>
        <button
          type="button"
          onClick={() => {
            handleInputChange({
              target: { name: 'studentLoan', value: 'plan5', type: 'checkbox', checked: !formData.studentLoan.includes('plan5') }
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          className={`py-3 px-4 rounded-lg text-center transition-all duration-200 ${
            formData.studentLoan.includes('plan5')
              ? 'gradient-button text-white font-medium shadow-lg'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Plan 5
        </button>
        <button
          type="button"
          onClick={() => {
            handleInputChange({
              target: { name: 'studentLoan', value: 'postgrad', type: 'checkbox', checked: !formData.studentLoan.includes('postgrad') }
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          className={`col-span-2 py-3 px-4 rounded-lg text-center transition-all duration-200 ${
            formData.studentLoan.includes('postgrad')
              ? 'gradient-button text-white font-medium shadow-lg'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Postgraduate Loan
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Select all that apply. You can have multiple student loan plans at once.
      </p>
    </div>
  );
};

export default StudentLoansTab;