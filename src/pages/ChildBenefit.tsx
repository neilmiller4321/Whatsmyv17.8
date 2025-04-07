import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PoundSterling, Info, Calculator, Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Sprout, Wallet, FileText, ArrowRight, Users, X } from 'lucide-react';
import { AdjustedNetIncomeCalculator } from '../components/child-benefit/AdjustedNetIncomeCalculator';
import { calculateChildBenefit, formatCurrency, formatWeeklyAmount, FIRST_CHILD_RATE, ADDITIONAL_CHILD_RATE } from '../utils/childBenefitCalculator';

interface FormData {
  numberOfChildren: number;
  yourIncome: number;
  partnerIncome: number | null;
}

interface InputFieldState {
  yourIncome: string;
  partnerIncome: string;
}

export function ChildBenefit() {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    numberOfChildren: 1,
    yourIncome: 0,
    partnerIncome: null
  });

  // Input field values (as strings to handle formatting)
  const [inputValues, setInputValues] = useState<InputFieldState>({
    yourIncome: '',
    partnerIncome: ''
  });

  // Store cursor position for formatted inputs
  const cursorPositionRef = useRef<number | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({
    yourIncome: null,
    partnerIncome: null
  });

  // Calculate highest income between partners
  const highestIncome = Math.max(
    formData.yourIncome,
    formData.partnerIncome !== null ? formData.partnerIncome : 0
  );
  
  // Calculate Child Benefit
  const benefitResults = calculateChildBenefit(formData.numberOfChildren, highestIncome);

  // Handle input focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Store cursor position
    cursorPositionRef.current = e.target.selectionStart;
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // If the field is empty, set it back to empty string
    if (value === '') {
      setInputValues({
        ...inputValues,
        [name]: ''
      });
      
      setFormData({
        ...formData,
        [name]: 0
      });
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For currency fields, only allow digits and commas
    const cleanValue = value.replace(/[^\d,]/g, '');
    const numericString = cleanValue.replace(/,/g, '');
    
    if (numericString === '') {
      setInputValues({
        ...inputValues,
        [name]: ''
      });
      return;
    }
    
    const numericValue = parseInt(numericString);
    
    if (!isNaN(numericValue)) {
      const formattedValue = new Intl.NumberFormat('en-GB').format(numericValue);
      
      setInputValues({
        ...inputValues,
        [name]: formattedValue
      });
      
      setFormData({
        ...formData,
        [name]: numericValue
      });
    }
  };

  return (
    <main className="pt-24 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center mb-6">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 logo-text bg-gradient-to-r from-sunset-start via-sunset-middle to-sunset-end bg-clip-text text-transparent leading-tight">
            What's My<br className="sm:hidden" /> Child Benefit?
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate your Child Benefit payments and check if you'll need to pay the High Income Child Benefit Charge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Calculator Form */}
          <div className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
            <h2 className="text-xl font-semibold mb-4">Family Details</h2>
            
            <div className="space-y-4">
              {/* Number of Children */}
              <div>
                <label htmlFor="numberOfChildren" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Children
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, numberOfChildren: Math.max(1, prev.numberOfChildren - 1) }))}
                    className="px-4 py-2 border border-gray-300 rounded-l-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sunset-start"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    id="numberOfChildren"
                    value={formData.numberOfChildren}
                    readOnly
                    className="w-16 text-center border-y border-gray-300 py-2 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, numberOfChildren: Math.min(20, prev.numberOfChildren + 1) }))}
                    className="px-4 py-2 border border-gray-300 rounded-r-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sunset-start"
                  >
                    +
                  </button>
                </div>
                <div className="mt-2 p-3 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 text-sunset-text flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    You can claim for children under 16, or under 20 if they're in approved education or training
                  </p>
                </div>
              </div>

              {/* Your Income */}
              <div>
                <label htmlFor="yourIncome" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Adjusted Net Annual Income
                  <button
                    type="button" 
                    className="ml-1 text-gray-400 hover:text-sunset-text transition-colors"
                    onClick={() => {
                      const infoBox = document.getElementById('incomeInfo');
                      if (infoBox) {
                        infoBox.classList.toggle('opacity-0');
                        infoBox.classList.toggle('pointer-events-none');
                      }
                    }}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const calculator = document.querySelector('.AdjustedNetIncomeCalculator');
                      if (calculator) {
                        const headerOffset = 96; // 24px * 4 for pt-24
                        const elementPosition = calculator.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className="ml-1 text-sunset-text hover:text-sunset-text-hover font-bold transition-colors"
                  >
                    Unsure? Check here
                  </button>
                </label>
                <div
                  id="incomeInfo"
                  className="absolute z-50 w-72 p-4 bg-white rounded-lg shadow-lg border border-gray-100/50 transition-opacity duration-200 opacity-0 pointer-events-none mt-1"
                >
                  <button
                    onClick={() => {
                      const infoBox = document.getElementById('incomeInfo');
                      if (infoBox) {
                        infoBox.classList.add('opacity-0', 'pointer-events-none');
                      }
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-sunset-text transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-sm text-gray-600 mb-3">
                    Adjusted net income is your total taxable income before personal allowances and tax reliefs, minus things like pension contributions and Gift Aid donations.
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                  <input
                    ref={(el) => inputRefs.current.yourIncome = el}
                    type="text"
                    inputMode="numeric"
                    id="yourIncome"
                    name="yourIncome"
                    value={inputValues.yourIncome}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="block w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                    placeholder="Enter your adjusted net annual income"
                  />
                </div>
              </div>
              
              {/* Partner's Income */}
              <div>
                <label htmlFor="partnerIncome" className="block text-sm font-medium text-gray-700 mb-1">
                  Partner's Adjusted Net Annual Income
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                  <input
                    ref={(el) => inputRefs.current.partnerIncome = el}
                    type="text"
                    inputMode="numeric"
                    id="partnerIncome"
                    name="partnerIncome"
                    value={inputValues.partnerIncome}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Leave blank if single parent"
                    className="block w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-sunset-text flex-shrink-0" />
                  <p className="text-xs text-gray-500">
                    The High Income Child Benefit Charge is based on the highest individual income
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
            <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-sunset-start/10 to-sunset-end/10 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">4-Weekly Payment</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(benefitResults.fourWeeklyAmount)}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Paid every 4 weeks on Monday or Tuesday
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">First Child</p>
                  <p className="text-sm font-medium">{formatWeeklyAmount(benefitResults.firstChildAmount)}</p>
                </div>
                
                {formData.numberOfChildren > 1 && (
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Additional Children</p>
                    <p className="text-sm font-medium">
                      {formData.numberOfChildren - 1} × {formatWeeklyAmount(ADDITIONAL_CHILD_RATE)}
                    </p>
                  </div>
                )}
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Weekly Amount</p>
                  <p className="text-sm font-medium">
                    {formatWeeklyAmount(benefitResults.weeklyAmount)}
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-700">Annual Total</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(benefitResults.annualAmount)}
                  </p>
                </div>
              </div>
              
              {benefitResults.chargePercentage > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 text-sunset-text" />
                      High Income Charge
                      <AlertCircle className="w-4 h-4 text-sunset-text" />
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Annual Tax Charge</p>
                        <p className="text-sm font-medium text-sunset-text">{formatCurrency(benefitResults.taxCharge)}</p>
                      </div>
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-700">Net Annual Benefit</p>
                        <p className="text-sm font-medium">{formatCurrency(benefitResults.netBenefit)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-sm rounded-none md:rounded-2xl p-4 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transform-gpu max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Understanding Child Benefit</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Rates */}
            <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center">
                  <PoundSterling className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Current Rates</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg">
                  <span className="text-sm">First Child</span>
                  <span className="font-semibold">£26.05/week</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg">
                  <span className="text-sm">Additional Children</span>
                  <span className="font-semibold">£17.25/week</span>
                </div>
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Payment Schedule</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="pl-4 -indent-4">• Paid every 4 weeks on Monday or Tuesday</li>
                <li className="pl-4 -indent-4">• Payments are made in arrears</li>
                <li className="pl-4 -indent-4">• Tax-free payments</li>
                <li className="pl-4 -indent-4">• Usually received within 3 working days</li>
              </ul>
            </div>

            {/* Key Dates */}
            <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Key Dates</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="pl-4 -indent-4">• Claim as soon as your child is born</li>
                <li className="pl-4 -indent-4">• Can be backdated up to 3 months</li>
                <li className="pl-4 -indent-4">• Continues until age 16</li>
                <li className="pl-4 -indent-4">• Or until 20 if in approved education</li>
                <li className="pl-4 -indent-4">• Tax year runs April to April</li>
              </ul>
            </div>
          </div>

          {/* High Income Child Benefit Charge Section */}
          <div className="mb-8 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-6">High Income Child Benefit Charge (HICBC)</h3>
            
            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* HICBC Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Income Threshold Card */}
                  <div className="bg-[#FFE8D9] bg-opacity-50 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#FF8C42] bg-opacity-20 flex items-center justify-center">
                        <PoundSterling className="w-5 h-5 text-sunset-text" />
                      </div>
                      <h4 className="font-semibold">Income Threshold</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Charge applies when individual income exceeds £60,000. Based on individual, not household income.
                    </p>
                  </div>
                  
                  {/* Calculation Card */}
                  <div className="bg-[#FFE5E8] bg-opacity-50 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#FF5F6D] bg-opacity-20 flex items-center justify-center">
                        <Calculator className="w-5 h-5 text-sunset-text" />
                      </div>
                      <h4 className="font-semibold">Calculation</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      1% of Child Benefit is paid back for every £200 of income above £60,000. Full amount paid back at £80,000.
                    </p>
                  </div>
                </div>

                {/* Claim Without Payments Card */}
                <div className="bg-[#E3F4F4] bg-opacity-50 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#40B5AD] bg-opacity-20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold">Claim Without Receiving Payments</h4>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    You can claim Child Benefit but opt out of receiving payments if affected by HICBC. This protects your:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-sunset-text" />
                      </div>
                      <p className="text-sm">State Pension through National Insurance credits</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-sunset-text" />
                      </div>
                      <p className="text-sm">Child's automatic National Insurance number at 16</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-4 h-4 text-sunset-text" />
                      </div>
                      <p className="text-sm">Eligibility for other benefits that require a Child Benefit claim</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Reducing Income Card */}
                <div className="bg-[#F0E6F6] bg-opacity-50 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#9B51E0] bg-opacity-20 flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold">Reducing Your Adjusted Net Income</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <PoundSterling className="w-4 h-4 text-sunset-text" />
                        Salary Sacrifice
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Pension contributions</li>
                        <li>• Childcare vouchers</li>
                        <li>• Cycle to work scheme</li>
                        <li>• Electric car scheme</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-sunset-text" />
                        Other Deductions
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Personal pension contributions</li>
                        <li>• Gift Aid donations</li>
                        <li>• Trading losses (self-employed)</li>
                      </ul>
                    </div>
                    
                    {/* Take-Home Pay CTA */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-l-4 border-sunset-start mt-4">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-sunset-text" />
                        Need Help Calculating Your Income?
                      </h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Use our take-home pay calculator to work out your adjusted net income and see if you qualify for Child Benefit payments.
                      </p>
                      <Link
                        to="/take-home-pay"
                        className="inline-flex items-center text-sm text-sunset-text hover:text-sunset-text-hover transition-colors"
                      >
                        Calculate Take-Home Pay
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Useful Resources Section */}
          <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Useful Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Official Government Links</h4>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://www.gov.uk/child-benefit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-sunset-text hover:text-sunset-text-hover transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Claim Child Benefit
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.gov.uk/child-benefit-tax-charge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-sunset-text hover:text-sunset-text-hover transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      High Income Child Benefit Charge
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.gov.uk/child-benefit-tax-calculator"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-sunset-text hover:text-sunset-text-hover transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Child Benefit Tax Calculator
                    </a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Important Information</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                  <li>Keep your personal details up to date</li>
                  <li>Report any changes in circumstances promptly</li>
                  <li>Consider opting out of payments if affected by HICBC</li>
                  <li>Keep records of any Child Benefit received</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Adjusted Net Income Calculator */}
      <AdjustedNetIncomeCalculator />
    </main>
  );
}