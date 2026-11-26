import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] font-body"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full border-2 rounded-[5px] p-2 text-sm focus:outline-hidden font-body bg-[#fcf7ef] dark:bg-[#1a231a] text-[#2F3A2F] dark:text-[#fcf7ef] placeholder:text-[#2F3A2F]/50 dark:placeholder:text-[#fcf7ef]/50 transition-colors ${
            error
              ? 'border-[#c94b43] focus:border-[#c94b43]'
              : 'border-[#e8c14b] focus:border-[#72a95c]'
          } ${className}`}
          {...props}
        />
        {error ? (
          <span className="text-xs text-[#c94b43] font-body font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 font-body">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
