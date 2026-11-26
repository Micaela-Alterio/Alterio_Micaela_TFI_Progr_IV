import React from 'react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  mensaje?: string;
  onReintentar?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocurrió un error al cargar la información',
  message,
  mensaje,
  onReintentar,
}) => {
  const displayMessage = message || mensaje || 'Error desconocido al comunicar con el backend.';

  return (
    <div className="bg-[#c94b43]/10 border border-[#c94b43]/30 rounded-xl p-6 text-center font-body max-w-md mx-auto my-8">
      <p className="text-[#c94b43] font-bold mb-1 font-title2 text-base">
        {title}
      </p>
      <p className="text-[#c94b43]/90 text-xs font-mono mb-3">
        {displayMessage}
      </p>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="bg-[#c94b43] hover:bg-[#b03b34] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};

export const EstadoError = ErrorState;
export default ErrorState;
