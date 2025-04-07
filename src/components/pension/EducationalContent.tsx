
import React from 'react';

export function EducationalContent() {
  return (
    <div className="space-y-4 text-gray-600">
      <h3 className="text-lg font-semibold">Key Elements of Your Projection</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Current Position</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Current pension value - Your existing pension savings</li>
            <li>Monthly contributions - What you and your employer pay in</li>
            <li>Current age and planned retirement age</li>
            <li>Salary and expected growth rate</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Future Projections</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Estimated future value at retirement</li>
            <li>Value in today's money (adjusted for inflation)</li>
            <li>Investment returns and growth</li>
            <li>Tax-free lump sum options</li>
          </ul>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mt-8">Investment Strategy Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Stocks</h4>
          <p className="text-sm">Higher potential returns but more volatile. Typically suitable for longer investment periods.</p>
        </div>
        <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Bonds</h4>
          <p className="text-sm">More stable returns with lower growth potential. Can help reduce portfolio volatility.</p>
        </div>
        <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Cash</h4>
          <p className="text-sm">Very stable but lowest expected returns. Provides liquidity and capital preservation.</p>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mt-8">Key Assumptions & Considerations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Calculation Assumptions</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Returns are assumed to be constant over time</li>
            <li>Contributions increase with salary growth</li>
            <li>Asset allocation is rebalanced annually</li>
            <li>All returns are before platform/fund fees</li>
            <li>Tax relief and allowances not included</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Important Factors</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Market performance will fluctuate</li>
            <li>Impact of fees on long-term growth</li>
            <li>Life changes may affect plans</li>
            <li>State Pension entitlement</li>
            <li>Tax implications and allowances</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg p-4 mt-4">
        <p className="text-sm space-y-2">
          <strong>Important:</strong> This calculator provides estimates based on your inputs and assumptions. Actual pension values will vary based on market performance, fees, and other factors.
          <br /><br />
          We recommend reviewing your pension projection at least annually and seeking professional financial advice for personalised recommendations based on your circumstances.
        </p>
      </div>
    </div>
  );
}
