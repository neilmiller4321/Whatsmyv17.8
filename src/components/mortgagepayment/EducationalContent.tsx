
import React from 'react';

export const EducationalContent: React.FC = () => {
  return (
    <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
      <h2 className="text-xl font-semibold mb-4">Understanding Your Mortgage Payment</h2>
      <div className="space-y-4 text-gray-600">
        <p>
          Your monthly mortgage payment consists of two main components:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Principal:</strong> The amount that goes toward paying off your loan balance.</li>
          <li><strong>Interest:</strong> The cost of borrowing money, calculated as a percentage of your loan balance.</li>
        </ul>
        
        <h3 className="text-lg font-semibold mt-6 mb-2">Benefits of Overpayments</h3>
        <p>
          Making regular overpayments on your mortgage can have significant benefits:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Reduce your term:</strong> Pay off your mortgage earlier and become debt-free sooner.</li>
          <li><strong>Save on interest:</strong> Reduce the total interest paid over the life of your mortgage.</li>
          <li><strong>Build equity faster:</strong> Increase your ownership stake in your property more quickly.</li>
          <li><strong>Flexibility:</strong> Most UK mortgages allow overpayments of up to 10% of the outstanding balance each year without penalties.</li>
        </ul>
        
        <h3 className="text-lg font-semibold mt-6 mb-2">Property Taxes in the UK</h3>
        <p>
          When buying a property in the UK, you'll need to pay a property transaction tax:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Stamp Duty Land Tax (SDLT):</strong> Applies to properties in England and Northern Ireland.</li>
          <li><strong>Land and Buildings Transaction Tax (LBTT):</strong> Applies to properties in Scotland.</li>
          <li><strong>Land Transaction Tax (LTT):</strong> Applies to properties in Wales (not included in this calculator).</li>
        </ul>
        
        <p className="mt-2">
          These taxes are calculated using a progressive system, where different rates apply to different portions of the property price. Special rates apply for:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>First-time buyers:</strong> May qualify for reduced rates or higher thresholds.</li>
          <li><strong>Additional properties:</strong> Higher rates apply when purchasing second homes or buy-to-let properties.</li>
        </ul>
        
        <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg p-4 mt-4">
          <p className="text-sm">
            <strong>Important:</strong> Always check with your lender about any restrictions or early repayment charges that may apply to overpayments.
          </p>
        </div>
        
        <p className="mt-4">
          This calculator provides an estimate of your monthly payment based on the information you provide. Actual payments may vary based on your specific loan terms and lender requirements.
        </p>
        <p>
          In the UK, you may also need to consider:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Arrangement fees:</strong> One-time fees charged by lenders to set up your mortgage.</li>
          <li><strong>Valuation fees:</strong> Costs for the lender to assess the property's value.</li>
          <li><strong>Solicitor fees:</strong> Legal costs for handling the property purchase.</li>
          <li><strong>Stamp Duty Land Tax:</strong> A tax paid when buying property over a certain value.</li>
        </ul>
      </div>
    </div>
  );
};
