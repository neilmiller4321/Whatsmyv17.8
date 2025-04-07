
import React from 'react';

export function EducationalContent() {
  return (
    <div className="space-y-4 text-gray-600">
      <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-lg p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
        Purchasing power refers to the value of money in terms of the goods and services it can buy. As prices rise due to inflation, the purchasing power of your money decreases.
      </div>
            
      <h3 className="text-lg font-semibold mt-6 mb-2">About UK Inflation Measures</h3>
      <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-lg p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
        This calculator uses official inflation data from the Office for National Statistics (ONS):
        <ul className="list-disc pl-5 space-y-2 mt-2">
        <li><strong>CPI (Consumer Price Index):</strong> The UK's main measure of inflation since 1996. It tracks the changing cost of a basket of goods and services, including food, transportation, and recreation, but excludes housing costs like mortgage interest payments. Our data goes back to 1914.</li>
        <li><strong>RPI (Retail Price Index):</strong> An older measure that includes housing costs such as mortgage interest payments and council tax. RPI typically shows higher inflation rates than CPI. Data goes back to 1948.</li>
        </ul>
      </div>
      
      <h3 className="text-lg font-semibold mt-6 mb-2">Key Periods in UK Inflation History</h3>
      <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-lg p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>World War I (1914-1918):</strong> Significant inflation during wartime, with rates reaching over 25% in 1917.</li>
          <li><strong>Post-WWI Deflation (1921-1923):</strong> Sharp deflation with prices falling by up to 14% in 1922.</li>
          <li><strong>Great Depression (1929-1933):</strong> Period of deflation with falling prices.</li>
          <li><strong>World War II (1939-1945):</strong> Wartime inflation, particularly in the early years.</li>
          <li><strong>Post-War Period (1948-1960s):</strong> Relatively moderate inflation with occasional spikes.</li>
          <li><strong>1970s:</strong> Period of high inflation, peaking at 24.2% in 1975 during the oil crisis.</li>
          <li><strong>1980s:</strong> High inflation in the early 1980s (18% in 1980) gradually decreased throughout the decade.</li>
          <li><strong>1990s:</strong> Inflation moderated with the introduction of inflation targeting by the Bank of England.</li>
          <li><strong>2000s:</strong> Relatively stable inflation around the 2-3% target, with a spike during the 2008 financial crisis.</li>
          <li><strong>2010s:</strong> Generally low inflation, with a period of higher inflation following the Brexit referendum.</li>
          <li><strong>2020s:</strong> Significant inflation spike in 2021-2023 due to pandemic recovery and energy price increases, with CPI reaching 9.1% in 2022.</li>
        </ul>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-lg p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu mt-4">
        <p className="text-sm">
          <strong>Note:</strong> This calculator uses historical data and provides estimates based on average inflation rates. The actual purchasing power of money can vary based on specific goods and services, regional differences, and individual spending patterns.
        </p>
      </div>
      
      <h3 className="text-lg font-semibold mt-6 mb-2">How to Use This Information</h3>
      <div className="bg-gradient-to-br from-rose-50/80 to-red-50/80 rounded-lg p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
        Understanding how inflation affects your money can help with:
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Long-term financial planning:</strong> Ensuring your savings and investments outpace inflation.</li>
          <li><strong>Retirement planning:</strong> Calculating how much your pension will be worth in real terms.</li>
          <li><strong>Salary negotiations:</strong> Understanding if your pay rises are keeping pace with inflation.</li>
          <li><strong>Investment decisions:</strong> Evaluating the real returns on your investments after accounting for inflation.</li>
          <li><strong>Historical comparisons:</strong> Understanding the relative value of money across different time periods.</li>
        </ul>
      </div>
    </div>
  );
}
