import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3A2F]/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#fcf7ef] dark:bg-[#232c23] rounded-2xl border border-[#e8c14b]/40 shadow-xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-150`}
      >
        {title && (
          <div className="px-6 pt-6 pb-4 border-b border-[#eaf5de] dark:border-[#334233] flex items-center justify-between">
            <h2 className="font-title2 font-bold text-xl text-[#2F3A2F] dark:text-[#fcf7ef]">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 hover:text-[#2F3A2F] dark:hover:text-[#fcf7ef] transition-colors text-xl font-bold leading-none p-1 cursor-pointer"
              aria-label="Cerrar modal"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
