
import React, { useState } from 'react';
import { PoundSterling } from 'lucide-react';
import { PurchasingPowerChart } from '../components/purchasing-power/PurchasingPowerChart';
import { InflationDataSelector } from '../components/purchasing-power/InflationDataSelector';
import { PurchasingPowerForm } from '../components/purchasing-power/PurchasingPowerForm';
import { PurchasingPowerResults } from '../components/purchasing-power/PurchasingPowerResults';
import { EducationalContent } from '../components/purchasing-power/EducationalContent';
import { useInflationCalculator } from '../components/purchasing-power/InflationCalculator';

interface FormData {
  amount: number;
  startYear: number;
  endYear: number;
  dataType: 'cpi' | 'rpi';
}

function PurchasingPower() {
  const {
    isCalculating,
    results,
    calculatePurchasingPower,
    earliestCpiYear,
    earliestRpiYear,
    currentYear,
    maxFutureYear
  } = useInflationCalculator();

  // Default values for the calculator
  const [formData, setFormData] = useState<FormData>({
    amount: 1000,
    startYear: 2000,
    endYear: currentYear,
    dataType: 'cpi'
  });

  const [showDataInfo, setShowDataInfo] = useState<boolean>(false);

  const handleDataTypeChange = (dataType: 'cpi' | 'rpi') => {
    // Get the earliest year for the selected data type
    const earliestYear = dataType === 'cpi' ? earliestCpiYear : earliestRpiYear;
    
    // Update start year if it's earlier than the earliest available year for the selected data type
    let newStartYear = formData.startYear;
    if (newStartYear < earliestYear) {
      newStartYear = earliestYear;
    }
    
    setFormData({
      ...formData,
      dataType,
      startYear: newStartYear
    });
  };

  const handleCalculate = () => {
    calculatePurchasingPower(formData);
  };

  return (
    <main className="pt-24 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center mb-6">
            <PoundSterling className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 logo-text bg-gradient-to-r from-sunset-start via-sunset-middle to-sunset-end bg-clip-text text-transparent leading-tight">
            What's My<br className="sm:hidden" /> Purchasing Power?
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate how inflation affects the value of your money over time using official UK inflation data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Calculator Form */}
          <div className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
            <h2 className="text-xl font-semibold mb-4">Purchasing Power Details</h2>
            
            <InflationDataSelector 
              dataType={formData.dataType}
              onDataTypeChange={handleDataTypeChange}
              showDataInfo={showDataInfo}
              setShowDataInfo={setShowDataInfo}
              earliestCpiYear={earliestCpiYear}
              earliestRpiYear={earliestRpiYear}
            />
            
            <PurchasingPowerForm 
              formData={formData}
              setFormData={setFormData}
              isCalculating={isCalculating}
              calculatePurchasingPower={handleCalculate}
              earliestCpiYear={earliestCpiYear}
              earliestRpiYear={earliestRpiYear}
              maxFutureYear={maxFutureYear}
            />
          </div>
          
          {/* Results Panel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <PurchasingPowerResults results={results} formData={formData} />
          </div>
        </div>
        
        {/* Chart */}
        {results && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
            <h2 className="text-xl font-semibold mb-4">Value Over Time</h2>
            <PurchasingPowerChart
              startYear={formData.startYear}
              endYear={formData.endYear}
              startAmount={formData.amount}
              yearlyBreakdown={results.yearlyBreakdown}
            />
          </div>
        )}
        
        {/* Additional Information */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
          <h2 className="text-xl font-semibold mb-4">Understanding Purchasing Power</h2>
          <EducationalContent />
        </div>
      </div>
    </main>
  );
}

export default PurchasingPower;
