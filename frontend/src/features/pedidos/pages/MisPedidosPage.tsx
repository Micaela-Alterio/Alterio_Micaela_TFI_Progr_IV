import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { pedidosApi } from '../api/pedidosApi';
import type { Pedido } from '../types/pedido.types';
import { PedidoDetalleModal } from '../components/PedidoDetalleModal';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import LoadingState from '@/shared/components/LoadingState';
import ErrorState from '@/shared/components/ErrorState';
import EmptyState from '@/shared/components/EmptyState';
import { Link } from 'react-router-dom';

export const MisPedidosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotificationStore();

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['mis-pedidos'],
    queryFn: () => pedidosApi.listar({ limit: 50 }),
  });

  const cancelarMutation = useMutation({
    mutationFn: pedidosApi.cancelar,
    onSuccess: (pedidoActualizado) => {
      queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      showSuccess(`Pedido #${pedidoActualizado.id} cancelado exitosamente`);
    },
    onError: (err) => {
      showError(handleApiError(err, 'No se pudo cancelar el pedido'));
    },
  });

  const pedidos = data?.items || [];

  const handleCancelar = (pedido: Pedido) => {
    if (
      window.confirm(
        `¿Seguro que deseas cancelar el pedido #${pedido.id}? Se restituirá el stock reservado.`
      )
    ) {
      cancelarMutation.mutate(pedido.id);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-[#eaf5de] dark:border-[#334233]">
        <h1 className="font-title1 text-3xl font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
          Mis Pedidos
        </h1>
        <p className="font-body text-[15px] font-normal text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
          Consulta el historial y seguimiento en tiempo real de tus compras.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando historial de pedidos..." />
      ) : isError ? (
        <ErrorState
          title="Error al cargar tus pedidos"
          message={handleApiError(error, 'Error desconocido')}
        />
      ) : pedidos.length === 0 ? (
        <EmptyState
          titulo="Aún no has realizado pedidos"
          descripcion="Cuando hagas tu primer pedido saludable, podrás seguirlo aquí."
          icono="🛍️"
          accion={
            <Link
              to="/"
              className="inline-block bg-[#72a95c] hover:bg-[#5f914b] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors font-body shadow-xs"
            >
              Ver Catálogo
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {pedidos.map((p) => {
            const puedeCancelar = p.estado === 'PENDIENTE';

            return (
              <div
                key={p.id}
                className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-title1 text-[22px] font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
                      Pedido #{p.id}
                    </span>
                    <BadgeEstado estado={p.estado} />
                  </div>
                  <p className="text-xs text-[#2F3A2F]/70 dark:text-[#fcf7ef]/70 font-body">
                    {new Date(p.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    • Pago: <span className="font-semibold">{p.forma_pago}</span>
                  </p>
                  <p className="text-xs text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80 font-body">
                    Entrega en: <span className="font-medium">{p.direccion_entrega}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#eaf5de] dark:border-[#334233]">
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] font-bold block font-body">
                      Total
                    </span>
                    <span className="text-xl font-bold font-title2 text-[#2F3A2F] dark:text-[#fcf7ef]">
                      ${p.total.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPedidoSeleccionado(p)}
                      className="bg-[#e8c14b] hover:bg-[#d6b03c] text-[#2F3A2F] font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer font-body"
                    >
                      Ver detalle
                    </button>
                    {puedeCancelar && (
                      <button
                        type="button"
                        disabled={cancelarMutation.isPending}
                        onClick={() => handleCancelar(p)}
                        className="bg-[#c94b43] hover:bg-[#b03b34] disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer font-body"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detalle de Pedido */}
      <PedidoDetalleModal
        isOpen={!!pedidoSeleccionado}
        onClose={() => setPedidoSeleccionado(null)}
        pedido={pedidoSeleccionado}
      />
    </div>
  );
};

export default MisPedidosPage;
