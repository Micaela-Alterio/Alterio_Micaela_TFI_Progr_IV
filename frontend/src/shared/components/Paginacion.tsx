import React from 'react';

export interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  onCambioPagina: (pagina: number) => void;
  className?: string;
}

export const Paginacion: React.FC<PaginacionProps> = ({
  paginaActual,
  totalPaginas,
  onCambioPagina,
  className = '',
}) => {
  if (totalPaginas <= 1) return null;

  return (
    <div
      className={`flex items-center justify-center gap-3 py-4 font-body text-xs text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80 ${className}`}
    >
      <button
        type="button"
        disabled={paginaActual <= 1}
        onClick={() => onCambioPagina(paginaActual - 1)}
        className="bg-[#e8c14b] hover:bg-[#d6b03c] disabled:opacity-40 disabled:cursor-not-allowed text-[#2F3A2F] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
      >
        &larr; Anterior
      </button>

      <span>
        Página{' '}
        <strong className="text-[#2F3A2F] dark:text-[#fcf7ef]">
          {paginaActual}
        </strong>{' '}
        de{' '}
        <strong className="text-[#2F3A2F] dark:text-[#fcf7ef]">
          {totalPaginas}
        </strong>
      </span>

      <button
        type="button"
        disabled={paginaActual >= totalPaginas}
        onClick={() => onCambioPagina(paginaActual + 1)}
        className="bg-[#72a95c] hover:bg-[#5f914b] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
      >
        Siguiente &rarr;
      </button>
    </div>
  );
};
