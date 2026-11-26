import React from 'react';

export type EstadoPedidoType =
  | 'PENDIENTE'
  | 'EN_PREPARACION'
  | 'ENTREGADO'
  | 'CANCELADO'
  | string;

interface BadgeEstadoProps {
  estado: EstadoPedidoType;
  className?: string;
}

export const BadgeEstado: React.FC<BadgeEstadoProps> = ({ estado, className = '' }) => {
  const estadoNormalizado = estado.toUpperCase().trim();

  let colorClasses =
    'bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#2F3A2F] dark:text-[#eaf5de]';
  let label = estado;

  switch (estadoNormalizado) {
    case 'PENDIENTE':
      colorClasses =
        'bg-[#e8c14b]/20 text-[#743502] dark:text-[#e8c14b] border border-[#e8c14b]/50';
      label = 'Pendiente';
      break;
    case 'EN_PREPARACION':
      colorClasses =
        'bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#72a95c] dark:text-[#8fc479] border border-[#72a95c]/30';
      label = 'En Preparación';
      break;
    case 'ENTREGADO':
      colorClasses = 'bg-[#72a95c] text-white';
      label = 'Entregado';
      break;
    case 'CANCELADO':
      colorClasses =
        'bg-[#c94b43]/15 text-[#c94b43] border border-[#c94b43]/30';
      label = 'Cancelado';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider font-body ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
};
