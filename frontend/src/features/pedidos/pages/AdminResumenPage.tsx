import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { pedidosApi } from '../api/pedidosApi';
import LoadingState from '@/shared/components/LoadingState';
import ErrorState from '@/shared/components/ErrorState';
import { handleApiError } from '@/shared/api/handleApiError';

export const AdminResumenPage: React.FC = () => {
  const {
    data: resumen,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pedidos-resumen'],
    queryFn: pedidosApi.obtenerResumen,
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#eaf5de] dark:border-[#334233]">
        <h1 className="font-title1 text-3xl font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
          Resumen General del Negocio
        </h1>
        <p className="font-body text-[15px] font-normal text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
          Métricas clave de pedidos, recaudación y actividad en Veggie Food Store.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Calculando métricas del negocio..." />
      ) : isError ? (
        <ErrorState
          title="Error al cargar métricas de pedidos"
          message={handleApiError(error, 'Error desconocido')}
          onReintentar={() => refetch()}
        />
      ) : resumen ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Ingresos Entregados */}
          <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] border-l-4 border-l-[#72a95c] p-6 space-y-2 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] font-body">
              Ingresos Facturados (Entregados)
            </span>
            <p className="text-3xl font-bold font-title2 text-[#72a95c]">
              ${resumen.ingresos_entregados.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 font-body">
              Suma de pedidos completados con éxito
            </p>
          </div>

          {/* Pedidos Hoy */}
          <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] border-l-4 border-l-[#e8c14b] p-6 space-y-2 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] font-body">
              Pedidos de Hoy
            </span>
            <p className="text-3xl font-bold font-title2 text-[#2F3A2F] dark:text-[#fcf7ef]">
              {resumen.pedidos_hoy}
            </p>
            <p className="text-xs text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 font-body">
              Ingresados en la fecha actual
            </p>
          </div>

          {/* Pendientes */}
          <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] border-l-4 border-l-[#e8c14b] p-6 space-y-2 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] font-body">
              Pedidos Pendientes
            </span>
            <p className="text-3xl font-bold font-title2 text-[#743502] dark:text-[#e8c14b]">
              {resumen.pendientes}
            </p>
            <p className="text-xs text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 font-body">
              Esperando confirmación para cocina
            </p>
          </div>

          {/* En Preparación */}
          <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] border-l-4 border-l-[#72a95c] p-6 space-y-2 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] font-body">
              En Preparación
            </span>
            <p className="text-3xl font-bold font-title2 text-[#72a95c]">
              {resumen.en_preparacion}
            </p>
            <p className="text-xs text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 font-body">
              Actualmente en cocina o empaque
            </p>
          </div>

          {/* Entregados */}
          <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] border-l-4 border-l-[#72a95c] p-6 space-y-2 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] font-body">
              Pedidos Entregados
            </span>
            <p className="text-3xl font-bold font-title2 text-[#72a95c]">
              {resumen.entregados}
            </p>
            <p className="text-xs text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 font-body">
              Entregados a clientes
            </p>
          </div>

          {/* Cancelados */}
          <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] border-l-4 border-l-[#c94b43] p-6 space-y-2 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] font-body">
              Pedidos Cancelados
            </span>
            <p className="text-3xl font-bold font-title2 text-[#c94b43]">
              {resumen.cancelados}
            </p>
            <p className="text-xs text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 font-body">
              Cancelados por cliente o admin
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminResumenPage;
