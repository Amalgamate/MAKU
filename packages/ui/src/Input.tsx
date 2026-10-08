import { forwardRef } from 'react';

interface InputOwnProps {
  label?: string;
  error?: string;
  hint?: string;
}

type InputProps = InputOwnProps & React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && (
              <span className="ml-1 text-red-500" aria-hidden="true">*</span>
            )}
          </label>
        )}
        <input
          {...props}
          ref={ref}
          id={inputId}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={[
            'rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400',
            className,
          ]
            .join(' ')
            .trim()}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600">{error}</p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
