import { useEffect } from 'react';
import { PoundSterling } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTakeHomePay } from '../hooks/useTakeHomePay';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import TakeHomePayForm from '../components/take-home-pay/TakeHomePayForm';
import TakeHomePayResults from '../components/take-home-pay/TakeHomePayResults';
import TakeHomePayInfo from '../components/take-home-pay/TakeHomePayInfo';

export default function TakeHomePay() {
  const {
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
    formatCurrency,
    handleInputChange,
    calculateTakeHome,
    toggleItem,
    getSalaryPercentile
  } = useTakeHomePay();

  // Get current URL
  const location = useLocation();

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('salary') || params.has('bonus')) {
      const salary = Number(params.get('salary')) || 30000;
      const bonus = Number(params.get('bonus')) || 0;
      const studentLoan = params.get('studentLoan')?.split(',') || [];
      const scotland = params.get('scotland') === 'true';
      const noNI = params.get('noNI') === 'true';
      const blind = params.get('blind') === 'true';
      const pensionType = params.get('pension') as any || 'none';
      const pensionValue = Number(params.get('pensionValue')) || 0;
      const pensionValueType = params.get('pensionValueType') as any || 'percentage';
      
      setFormData({
        annualGrossSalary: salary,
        annualGrossBonus: bonus,
        studentLoan,
        residentInScotland: scotland,
        noNI,
        blind,
        pensionType,
        pensionValue,
        pensionValueType
      });
      
      setInputValues({
        annualGrossSalary: formatNumberWithCommas(salary),
        annualGrossBonus: formatNumberWithCommas(bonus),
        pensionValue: pensionValue.toString()
      });
    }
  }, []);

  // Use our custom keyboard shortcut hook to trigger calculation on Enter key
  // Set triggerOnFormElements to true to always trigger, even when typing in inputs
  useKeyboardShortcut('Enter', calculateTakeHome, { 
    triggerOnFormElements: true 
  });

  return (
    <main className="pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center mb-6">
            <PoundSterling className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 logo-text bg-gradient-to-r from-sunset-start via-sunset-middle to-sunset-end bg-clip-text text-transparent leading-tight">
            What's My<br className="sm:hidden" /> Take-Home Pay?
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate your take-home pay after tax, National Insurance, and other deductions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calculator Form */}
          <TakeHomePayForm 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            formData={formData}
            inputValues={inputValues}
            handleInputChange={handleInputChange}
            showInfo={showInfo}
            setShowInfo={setShowInfo}
            isCalculating={isCalculating}
            calculateTakeHome={calculateTakeHome}
          />
          
          {/* Results Panel */}
          <TakeHomePayResults 
            results={results}
            formData={formData}
            formatCurrency={formatCurrency}
            showInfo={showInfo}
            setShowInfo={setShowInfo}
            openItems={openItems}
            toggleItem={toggleItem}
            getSalaryPercentile={getSalaryPercentile}
          />
        </div>

        {/* Understanding your take home pay section */}
        <TakeHomePayInfo openItems={openItems} toggleItem={toggleItem} />
      </div>
    </main>
  );
}

export { TakeHomePay }