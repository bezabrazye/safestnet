import React from 'react';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  className?: string;
  inputMode?: string;
  autoComplete?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  className = '',
  inputMode,
  autoComplete
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-[color:var(--text-sub)]">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        inputMode={inputMode as React.InputHTMLAttributes<HTMLInputElement>['inputMode']}
        autoComplete={autoComplete}
        className={`w-full px-4 py-3 rounded-lg bg-[rgba(10,30,18,.6)] border ${
          error 
            ? 'border-[rgba(239,68,68,.35)]' 
            : 'border-[rgba(4,210,128,.18)]'
        } text-[color:var(--text)] placeholder-[color:var(--muted)] focus:outline-none focus:border-[rgba(4,210,128,.35)]`}
      />
      {error && (
        <p className="text-sm text-[rgba(239,68,68,.8)]">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
