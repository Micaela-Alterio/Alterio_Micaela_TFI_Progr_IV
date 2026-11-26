import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { pedidosApi } from '../api/pedidosApi';
import type { Pedido } from '../types/pedido.types';
import { PedidoDetalleModal } from '../components/PedidoDetalleModal';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import LoadingState from '@/shared/components/LoadingState';
import ErrorState from '@/shared/components/ErrorState';
import EmptyState from '@/shared/components/EmptyState';

const ESTADOS_FILTRO = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'PENDIENTE', etiqueta: 'Pendientes' },
  { valor: 'EN_PREPARACION', etiqueta: 'En Preparación' },
  { valor: 'ENTREGADO', etiqueta: 'Entregados' },
  { valor: 'CANCELADO', etiqueta: 'Cancelados' },
];

export const AdminPedidosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotificationStore();
  const [sorting, setSorting] = useState<SortingState>([]);

  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-pedidos', filtroEstado],
    queryFn: () =>
      pedidosApi.listar({
        limit: 100,
        estado: filtroEstado === 'TODOS' ? undefined : filtroEstado,
      }),
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) =>
      pedidosApi.actualizarEstado(id, estado),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      showSuccess(`Pedido #${p.id} actualizado a estado "${p.estado}"`);
    },
    onError: (err) => {
      showError(handleApiError(err, 'Error al cambiar estado del pedido'));
    },
  });

  const pedidos = data?.items || [];

  const columns = useMemo<ColumnDef<Pedido>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => (
          <span className="bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#2F3A2F] dark:text-[#eaf5de] font-bold text-xs px-2.5 py-1 rounded-full">
            #{info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: (info) => (
          <span className="text-xs text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80 font-body">
            {new Date(info.getValue<string>()).toLocaleString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'direccion_entrega',
        header: 'Destino',
        cell: (info) => (
          <span className="text-xs font-body text-[#2F3A2F] dark:text-[#fcf7ef] line-clamp-1 max-w-[180px]">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'forma_pago',
        header: 'Pago',
        cell: (info) => (
          <span className="text-xs font-bold font-body text-[#743502] dark:text-[#e8c14b]">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: (info) => (
          <span className="font-title2 font-bold text-[#2F3A2F] dark:text-[#fcf7ef] text-sm">
            ${info.getValue<number>().toLocaleString('es-AR')}
          </span>
        ),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: (info) => <BadgeEstado estado={info.getValue<string>()} />,
      },
      {
        id: 'acciones',
        header: () => <div className="text-right">Acciones</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original;
          const isMutating = cambiarEstadoMutation.isPending;

          return (
            <div className="flex items-center justify-end gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setPedidoDetalle(p)}
                className="bg-[#e8c14b] hover:bg-[#d6b03c] text-[#2F3A2F] font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-body"
              >
                Detalle
              </button>

              {p.estado === 'PENDIENTE' && (
                <>
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() =>
                      cambiarEstadoMutation.mutate({
                        id: p.id,
                        estado: 'EN_PREPARACION',
                      })
                    }
                    className="bg-[#72a95c] hover:bg-[#5f914b] disabled:opacity-50 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-body"
                  >
                    A Cocina
                  </button>
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Confirmas la cancelación del pedido #${p.id}? Se restituirá el stock.`
                        )
                      ) {
                        cambiarEstadoMutation.mutate({
                          id: p.id,
                          estado: 'CANCELADO',
                        });
                      }
                    }}
                    className="bg-[#c94b43] hover:bg-[#b03b34] disabled:opacity-50 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-body"
                  >
                    Cancelar
                  </button>
                </>
              )}

              {p.estado === 'EN_PREPARACION' && (
                <>
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() =>
                      cambiarEstadoMutation.mutate({
                        id: p.id,
                        estado: 'ENTREGADO',
                      })
                    }
                    className="bg-[#72a95c] hover:bg-[#5f914b] disabled:opacity-50 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-body"
                  >
                    Entregar
                  </button>
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Confirmas la cancelación del pedido #${p.id}? Se restituirá el stock.`
                        )
                      ) {
                        cambiarEstadoMutation.mutate({
                          id: p.id,
                          estado: 'CANCELADO',
                        });
                      }
                    }}
                    className="bg-[#c94b43] hover:bg-[#b03b34] disabled:opacity-50 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-body"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [cambiarEstadoMutation]
  );

  const table = useReactTable({
    data: pedidos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 8 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaf5de] dark:border-[#334233]">
        <div>
          <h1 className="font-title1 text-3xl font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
            Gestión de Pedidos
          </h1>
          <p className="font-body text-[15px] font-normal text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
            Control y actualización de estados en tiempo real de todos los pedidos.
          </p>
        </div>
      </div>

      {/* Píldoras de Filtro de Estado */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {ESTADOS_FILTRO.map((ef) => (
          <button
            key={ef.valor}
            type="button"
            onClick={() => setFiltroEstado(ef.valor)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold font-body transition-colors cursor-pointer shrink-0 ${
              filtroEstado === ef.valor
                ? 'bg-[#72a95c] text-white shadow-xs'
                : 'bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#2F3A2F] dark:text-[#fcf7ef] hover:bg-[#d8ebc5] dark:hover:bg-[#344634]'
            }`}
          >
            {ef.etiqueta}
          </button>
        ))}
      </div>

      {isLoading && <LoadingState message="Cargando pedidos..." />}

      {isError && (
        <ErrorState
          title="Error al cargar los pedidos"
          message={error instanceof Error ? error.message : 'Error desconocido'}
        />
      )}

      {!isLoading && !isError && pedidos.length === 0 && (
        <EmptyState
          title="No hay pedidos registrados"
          description="No se encontraron pedidos con el filtro de estado seleccionado."
          icon="📦"
        />
      )}

      {!isLoading && !isError && pedidos.length > 0 && (
        <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-[#eaf5de] dark:bg-[#2c3d2c]">
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const isSorted = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className={`p-3.5 border-b border-[#72a95c]/20 font-title2 text-sm text-[#2F3A2F] dark:text-[#fcf7ef] ${
                            canSort
                              ? 'cursor-pointer hover:bg-[#d8ebc5] dark:hover:bg-[#344634] select-none transition-colors'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {canSort && (
                              <span className="text-xs text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60">
                                {isSorted === 'asc' ? ' ▲' : isSorted === 'desc' ? ' ▼' : ' ⇅'}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#eaf5de] dark:border-[#334233] hover:bg-[#fbf9f4] dark:hover:bg-[#2a362a] transition-colors font-body text-sm text-[#2F3A2F] dark:text-[#fcf7ef]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#fcf7ef] dark:bg-[#232c23] border-t border-[#eaf5de] dark:border-[#334233] font-body text-xs text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
            <div>
              <span>
                Página{' '}
                <strong>
                  {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
                </strong>
              </span>
              <span className="ml-3 text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60">
                ({pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'} en total)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="bg-[#e8c14b] hover:bg-[#d6b03c] disabled:opacity-40 disabled:cursor-not-allowed text-[#2F3A2F] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="bg-[#72a95c] hover:bg-[#5f914b] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      <PedidoDetalleModal
        isOpen={!!pedidoDetalle}
        onClose={() => setPedidoDetalle(null)}
        pedido={pedidoDetalle}
      />
    </div>
  );
};

export default AdminPedidosPage;
