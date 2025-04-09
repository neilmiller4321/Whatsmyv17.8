import React, { useRef } from 'react';
import { PoundSterling, Wallet, GraduationCap, FileCode } from 'lucide-react';
import { FormData, InputFieldState } from '../../hooks/useTakeHomePay';

// Import tab components
import SalaryTab from './tabs/SalaryTab';
import PensionTab from './tabs/PensionTab';
import StudentLoansTab from './tabs/StudentLoansTab';
import TaxCodeTab from './tabs/TaxCodeTab';

interface TakeHomePayFormProps {
  activeTab: 'salary' | 'pension' | 'student-loans' | 'tax-code' | 'additional';
  setActiveTab: (tab: 'salary' | 'pension' | 'student-loans' | 'tax-code' | 'additional') => void;
  formData: FormData;
  inputValues: InputFieldState;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  showInfo: string | null;
  setShowInfo: (info: string | null) => void;
  isCalculating: boolean;
  calculateTakeHome: () => void;
}

const TakeHomePayForm: React.FC<TakeHomePayFormProps> = ({
  activeTab,
  setActiveTab,
  formData,
  inputValues,
  handleInputChange,
  showInfo,
  setShowInfo,
  isCalculating,
  calculateTakeHome
}) => {
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({
    annualGrossSalary: null,
    annualGrossBonus: null,
    pensionValue: null
  });

  const tabs = [
    { id: 'salary', label: 'Salary', icon: <Wallet className="w-4 h-4 mr-2" /> },
    { id: 'pension', label: 'Pension', icon: <PoundSterling className="w-4 h-4 mr-2" /> },
    { id: 'student-loans', label: 'Student Loans', icon: <GraduationCap className="w-4 h-4 mr-2" /> },
    { id: 'tax-code', label: 'Tax Code', icon: <FileCode className="w-4 h-4 mr-2" /> }
  ];

  return (
    <div className="md:col-span-2 bg-white/90 backdrop-blur-sm rounded-xl p-8 gradient-border">
      <h2 className="text-xl font-semibold mb-4">Income Details</h2>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'gradient-button text-white font-medium'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Tab Content */}
        <div className={activeTab === 'salary' ? 'block' : 'hidden'}>
          <SalaryTab 
            formData={formData}
            inputValues={inputValues}
            handleInputChange={handleInputChange}
            inputRefs={inputRefs}
          />
        </div>
        
        <div className={activeTab === 'pension' ? 'block' : 'hidden'}>
          <PensionTab 
            formData={formData}
            inputValues={inputValues}
            handleInputChange={handleInputChange}
            inputRefs={inputRefs}
          />
        </div>
        
        <div className={activeTab === 'student-loans' ? 'block' : 'hidden'}>
          <StudentLoansTab 
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </div>
        
        <div className={activeTab === 'tax-code' ? 'block' : 'hidden'}>
          <TaxCodeTab 
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </div>

        {/* Calculate Button */}
        <div>
          <button
            onClick={calculateTakeHome}
            disabled={isCalculating}
            className="w-full gradient-button text-white font-medium h-12 px-6 rounded-lg transition-all duration-300 hover:shadow-lg text-base"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Take-Home Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeHomePayForm;