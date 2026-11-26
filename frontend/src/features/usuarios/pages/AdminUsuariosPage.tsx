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
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { usuariosApi } from '../api/usuariosApi';
import type { Usuario } from '../types/usuario.types';
import LoadingState from '@/shared/components/LoadingState';
import ErrorState from '@/shared/components/ErrorState';
import EmptyState from '@/shared/components/EmptyState';

export const AdminUsuariosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const currentAdmin = useAuthStore((s) => s.usuario);
  const { showSuccess, showError } = useNotificationStore();
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    data: usuarios = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: usuariosApi.listar,
  });

  const activarMutation = useMutation({
    mutationFn: usuariosApi.activar,
    onSuccess: (u) => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      showSuccess(`Usuario "${u.username}" activado correctamente`);
    },
    onError: (err) => {
      showError(handleApiError(err, 'Error al activar usuario'));
    },
  });

  const desactivarMutation = useMutation({
    mutationFn: usuariosApi.desactivar,
    onSuccess: (u) => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      showSuccess(`Usuario "${u.username}" desactivado`);
    },
    onError: (err) => {
      showError(handleApiError(err, 'Error al desactivar usuario'));
    },
  });

  const columns = useMemo<ColumnDef<Usuario>[]>(
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
        id: 'usuario_nombre',
        header: 'Usuario y Nombre',
        accessorFn: (row) => `${row.full_name} ${row.username}`,
        cell: ({ row }) => {
          const u = row.original;
          const isSelf = u.id === currentAdmin?.id;
          return (
            <div>
              <div className="flex items-center gap-2">
                <span className="font-title1 text-[20px] text-[#2F3A2F] dark:text-[#fcf7ef] leading-tight block">
                  {u.full_name || u.username}
                </span>
                {isSelf && (
                  <span className="bg-[#e8c14b]/30 text-[#743502] dark:text-[#f5d97f] text-[10px] font-bold px-1.5 py-0.5 rounded font-body">
                    Tú
                  </span>
                )}
              </div>
              <span className="text-xs text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 font-body">
                @{u.username}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => (
          <span className="text-[#2F3A2F]/90 dark:text-[#fcf7ef]/90 text-sm font-body">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: (info) => (
          <span className="bg-[#72a95c] text-white font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider font-body">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        id: 'estado',
        header: 'Estado',
        accessorFn: (row) => (row.disabled ? 'Desactivado' : 'Activo'),
        cell: ({ row }) => {
          const isDesactivado = Boolean(row.original.disabled);
          return isDesactivado ? (
            <span className="bg-[#c94b43]/15 text-[#c94b43] font-bold text-xs px-3 py-1 rounded-full font-body inline-block">
              Desactivado
            </span>
          ) : (
            <span className="bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#2F3A2F] dark:text-[#eaf5de] font-bold text-xs px-3 py-1 rounded-full font-body inline-block">
              Activo
            </span>
          );
        },
      },
      {
        id: 'acciones',
        header: () => <div className="text-right">Acciones</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original;
          const isSelf = u.id === currentAdmin?.id;
          const isMutating =
            activarMutation.isPending || desactivarMutation.isPending;

          if (isSelf) {
            return (
              <div className="text-right">
                <span className="text-xs text-[#2F3A2F]/40 dark:text-[#fcf7ef]/40 font-body italic">
                  Sesión actual
                </span>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-end gap-2">
              {u.disabled ? (
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => activarMutation.mutate(u.id)}
                  className="bg-[#72a95c] hover:bg-[#5f914b] disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Activar
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => {
                    if (
                      window.confirm(
                        `¿Confirmas desactivar al usuario "${u.username}"?`
                      )
                    ) {
                      desactivarMutation.mutate(u.id);
                    }
                  }}
                  className="bg-[#c94b43] hover:bg-[#b03b34] disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Desactivar
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [currentAdmin?.id, activarMutation, desactivarMutation]
  );

  const table = useReactTable({
    data: usuarios,
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
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#eaf5de] dark:border-[#334233]">
        <p className="font-body text-[15px] font-normal text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
          Gestión de usuarios y accesos de Veggie Food Store.
        </p>
      </div>

      {isLoading && <LoadingState message="Cargando usuarios desde el backend..." />}

      {isError && (
        <ErrorState
          title="Error al cargar los usuarios"
          message={error instanceof Error ? error.message : 'Error desconocido'}
        />
      )}

      {!isLoading && !isError && usuarios.length === 0 && (
        <EmptyState
          title="No hay usuarios registrados"
          description="Aún no se registran usuarios en el sistema."
          icon="👥"
        />
      )}

      {!isLoading && !isError && usuarios.length > 0 && (
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
                ({usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'} en total)
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
    </div>
  );
};

export default AdminUsuariosPage;
