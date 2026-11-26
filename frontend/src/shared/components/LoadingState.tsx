import React from 'react';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Cargando datos desde el backend...',
}) => {
  return (
    <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] p-12 text-center shadow-xs">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#72a95c] border-t-transparent mb-3" />
      <p className="text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80 font-medium text-sm font-body">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
