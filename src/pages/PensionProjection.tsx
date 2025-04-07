
import React, { useState, useEffect } from 'react';
import { LineChart } from 'lucide-react';
import { PensionChart } from '../components/pension/PensionChart';
import { ContributionBreakdown } from '../components/pension/ContributionBreakdown';
import { ProjectionSummary } from '../components/pension/ProjectionSummary';
import { PensionForm } from '../components/pension/PensionForm';
import { EducationalContent } from '../components/pension/EducationalContent';
import { calculatePensionProjection } from '../utils/pensionCalculator';
import type { 
  PersonalInfo,
  AssetAllocation,
  ExpectedReturns,
  ProjectionResult,
  PensionSummary
} from '../types/pension';

interface InputFieldState {
  currentAge: string;
  retirementAge: string;
  currentSalary: string;
  currentPensionValue: string;
  monthlyContribution: string;
  employerContribution: string;
  inflationRate: string;
  salaryGrowthRate: string;
  stocks: string;
  bonds: string;
  cash: string;
  stocksReturn: string;
  bondsReturn: string;
  cashReturn: string;
}

function PensionProjection() {
  // Add state for selected year
  const [selectedYear, setSelectedYear] = useState<number>(68);

  // Form state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    currentAge: 30,
    retirementAge: 68,
    currentSalary: 35000,
    currentPensionValue: 25000,
    monthlyContribution: 5,
    monthlyContributionType: 'percentage',
    employerContribution: 3,
    employerContributionType: 'percentage',
    inflationRate: 2,
    salaryGrowthRate: 2
  });

  const [allocation, setAllocation] = useState<AssetAllocation>({
    stocks: 80,
    bonds: 15,
    cash: 5
  });

  const [returns, setReturns] = useState<ExpectedReturns>({
    stocks: 7,
    bonds: 3,
    cash: 1
  });

  // Input field values (as strings to handle formatting)
  const [inputValues, setInputValues] = useState<InputFieldState>({
    currentAge: '30',
    retirementAge: '68',
    currentSalary: '35,000',
    currentPensionValue: '25,000',
    monthlyContribution: '5',
    employerContribution: '3',
    inflationRate: '2',
    salaryGrowthRate: '2',
    stocks: '80',
    bonds: '15',
    cash: '5',
    stocksReturn: '7',
    bondsReturn: '3',
    cashReturn: '1'
  });

  // Results state
  const [projectionResults, setProjectionResults] = useState<{
    yearlyProjections: ProjectionResult[];
    summary: PensionSummary;
  } | null>(null);

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showAdvancedInputs, setShowAdvancedInputs] = useState<boolean>(false);
  const [expectedReturn, setExpectedReturn] = useState<number>(6.0);

  // Calculate weighted return whenever allocation or returns change
  useEffect(() => {
    if (showAdvancedInputs) {
      const weightedReturn = (
        (allocation.stocks * returns.stocks +
        allocation.bonds * returns.bonds +
        allocation.cash * returns.cash) / 100
      );
      setExpectedReturn(Number(weightedReturn.toFixed(1)));
    }
  }, [allocation, returns, showAdvancedInputs]);

  // Calculate results whenever inputs change
  useEffect(() => {
    calculateProjection();
  }, [personalInfo, allocation, returns, expectedReturn, showAdvancedInputs]);

  const calculateProjection = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const results = calculatePensionProjection(
        personalInfo,
        allocation,
        returns,
        showAdvancedInputs ? undefined : expectedReturn
      );
      setProjectionResults(results);
      setIsCalculating(false);
    }, 300);
  };

  const yearlyDetailsForSelectedYear = (() => {
    const yearIndex = selectedYear - personalInfo.currentAge;
    if (projectionResults && yearIndex >= 0 && yearIndex < projectionResults.yearlyProjections.length) {
      const yearData = projectionResults.yearlyProjections[yearIndex];
      return {
        userContribution: yearData.userContributions,
        employerContribution: yearData.employerContributions,
        investmentGrowth: yearData.investmentGrowth,
        realValue: yearData.realValue
      };
    }
    return {
      userContribution: 0,
      employerContribution: 0,
      investmentGrowth: 0,
      realValue: 0
    };
  })();

  return (
    <main className="pt-24 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center mb-6">
            <LineChart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 logo-text bg-gradient-to-r from-sunset-start via-sunset-middle to-sunset-end bg-clip-text text-transparent leading-tight">
            What's My<br className="sm:hidden" /> Pension Projection?
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate your expected pension value at retirement based on your current savings, contributions, and investment strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator Form - Wider to accommodate inputs */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-[2px] backdrop-saturate-150 rounded-xl p-6 gradient-border w-full overflow-x-auto shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4">Personal Details</h2>
            
            <PensionForm 
              personalInfo={personalInfo}
              setPersonalInfo={setPersonalInfo}
              allocation={allocation}
              setAllocation={setAllocation}
              returns={returns}
              setReturns={setReturns}
              inputValues={inputValues}
              setInputValues={setInputValues}
              showAdvancedInputs={showAdvancedInputs}
              setShowAdvancedInputs={setShowAdvancedInputs}
              expectedReturn={expectedReturn}
              setExpectedReturn={setExpectedReturn}
            />
          </div>
          
          {/* Results Panel - Fixed width for consistent display */}
          <div className="bg-white/90 backdrop-blur-[2px] backdrop-saturate-150 rounded-xl p-6 gradient-border w-full shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300">
            
            {projectionResults ? (
              <ProjectionSummary
                summary={projectionResults.summary}
                currentAge={personalInfo.currentAge}
                retirementAge={personalInfo.retirementAge}
                selectedYear={selectedYear}
                showAdvancedInputs={showAdvancedInputs}
                onYearChange={setSelectedYear}
                yearlyDetails={yearlyDetailsForSelectedYear}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-gray-500 mb-2">Enter your pension details to see your retirement projection.</p>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sunset-start/20 via-sunset-middle/20 to-sunset-end/20 flex items-center justify-center mt-4">
                  <LineChart className="w-6 h-6 text-sunset-middle opacity-60" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Projection Chart */}
        {projectionResults && (
          <div className="mt-8 bg-white/90 backdrop-blur-[2px] backdrop-saturate-150 rounded-xl p-6 gradient-border shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300">
            <PensionChart 
              data={projectionResults.yearlyProjections} 
              selectedYear={selectedYear}
              showAdvancedInputs={showAdvancedInputs}
            />
          </div>
        )}
        
        {/* Contribution Breakdown */}
        {projectionResults && (
          <div className="mt-8 bg-white/90 backdrop-blur-[2px] backdrop-saturate-150 rounded-xl p-6 gradient-border shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300">
            <ContributionBreakdown summary={projectionResults.summary} personalInfo={personalInfo} />
          </div>
        )}
        
        {/* Additional Information */}
        <div className="mt-8 bg-white/90 backdrop-blur-[2px] backdrop-saturate-150 rounded-xl p-6 gradient-border shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4">Understanding Your Pension Projection</h2>
          <EducationalContent />
        </div>
      </div>
    </main>
  );
}

export default PensionProjection;
