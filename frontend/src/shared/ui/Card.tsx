import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] shadow-xs text-[#2F3A2F] dark:text-[#fcf7ef] ${
        hoverEffect ? 'hover:shadow-md transition-shadow duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
