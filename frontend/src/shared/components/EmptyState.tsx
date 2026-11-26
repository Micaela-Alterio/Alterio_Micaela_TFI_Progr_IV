import React from 'react';

export interface EmptyStateProps {
  title?: string;
  titulo?: string;
  description?: string;
  descripcion?: string;
  icon?: React.ReactNode;
  icono?: React.ReactNode;
  accion?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  titulo,
  description,
  descripcion,
  icon,
  icono,
  accion,
}) => {
  const displayTitle = title || titulo || 'Sin resultados';
  const displayDescription = description || descripcion;
  const displayIcon = icon || icono || '🥑';

  return (
    <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] p-12 text-center shadow-xs max-w-md mx-auto my-8">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#72a95c] flex items-center justify-center text-2xl font-bold">
        {displayIcon}
      </div>
      <h3 className="font-title2 font-bold text-lg text-[#2F3A2F] dark:text-[#fcf7ef] mb-1">
        {displayTitle}
      </h3>
      {displayDescription && (
        <p className="text-[#2F3A2F]/70 dark:text-[#fcf7ef]/70 text-sm max-w-sm mx-auto font-body mb-5">
          {displayDescription}
        </p>
      )}
      {accion && <div>{accion}</div>}
    </div>
  );
};

export const EstadoVacio = EmptyState;
export default EmptyState;
