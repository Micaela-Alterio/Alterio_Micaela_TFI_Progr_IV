import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  cargando?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  cargando = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold rounded-lg transition-all focus:outline-hidden focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none font-body';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  const variantClasses = {
    primary:
      'bg-[#72a95c] hover:bg-[#5f914b] text-white focus:ring-[#72a95c] shadow-xs active:scale-[0.98]',
    secondary:
      'bg-[#e8c14b] hover:bg-[#d6b03c] text-[#2F3A2F] focus:ring-[#e8c14b] shadow-xs active:scale-[0.98]',
    danger:
      'bg-[#c94b43] hover:bg-[#b03b34] text-white focus:ring-[#c94b43] shadow-xs active:scale-[0.98]',
    outline:
      'border-2 border-[#72a95c] text-[#72a95c] hover:bg-[#72a95c]/10 dark:text-[#8fc479] dark:border-[#72a95c]/60 focus:ring-[#72a95c]',
    ghost:
      'text-[#2F3A2F] dark:text-[#fcf7ef] hover:bg-[#eaf5de] dark:hover:bg-[#2c3d2c] focus:ring-[#72a95c]',
  };

  return (
    <button
      disabled={disabled || cargando}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {cargando ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span>Cargando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
