import { useLocation } from 'react-router-dom';
import { Info, ChevronDown, PoundSterling, X, HelpCircle } from 'lucide-react';
import { calculateTaxes } from '../../utils/taxCalculator';
import { ShareResults } from './ShareResults';
import { FormData } from '../../hooks/useTakeHomePay';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TakeHomePayResultsProps {
  results: ReturnType<typeof calculateTaxes> | null;
  formData: FormData;
  formatCurrency: (value: number) => string;
  showInfo: string | null;
  setShowInfo: (info: string | null) => void;
  openItems: string[];
  toggleItem: (id: string) => void;
  getSalaryPercentile: () => number;
}

const TakeHomePayResults: React.FC<TakeHomePayResultsProps> = ({
  results,
  formData,
  formatCurrency,
  showInfo,
  setShowInfo,
  openItems,
  toggleItem,
  getSalaryPercentile
}) => {
  const location = useLocation();

  if (!results) {
    return (
      <div className="bg-white/90 backdrop-blur-[2px] rounded-xl p-6 gradient-border p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center">Your results</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 mb-2">Enter your income details and click calculate to see your take-home pay breakdown.</p>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sunset-start/20 via-sunset-middle/20 to-sunset-end/20 flex items-center justify-center mt-4">
            <PoundSterling className="w-6 h-6 text-sunset-middle opacity-60" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/90 backdrop-blur-[2px] rounded-xl p-6 gradient-border p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center">Your results</h2>
        
        <div className="flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-base text-gray-600">Your Take Home Pay</p>
            <p className="text-3xl sm:text-4xl font-bold text-sunset-middle">
              {formatCurrency(results.regularMonth.takeHome)}
            </p>
            <p className="text-base text-gray-600">monthly</p>
            <p className="text-sm sm:text-base font-medium text-gray-600">
              {formatCurrency(results.takeHomePay)} annually
            </p>
          </div>

          <div className="border-t border-gray-100/50 my-4 w-full"></div>

          <div className="text-center">
            <p className="text-base text-gray-600 flex items-center justify-center">
              Effective Tax Rate
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="ml-2 text-gray-400 hover:text-sunset-text transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 text-sm bg-orange-50 shadow-lg rounded-lg border border-gray-200">
                  <p>Your effective tax rate includes your total tax and National Insurance contributions. It represents the average rate at which your income is taxed.</p>
                </PopoverContent>
              </Popover>
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-sunset-middle">
              {((results.combinedTaxes / results.annualGrossIncome.total) * 100).toFixed(1)}%
            </p>
            <p className="text-sm sm:text-base font-medium text-gray-600">
              of gross income
            </p>
          </div>

          <div className="border-t border-gray-100/50 my-4 w-full"></div>

          <div className="text-center">
            <p className="text-base text-gray-600 flex items-center justify-center">
              Your salary is higher than
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="ml-2 text-gray-400 hover:text-sunset-text transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 text-sm bg-orange-50 shadow-lg rounded-lg border border-gray-200">
                  <p>Based on data from the Office for National Statistics (ONS) Annual Survey of Hours and Earnings. It shows how your salary compares to other UK earners.</p>
                </PopoverContent>
              </Popover>
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-sunset-middle">
              {getSalaryPercentile()}%
            </p>
            <p className="text-sm sm:text-base font-medium text-gray-600">
              of UK earners
            </p>
          </div>
        </div>
      </div>
      
      {/* Detailed Tax Breakdown */}
        {results && (
            <div className="md:col-span-3 w-full bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border overflow-hidden">
            <h2 className="text-xl font-semibold mb-4">Your results</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100/50">
            <div className="overflow-x-auto rounded-xl border border-gray-100/50">
              <table className="w-full min-w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-sunset-start via-sunset-middle to-sunset-end text-white divide-x divide-white/20 overflow-hidden">
                    <th className="text-left py-4 px-4 font-medium text-center"></th>
                    <th className="py-4 px-4 font-medium text-center">Year</th>
                    {formData.annualGrossBonus > 0 && (
                      <th className="py-4 px-4 font-medium text-center">Bonus Month</th>
                    )}
                    <th className="py-4 px-4 font-medium text-center">Month</th>
                    <th className="py-4 px-4 font-medium text-center">Week</th>
                    <th className="py-4 px-4 font-medium text-center">Day</th>
                    {formData.showHourlyColumn && (
                      <th className="py-4 px-4 font-medium text-center">Hour</th>
                    )}
                  </tr>
                </thead>
                <tbody className="whitespace-nowrap">
                  {/* Gross Income */}
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">Gross income</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.annualGrossIncome.total)}</td>
                    {formData.annualGrossBonus > 0 && (
                      <td className="text-center py-3 px-4">{formatCurrency(results.bonusMonth.grossPay)}</td>
                    )}
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.grossPay)}</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.grossPay * 12 / 52)}</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.grossPay * 12 / ((formData.workingDaysPerWeek || 5) * 52))}</td>
                    {formData.showHourlyColumn && (
                      <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.grossPay * 12 / ((formData.workingDaysPerWeek || 5) * 52) / (formData.workingHoursPerDay || 7))}</td>
                    )}
                  </tr>
                  
                  {/* Personal Allowance - Enhanced display logic */}
                  {/* Show if income before pension adjustments > 100,000 OR if personal allowance is tapered */}
                  {(results.annualGrossIncome.total > 100000 || 
                    (results.taxAllowance.total < 12570 && results.taxAllowance.total > 0)) && (
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        Personal allowance
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button" className="ml-2 text-gray-400 hover:text-sunset-text transition-colors">
                              <HelpCircle className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-4 text-sm bg-orange-50 shadow-lg rounded-lg border border-gray-200">
                            <p>Personal allowance is reduced by £1 for every £2 of income above £100,000 after pension contributions.</p>
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="text-center py-3 px-4">{formatCurrency(results.taxAllowance.total)}</td>
                      {formData.annualGrossBonus > 0 && (
                        <td className="text-center py-3 px-4">
                          {formatCurrency(results.bonusMonth.personalAllowance / 12)}
                        </td>
                      )}
                      <td className="text-center py-3 px-4">{formatCurrency(results.taxAllowance.total / 12)}</td>
                      <td className="text-center py-3 px-4">{formatCurrency(results.taxAllowance.total / 52)}</td>
                      <td className="text-center py-3 px-4">{formatCurrency(results.taxAllowance.total / ((formData.workingDaysPerWeek || 5) * 52))}</td>
                      {formData.showHourlyColumn && (
                        <td className="text-center py-3 px-4">{formatCurrency(results.taxAllowance.total / ((formData.workingDaysPerWeek || 5) * 52) / (formData.workingHoursPerDay || 7))}</td>
                      )}
                    </tr>
                  )}
                  
                  {/* Pension Deductions */}
                  {results.pensionContribution.total > 0 && (
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4">Pension deductions</td>
                      <td className="text-center py-3 px-4">{formatCurrency(results.pensionContribution.total)}</td>
                      {formData.annualGrossBonus > 0 && (
                        <td className="text-center py-3 px-4">{formatCurrency(results.bonusMonth.pensionContribution)}</td>
                      )}
                      <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.pensionContribution)}</td>
                      <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.pensionContribution * 12 / 52)}</td>
                      <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.pensionContribution * 12 / ((formData.workingDaysPerWeek || 5) * 52))}</td>
                      {formData.showHourlyColumn && (
                        <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.pensionContribution * 12 / ((formData.workingDaysPerWeek || 5) * 52) / (formData.workingHoursPerDay || 7))}</td>
                      )}
                    </tr>
                  )}
                  
                  {/* Taxable Income */}
                  <tr className="bg-gray-50/50 hover:bg-gray-50">
                    <td className="py-3 px-4">Taxable income</td>
                    <td className="text-center py-3 px-4">
                      {formatCurrency(results.taxableIncome)}
                    </td>
                    {formData.annualGrossBonus > 0 && (
                      <td className="text-center py-3 px-4">{formatCurrency(results.bonusMonth.taxableIncome)}</td>
                    )}
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.taxableIncome)}</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.taxableIncome * 12 / 52)}</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.taxableIncome * 12 / ((formData.workingDaysPerWeek || 5) * 52))}</td>
                    {formData.showHourlyColumn && (
                      <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.taxableIncome * 12 / ((formData.workingDaysPerWeek || 5) * 52) / (formData.workingHoursPerDay || 7))}</td>
                    )}
                  </tr>
                  
                  {/* Income Tax */}
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 flex items-center">
                      Income tax
                      <button 
                        type="button"
                        className="ml-2 text-gray-400 hover:text-sunset-text transition-colors"
                        onClick={() => setShowInfo(showInfo === 'incomeTax' ? null : 'incomeTax')}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      {showInfo === 'incomeTax' && (
                        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-100/50 w-80">
                          <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h4 className="font-medium">Tax Breakdown</h4>
                            <button
                              onClick={() => setShowInfo(null)}
                              className="text-gray-400 hover:text-sunset-text transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4">
                            {formData.residentInScotland && results.annualGrossIncome.total > 100000 && results.taxAllowance.total < 12570 ? (
                              // For Scottish taxpayers with personal allowance taper
                              results.incomeTax.breakdown.map(({ rate, amount }) => {
                                if (rate === "Advanced Rate" && results.taxAllowance.total < 12570) {
                                  // Calculate the additional tax due to personal allowance taper
                                  const personalAllowanceReduction = 12570 - results.taxAllowance.total;
                                  // This is the amount taxed at advanced rate (45%) due to reduced allowance
                                  const additionalAdvancedRateTax = personalAllowanceReduction * 0.45;
                                  // Add this amount to the displayed advanced rate
                                  return (
                                    <div key={rate} className="flex justify-between text-sm mb-1">
                                      <span>{rate}:</span>
                                      <span>{formatCurrency(amount + additionalAdvancedRateTax)}</span>
                                    </div>
                                  );
                                }
                                return (
                                  <div key={rate} className="flex justify-between text-sm mb-1">
                                    <span>{rate}:</span>
                                    <span>{formatCurrency(amount)}</span>
                                  </div>
                                );
                              })
                            ) : (
                              // For all other taxpayers, show normal breakdown
                              results.incomeTax.breakdown.map(({ rate, amount }) => (
                                <div key={rate} className="flex justify-between text-sm mb-1">
                                  <span>{rate}:</span>
                                  <span>{formatCurrency(amount)}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.incomeTax.total)}</td>
                    {formData.annualGrossBonus > 0 && (
                      <td className="text-center py-3 px-4">{formatCurrency(results.bonusMonth.tax)}</td>
                    )}
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.tax)}</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.tax * 12 / 52)}</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.tax * 12 / ((formData.workingDaysPerWeek || 5) * 52))}</td>
                    {formData.showHourlyColumn && (
                      <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.tax * 12 / ((formData.workingDaysPerWeek || 5) * 52) / (formData.workingHoursPerDay || 7))}</td>
                    )}
                  </tr>
                  
                  {/* National Insurance */}
                  <tr className="bg-gray-50/50 hover:bg-gray-50">
                    <td className="py-3 px-4">National Insurance</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.employeeNI.total)}</td>
                    {formData.annualGrossBonus > 0 && (
                      <td className="text-center py-3 px-4">{formatCurrency(results.bonusMonth.ni)}</td>
                    )}
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.ni)}</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.ni * 12 / 52)}</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.ni * 12 / ((formData.workingDaysPerWeek || 5) * 52))}</td>
                    {formData.showHourlyColumn && (
                      <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.ni * 12 / ((formData.workingDaysPerWeek || 5) * 52) / (formData.workingHoursPerDay || 7))}</td>
                    )}
                  </tr>
                  
                  {/* Student Loan - Combined total */}
                  {results.studentLoanRepayments.total > 0 && (
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4">Student loan</td>
                      <td className="text-center py-3 px-4">{formatCurrency(results.studentLoanRepayments.total)}</td>
                      {formData.annualGrossBonus > 0 && (
                        <td className="text-center py-3 px-4">{formatCurrency(results.bonusMonth.studentLoan)}</td>
                      )}
                      <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.studentLoan)}</td>
                      <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.studentLoan * 12 / 52)}</td>
                      <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.studentLoan * 12 / ((formData.workingDaysPerWeek || 5) * 52))}</td>
                      {formData.showHourlyColumn && (
                        <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.studentLoan * 12 / ((formData.workingDaysPerWeek || 5) * 52) / (formData.workingHoursPerDay || 7))}</td>
                      )}
                    </tr>
                  )}
                  
                  {/* Take home pay */}
                  <tr className="bg-gradient-to-r from-sunset-start/5 via-sunset-middle/5 to-sunset-end/5 font-medium">
                    <td className="py-3 px-4">Take home pay</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.takeHomePay)}</td>
                    {formData.annualGrossBonus > 0 && (
                      <td className="text-center py-3 px-4">{formatCurrency(results.bonusMonth.takeHome)}</td>
                    )}
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.takeHome)}</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.takeHome * 12 / 52)}</td>
                    <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.takeHome * 12 / ((formData.workingDaysPerWeek || 5) * 52))}</td>
                    {formData.showHourlyColumn && (
                      <td className="text-center py-3 px-4">{formatCurrency(results.regularMonth.takeHome * 12 / ((formData.workingDaysPerWeek || 5) * 52) / (formData.workingHoursPerDay || 7))}</td>
                    )}
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <ShareResults
                title="My Take-Home Pay Results"
                url={`${window.location.origin}${location.pathname}?salary=${formData.annualGrossSalary}&bonus=${formData.annualGrossBonus}&studentLoan=${formData.studentLoan.join(',')}&scotland=${formData.residentInScotland}&noNI=${formData.noNI}&blind=${formData.blind}&pension=${formData.pensionType}&pensionValue=${formData.pensionValue}&pensionValueType=${formData.pensionValueType}`}
              />
            </div>
          </div>
        )}
    </>
  );
};

export default TakeHomePayResults;