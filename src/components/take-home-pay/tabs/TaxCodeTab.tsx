
import React from 'react';
import { FormData } from '../../../hooks/useTakeHomePay';

interface TaxCodeTabProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const TaxCodeTab: React.FC<TaxCodeTabProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="text-center py-8">
      <div className="max-w-xs mx-auto">
        <label htmlFor="taxCode" className="block text-sm font-medium text-gray-700 mb-2">
          Tax Code
        </label>
        <div className="relative">
          <input
            type="text"
            id="taxCode"
            name="taxCode"
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start uppercase"
            placeholder="1257L"
            maxLength={6}
            onChange={handleInputChange}
            value={formData.taxCode ||''}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-sunset-text"
            onClick={() => {
              handleInputChange({
                target: { name: 'taxCode', value: '', type: 'text' }
              } as React.ChangeEvent<HTMLInputElement>);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Leave blank to use standard tax code 1257L
        </p>
      </div>
    </div>
  );
};

export default TaxCodeTab;