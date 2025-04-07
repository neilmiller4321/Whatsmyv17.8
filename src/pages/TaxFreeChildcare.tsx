import React, { useState, useRef, useEffect } from 'react';
import { HelpingHand, Info, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { CalculatorInputs, CalculatorResults, MonthlyBreakdown } from '../types/calculator';

export function TaxFreeChildcare() {
  const location = useLocation();
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthlyChildcareCosts: {
      month1: 0,
      month2: 0,
      month3: 0,
    },
    allowanceUsed: 0,
    monthsUsed: 1,
    calculationPeriod: '1month'
  });
  const [inputValues, setInputValues] = useState({
    month1: '',
    month2: '',
    month3: '', 
    allowanceUsed: '' 
  });

  // Auto-calculate results whenever inputs change
  useEffect(() => {
    calculateResults();
  }, [inputs]);

  // Handle state from childcare cost calculator
  useEffect(() => {
    if (location.state?.monthlyChildcareCosts) {
      const { monthlyChildcareCosts } = location.state;
      
      // Update inputs
      setInputs(prev => ({
        ...prev,
        monthlyChildcareCosts,
        calculationPeriod: '3month'
      }));
      
      // Update input values
      setInputValues(prev => ({
        ...prev,
        month1: monthlyChildcareCosts.month1.toFixed(2),
        month2: monthlyChildcareCosts.month2.toFixed(2),
        month3: monthlyChildcareCosts.month3.toFixed(2)
      }));
    }
  }, [location.state]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    month?: string
  ) => {
    let { name, value } = e.target;
    
    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    
    // Limit to 2 decimal places
    if (parts[1]?.length > 2) {
      value = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }
    
    // For allowanceUsed, ensure value doesn't exceed 500
    if (name === 'allowanceUsed') {
      const numericValue = parseFloat(value || '0');
      if (numericValue > 500) {
        value = '500.00';
      }
    }
    
    if (month) {
      // Update display value
      setInputValues(prev => ({
        ...prev,
        [month]: value
      }));
      
      // Update actual value for calculations
      setInputs((prev) => ({
        ...prev,
        monthlyChildcareCosts: {
          ...prev.monthlyChildcareCosts,
          [month]: value === '' ? 0 : parseFloat(value) || 0,
        },
      }));
    } else {
      // Update display value
      setInputValues(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Update actual value for calculations
      setInputs((prev) => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value) || 0,
      }));
    }
  };

  const calculateResults = () => {
    // Only consider allowance used if it's greater than 0
    const shouldConsiderAllowance = inputs.allowanceUsed > 0;
    
    const monthlyBreakdown: MonthlyBreakdown[] = [];
    let totalSavings = 0;
    let totalParentContribution = 0;
    let remainingQuarterlyAllowance = shouldConsiderAllowance ? 500 - inputs.allowanceUsed : 500;
    let currentQuarterContribution = shouldConsiderAllowance ? inputs.allowanceUsed : 0;
    let allowanceResetMonth: number | null = null;
    
    // Calculate when allowance resets based on months used (only if allowance is being considered)
    const monthsUntilReset = shouldConsiderAllowance ? 3 - inputs.monthsUsed : null;

    // Calculate for each month
    Object.entries(inputs.monthlyChildcareCosts)
      .slice(0, inputs.calculationPeriod === '1month' ? 1 : 3)
      .forEach(([month, cost], index) => {
      // Check if allowance resets this month (only if we're tracking allowance)
      if (shouldConsiderAllowance && monthsUntilReset === index) {
        remainingQuarterlyAllowance = 500;
        currentQuarterContribution = 0;
        allowanceResetMonth = index + 1;
      }
      
      // Calculate potential government top-up
      let governmentTopUp = cost * 0.2;
      
      // Apply quarterly cap
      if (currentQuarterContribution + governmentTopUp > 500) {
        governmentTopUp = Math.max(0, 500 - currentQuarterContribution);
      }
      
      let parentContribution = cost - governmentTopUp;

      totalSavings += governmentTopUp;
      totalParentContribution += parentContribution;
      currentQuarterContribution += governmentTopUp;
      
      // Only track remaining allowance if we're considering it
      if (shouldConsiderAllowance) {
        remainingQuarterlyAllowance -= governmentTopUp;
      }

      monthlyBreakdown.push({
        month: `Month ${index + 1}`,
        childcareCost: cost,
        parentContribution,
        governmentTopUp
      });
    });

    setResults({
      totalSavings,
      totalParentContribution,
      remainingAllowance: remainingQuarterlyAllowance,
      allowanceResetMonth,
      monthlyBreakdown
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!resultsRef.current || !results) return;

    const content = `Tax-Free Childcare Calculation Results\n\n` +
      `Total Savings: £${results.totalSavings.toFixed(2)}\n` +
      `Your Contribution: £${results.totalParentContribution.toFixed(2)}\n` +
      `Remaining Quarterly Allowance: £${results.remainingAllowance.toFixed(2)}\n` +
      `${results.allowanceResetMonth ? `Allowance resets in Month ${results.allowanceResetMonth}\n` : ''}\n` +
      `Monthly Breakdown:\n` +
      results.monthlyBreakdown.map(month => 
        `${month.month}\n` +
        `  Childcare Cost: £${month.childcareCost.toFixed(2)}\n` +
        `  Your Contribution: £${month.parentContribution.toFixed(2)}\n` +
        `  Government Top-up: £${month.governmentTopUp.toFixed(2)}\n`
      ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tax-free-childcare-calculation.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center mb-6">
            <HelpingHand className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 logo-text bg-gradient-to-r from-sunset-start via-sunset-middle to-sunset-end bg-clip-text text-transparent leading-tight">
            What's My<br className="sm:hidden" /> Tax-Free Childcare?
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate how much you could save with Tax-Free Childcare. For every £8 you pay, the government adds £2, up to £2,000 per child per year.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calculator Form */}
          <div className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
            <h2 className="text-xl font-semibold mb-6">Childcare Details</h2>
            
            <div className="space-y-6">
              {/* Calculation Period Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Calculation Period
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setInputs(prev => ({ ...prev, calculationPeriod: '1month' }))}
                    className={`py-3 px-4 rounded-lg text-center transition-all duration-200 ${
                      inputs.calculationPeriod === '1month'
                        ? 'gradient-button text-white font-medium'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    1 Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputs(prev => ({ ...prev, calculationPeriod: '3month' }))}
                    className={`py-3 px-4 rounded-lg text-center transition-all duration-200 ${
                      inputs.calculationPeriod === '3month'
                        ? 'gradient-button text-white font-medium'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    3 Months
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Childcare Costs</h3>
                {['month1', 'month2', 'month3'].slice(0, inputs.calculationPeriod === '1month' ? 1 : 3).map((month, index) => (
                  <div key={month}>
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      Month {index + 1}
                      {index === 0 && (
                        <span className="ml-1 inline-block" title="Enter the amount invoiced by your childcare provider">
                          <Info className="h-4 w-4 text-gray-400" />
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        min="0"
                        value={inputValues[month as keyof typeof inputValues]}
                        onChange={(e) => handleInputChange(e, month)}
                        className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    Allowance Already Used This Quarter
                    <span className="ml-1 inline-block" title="The amount of your £500 quarterly allowance that you've already used">
                      <Info className="h-4 w-4 text-gray-400" />
                    </span>
                  </label>
                  <p className="text-sm mb-2">
                    <strong><u><a href="https://www.gov.uk/sign-in-childcare-account" target="_blank" rel="noopener noreferrer" className="text-sunset-text hover:text-sunset-text-hover">Unsure? Check here</a></u></strong>
                  </p>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="allowanceUsed"
                      min="0"
                      max="500"
                      value={inputValues.allowanceUsed}
                      onChange={handleInputChange}
                      className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                      placeholder="0.00"
                    />
                  </div>
                  
                  {inputs.allowanceUsed > 0 && inputs.calculationPeriod === '3month' && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700 mb-2">
                        Months already used
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="relative flex items-center">
                          <input
                            type="radio"
                            name="monthsUsed"
                            checked={inputs.monthsUsed === 1}
                            onChange={() => setInputs(prev => ({ ...prev, monthsUsed: 1 }))}
                            className="sr-only peer"
                          />
                          <div className="w-full h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg peer-checked:border-sunset-start peer-checked:bg-sunset-start/5 transition-all duration-200">
                            <span className="text-sm font-medium peer-checked:text-sunset-text">1 Month</span>
                          </div>
                        </label>
                        
                        <label className="relative flex items-center">
                          <input
                            type="radio"
                            name="monthsUsed"
                            checked={inputs.monthsUsed === 2}
                            onChange={() => setInputs(prev => ({ ...prev, monthsUsed: 2 }))}
                            className="sr-only peer"
                          />
                          <div className="w-full h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg peer-checked:border-sunset-start peer-checked:bg-sunset-start/5 transition-all duration-200">
                            <span className="text-sm font-medium peer-checked:text-sunset-text">2 Months</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                This calculator provides estimates only. Actual amounts may vary. Please verify with official government sources.
              </p>
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
            <h2 className="text-xl font-semibold mb-4">Results</h2>

            {results ? (
              <div ref={resultsRef} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gradient-to-br from-sunset-start/10 to-sunset-end/10 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Total Savings</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {new Intl.NumberFormat('en-GB', {
                        style: 'currency',
                        currency: 'GBP',
                        minimumFractionDigits: 2
                      }).format(results.totalSavings)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Over {inputs.calculationPeriod === '1month' ? '1 month' : '3 months'}
                      {results.allowanceResetMonth && (
                        <span className="block text-xs text-sunset-text mt-1">
                          Note: Quarterly allowance reset in month {results.allowanceResetMonth}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">Monthly Breakdown</h3>
                  {results.monthlyBreakdown.map((month, index) => (
                    <div
                      key={month.month}
                      className="p-3 rounded-lg bg-gradient-to-br from-sunset-start/5 to-sunset-end/5"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{month.month}</span>
                        <span className="text-sm font-medium">
                          {new Intl.NumberFormat('en-GB', {
                            style: 'currency',
                            currency: 'GBP',
                            minimumFractionDigits: 2
                          }).format(month.childcareCost)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Your contribution</span>
                          <span>
                            {new Intl.NumberFormat('en-GB', {
                              style: 'currency',
                              currency: 'GBP',
                              minimumFractionDigits: 2
                            }).format(month.parentContribution)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Government top-up</span>
                          <span>
                            {new Intl.NumberFormat('en-GB', {
                              style: 'currency',
                              currency: 'GBP',
                              minimumFractionDigits: 2
                            }).format(month.governmentTopUp)}
                          </span>
                        </div>
                        {results.allowanceResetMonth === index + 1 && (
                          <div className="mt-2 pt-2 border-t border-gray-200/50">
                            <p className="text-sm text-sunset-text font-bold text-center">
                              Quarterly allowance reset
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="bg-gradient-to-br from-sunset-start/10 to-sunset-end/10 p-4 rounded-lg text-center">
                    <p className="text-gray-800 font-medium mb-3">
                      Need help estimating your childcare costs?
                    </p>
                    <Link to="/childcare-cost" className="text-sunset-text hover:text-sunset-text-hover font-medium">
                      <button className="gradient-button text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-all duration-300 hover:shadow-lg">
                        <span>Calculate Your Childcare Costs</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-gray-500 mb-2">Enter your childcare costs and click calculate to see your potential savings.</p>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sunset-start/20 via-sunset-middle/20 to-sunset-end/20 flex items-center justify-center mt-4">
                  <HelpingHand className="w-6 h-6 text-sunset-middle opacity-60" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-sm rounded-none md:rounded-2xl p-4 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transform-gpu">
          <h2 className="text-xl font-semibold mb-4">Understanding Tax-Free Childcare</h2>
          
          <div className="space-y-4 text-gray-600">
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-lg p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
              <h3 className="text-lg font-semibold mb-2">How it Works</h3>
              <p>
                Tax-Free Childcare helps working parents with childcare costs. For every £8 you pay into your childcare account, the government adds £2, up to a maximum of £2,000 per child per year (or £4,000 for disabled children).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-lg p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
                <h4 className="font-medium text-gray-800 mb-2">Eligibility</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Your child must be under 11 (or 17 if disabled)</li>
                  <li>You must be working (including self-employed)</li>
                  <li>Each parent must earn at least £152 per week</li>
                  <li>Neither parent can earn over £100,000 per year</li>
                  <li>Your childcare provider must be registered with Ofsted</li>
                  <li><strong><u><a href="https://www.gov.uk/tax-free-childcare" target="_blank" rel="noopener noreferrer" className="text-sunset-text hover:text-sunset-text-hover">Check if you're eligible</a></u></strong></li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-lg p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
                <h4 className="font-medium text-gray-800 mb-2">Key Points</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>20% government top-up on your contributions</li>
                  <li>Maximum of £500 government top-up per quarter</li>
                  <li>Can be used alongside 15/30 hours free childcare</li>
                  <li>Money can be withdrawn if not used</li>
                  <li>Available in England, Scotland, Wales and Northern Ireland</li>
                  <li><strong><u><a href="https://www.gov.uk/apply-for-tax-free-childcare" target="_blank" rel="noopener noreferrer" className="text-sunset-text hover:text-sunset-text-hover">Apply for Tax-Free Childcare here</a></u></strong></li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50/80 to-red-50/80 rounded-lg p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu mt-4">
              <p className="text-sm">
                <strong>Important:</strong> You cannot use Tax-Free Childcare at the same time as:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm">
                <li>Universal Credit childcare element</li>
                <li>Tax Credits childcare element</li>
                <li>Childcare vouchers through salary sacrifice</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}