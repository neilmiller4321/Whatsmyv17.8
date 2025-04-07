import { motion } from 'framer-motion';
import { PoundSterling, Info, Calculator, TrendingUp, Wallet, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TakeHomePayInfoProps {
  openItems: string[];
  toggleItem: (id: string) => void;
}

const TakeHomePayInfo = ({ openItems, toggleItem }: TakeHomePayInfoProps) => {
  return (
    <motion.div 
      className="mt-16 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="section-heading mb-8">Understanding Your Take-Home Pay</h2>
      
      <div className="space-y-4 text-gray-700">
        <div className="bg-white/90 backdrop-blur-[2px] rounded-xl p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300">
            <h3 className="text-2xl font-semibold mb-4">Understanding Your Take-Home Pay</h3>

              <p className="text-gray-600 mb-6">
                Ever wondered how much of your salary actually lands in your pocket each month? Your annual paycheck might sound great, but taxes, National Insurance, and other deductions can shrink it faster than you'd expect. Knowing your take-home pay is the key to smarter budgeting, saving for that dream holiday, or just keeping your finances on track.
              </p>
              <p className="text-gray-600 mb-8">
                Our take-home pay calculator cuts through the confusion. It shows you exactly what's left after all the must-pay deductions—whether you're eyeing a new job, negotiating a raise, or planning your next big move.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">What Shapes Your Take-Home Pay?</h3>
              <p className="text-gray-600 mb-4">
                Your net income isn't just your salary minus a random chunk. Here's what's at play:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-6">
                <li><strong>Income Tax:</strong> Depends on how much you earn and where you live. England, Wales, and Northern Ireland share one system, while Scotland dances to its own tax tune.</li>
                <li><strong>National Insurance (NI):</strong> A slice of your salary that helps fund the NHS and your future pension. The more you earn, the more you chip in.</li>
                <li><strong>Student Loans:</strong> Got a degree? You might repay a bit each month, depending on your income and loan type.</li>
                <li><strong>Pension Contributions:</strong> Saving for retirement can trim your paycheck now (sometimes with tax perks!).</li>
                <li><strong>Extras:</strong> Things like private healthcare or company perks might tweak the final number too.</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">How to Get Your Number</h3>
              <p className="text-gray-600 mb-4">
                It's simple: pop in your salary, pick your location, and tweak options like pension or student loan repayments. Our calculator crunches the latest tax rules and deductions to reveal your true take-home pay—no guesswork needed.
              </p>
              <p className="text-gray-600">
                Understanding this breakdown empowers you. Want a bigger paycheck? You could tweak pension contributions or negotiate that raise with confidence. Ready to plan your finances like a pro?
              </p>
        </div>
      
      {/* Pension Projection CTA */}
      <div className="mt-8 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-xl p-6 text-center">
        <h2 className="text-xl font-semibold mb-3">Want to See Your Pension Projections?</h2>
        <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
          Use our pension calculator to see how your contributions could grow over time and plan for your retirement.
        </p>
        <Link 
          to="/pension-projection" 
          className="inline-flex items-center px-6 py-3 rounded-lg gradient-button text-white font-medium transition-all duration-300 hover:shadow-lg"
        >
          Calculate Pension Growth
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
      
      {/* The Numbers Section */}
      <div className="mt-8 space-y-4 text-gray-700">
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">The Numbers</h3>
        </div>

        <div 
          className="rounded-lg overflow-hidden cursor-pointer"
          onClick={() => toggleItem('tax-rates')}
        >
          <div className="flex items-center justify-between p-4 bg-slate-200">
            <h3 className="text-lg font-semibold">Tax Rates and Thresholds (2024/25)</h3>
            <ChevronDown 
              className={`w-5 h-5 transition-transform duration-200 ${
                openItems.includes('tax-rates') ? 'transform rotate-180' : ''
              }`}
            />
          </div>
          <div 
            className={`transition-all duration-200 ${
              openItems.includes('tax-rates') ? 'max-h-96' : 'max-h-0'
            } overflow-hidden`}
          >
            <div className="p-4 bg-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">England, Wales & NI</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Personal Allowance: £12,570</li>
                    <li>• Basic Rate: 20% (£12,571 to £50,270)</li>
                    <li>• Higher Rate: 40% (£50,271 to £125,140)</li>
                    <li>• Additional Rate: 45% (over £125,140)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Scotland</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Personal Allowance: £12,570</li>
                    <li>• Starter Rate: 19% (£12,571 to £14,876)</li>
                    <li>• Basic Rate: 20% (£14,877 to £26,561)</li>
                    <li>• Intermediate Rate: 21% (£26,562 to £43,662)</li>
                    <li>• Higher Rate: 42% (£43,663 to £75,000)</li>
                    <li>• Advanced Rate: 45% (£75,001 to £125,140)</li>
                    <li>• Top Rate: 48% (over £125,140)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* National Insurance */}
        <div 
          className="rounded-lg overflow-hidden cursor-pointer mt-4"
          onClick={() => toggleItem('ni')}
        >
          <div className="flex items-center justify-between p-4 bg-slate-200">
            <h3 className="text-lg font-semibold">National Insurance</h3>
            <ChevronDown 
              className={`w-5 h-5 transition-transform duration-200 ${
                openItems.includes('ni') ? 'transform rotate-180' : ''
              }`}
            />
          </div>
          <div 
            className={`transition-all duration-200 ${
              openItems.includes('ni') ? 'max-h-96' : 'max-h-0'
            } overflow-hidden`}
          >
            <div className="p-4 bg-slate-200">
              <ul className="list-disc pl-5 space-y-2">
                <li>8% on earnings between £12,570 and £50,270 per year</li>
                <li>2% on earnings above £50,270 per year</li>
                <li>No NI contributions on earnings below £12,570</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Student Loan Thresholds */}
        <div 
          className="rounded-lg overflow-hidden cursor-pointer mt-4"
          onClick={() => toggleItem('student-loans')}
        >
          <div className="flex items-center justify-between p-4 bg-slate-200">
            <h3 className="text-lg font-semibold">Student Loan Thresholds</h3>
            <ChevronDown 
              className={`w-5 h-5 transition-transform duration-200 ${
                openItems.includes('student-loans') ? 'transform rotate-180' : ''
              }`}
            />
          </div>
          <div 
            className={`transition-all duration-200 ${
              openItems.includes('student-loans') ? 'max-h-96' : 'max-h-0'
            } overflow-hidden`}
          >
            <div className="p-4 bg-slate-200">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Plan 1:</strong> 9% of income above £24,990</li>
                <li><strong>Plan 2:</strong> 9% of income above £27,295</li>
                <li><strong>Plan 4 (Scotland):</strong> 9% of income above £31,395</li>
                <li><strong>Plan 5:</strong> 9% of income above £25,000</li>
                <li><strong>Postgraduate Loan:</strong> 6% of income above £21,000</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Pension Contributions */}
        <div 
          className="rounded-lg overflow-hidden cursor-pointer mt-4"
          onClick={() => toggleItem('pension')}
        >
          <div className="flex items-center justify-between p-4 bg-slate-200">
            <h3 className="text-lg font-semibold">Pension Contributions</h3>
            <ChevronDown 
              className={`w-5 h-5 transition-transform duration-200 ${
                openItems.includes('pension') ? 'transform rotate-180' : ''
              }`}
            />
          </div>
          <div 
            className={`transition-all duration-200 ${
              openItems.includes('pension') ? 'max-h-96' : 'max-h-0'
            } overflow-hidden`}
          >
            <div className="p-4 bg-slate-200">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Auto Enrolment (Banded):</strong> Contributions based on qualifying earnings (£6,240 - £50,270)</li>
                <li><strong>Auto Enrolment (Unbanded):</strong> Contributions based on total earnings</li>
                <li><strong>Relief at Source:</strong> Contributions taken after tax with basic rate relief added automatically</li>
                <li><strong>Salary Sacrifice:</strong> Contributions taken before tax and NI calculations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg p-4 mt-4">
        <p className="text-sm">
          <strong>Note:</strong> This calculator provides estimates based on current rates and thresholds. Actual take-home pay may vary based on your specific circumstances and tax code.
        </p>
      </div>
      </div>
    </motion.div>  
  );
};

export default TakeHomePayInfo;