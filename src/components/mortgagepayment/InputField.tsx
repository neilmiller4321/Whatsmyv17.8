
import React, { useRef } from 'react';

interface InputFieldProps {
  id: string;
  name: string;
  value: string;
  label: string;
  type?: 'text' | 'number';
  inputMode?: 'numeric' | 'decimal' | 'text';
  prefix?: string;
  suffix?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  ref?: React.RefObject<HTMLInputElement>;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  name,
  value,
  label,
  type = 'text',
  inputMode = 'text',
  prefix,
  suffix,
  onChange,
  onFocus,
  onBlur,
  className = '',
  disabled = false,
  placeholder,
  ref
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">{prefix}</span>
        )}
        <input
          ref={ref || inputRef}
          type={type}
          inputMode={inputMode}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-12' : 'pr-3'} py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start ${className}`}
        />
        {suffix && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">{suffix}</span>
        )}
      </div>
    </div>
  );
};
