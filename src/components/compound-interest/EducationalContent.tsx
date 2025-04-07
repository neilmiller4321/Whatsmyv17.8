import React from 'react';

export function EducationalContent() {
  return (
    <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Understanding Compound Interest</h2>
      <div className="space-y-8">
        {/* Introduction Section */}
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-lg md:rounded-xl p-4 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
          <p className="text-gray-600">
            Compound interest is often called the "eighth wonder of the world" because of its powerful ability to grow wealth over time.
          </p>
        </div>
        
        {/* How It Works Section */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-lg md:rounded-xl p-4 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
          <h3 className="text-xl font-semibold mb-4">How Compound Interest Works</h3>
          <p className="text-gray-600 mb-6">
            Compound interest is the process where the interest you earn on an investment is added to the principal, so that the interest itself earns interest. This creates a snowball effect that accelerates your wealth growth over time.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-2">The Power of Time</h4>
              <p className="text-sm">
                The longer your money is invested, the more powerful compound interest becomes. Starting early, even with smaller amounts, can lead to significantly larger returns.
              </p>
            </div>
            
            <div className="bg-white/80 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-2">Regular Contributions</h4>
              <p className="text-sm">
                Adding regular contributions to your investment accelerates growth. Even small monthly deposits can make a substantial difference over time.
              </p>
            </div>
            
            <div className="bg-white/80 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-2">Compounding Frequency</h4>
              <p className="text-sm">
                Monthly compounding is most common for savings accounts and investments. Some accounts offer daily compounding for slightly better returns, while annual compounding is typical for bonds and some fixed-rate products.
              </p>
            </div>
          </div>
        </div>
        
        {/* Rule of 72 Section */}
        <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-lg md:rounded-xl p-4 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
          <h3 className="text-xl font-semibold mb-4">The Rule of 72</h3>
          <p className="text-gray-600">
            A quick way to estimate how long it will take for your money to double is to divide 72 by your annual interest rate. For example, at 7% interest, your money will double in approximately 72 ÷ 7 = 10.3 years.
          </p>
        </div>
        
        {/* Important Note Section */}
        <div className="bg-gradient-to-br from-rose-50/80 to-red-50/80 rounded-lg md:rounded-xl p-4 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
          <p className="text-sm">
            <strong>Important:</strong> This calculator provides estimates based on constant interest rates and regular contributions. Actual investment returns may vary due to market fluctuations, fees, taxes, and other factors.
          </p>
        </div>
      </div>
    </div>
  );
}