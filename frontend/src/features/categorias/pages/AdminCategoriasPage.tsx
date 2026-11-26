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
import { categoriasApi } from '../api/categoriasApi';
import type { Categoria, CategoriaCreate } from '../types/categoria.types';
import { CategoriaModal } from '../components/CategoriaModal';
import LoadingState from '@/shared/components/LoadingState';
import ErrorState from '@/shared/components/ErrorState';
import EmptyState from '@/shared/components/EmptyState';

export const AdminCategoriasPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotificationStore();
  const [sorting, setSorting] = useState<SortingState>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<Categoria | null>(null);

  const {
    data: categorias = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.listarActivas,
  });

  const createMutation = useMutation({
    mutationFn: categoriasApi.crear,
    onSuccess: (nueva) => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      showSuccess(`Categoría "${nueva.nombre}" creada exitosamente`);
    },
    onError: (err) => {
      showError(handleApiError(err, 'Error al crear categoría'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaCreate }) =>
      categoriasApi.actualizar(id, data),
    onSuccess: (actualizada) => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      showSuccess(`Categoría "${actualizada.nombre}" actualizada`);
    },
    onError: (err) => {
      showError(handleApiError(err, 'Error al actualizar categoría'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriasApi.eliminar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      showSuccess('Categoría dada de baja correctamente');
    },
    onError: (err) => {
      showError(handleApiError(err, 'Error al eliminar categoría'));
    },
  });

  const handleOpenCrear = () => {
    setCategoriaEditar(null);
    setModalOpen(true);
  };

  const handleOpenEditar = React.useCallback((cat: Categoria) => {
    setCategoriaEditar(cat);
    setModalOpen(true);
  }, []);

  const handleEliminar = React.useCallback(
    (cat: Categoria) => {
      if (
        window.confirm(
          `¿Confirmas la baja lógica de la categoría "${cat.nombre}"?`
        )
      ) {
        deleteMutation.mutate(cat.id);
      }
    },
    [deleteMutation]
  );

  const handleFormSubmit = async (formData: CategoriaCreate) => {
    if (categoriaEditar) {
      await updateMutation.mutateAsync({
        id: categoriaEditar.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const columns = useMemo<ColumnDef<Categoria>[]>(
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
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: (info) => (
          <span className="font-title1 text-[20px] text-[#2F3A2F] dark:text-[#fcf7ef] leading-tight block">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: (info) => (
          <span className="text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80 text-sm font-body leading-relaxed max-w-md block">
            {info.getValue<string>() || (
              <em className="text-[#2F3A2F]/40 dark:text-[#fcf7ef]/40">Sin descripción</em>
            )}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: () => <div className="text-right">Acciones</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => handleOpenEditar(row.original)}
              className="bg-[#72a95c] hover:bg-[#5f914b] text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => handleEliminar(row.original)}
              className="bg-[#c94b43] hover:bg-[#b03b34] text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Eliminar
            </button>
          </div>
        ),
      },
    ],
    [handleOpenEditar, handleEliminar]
  );

  const table = useReactTable({
    data: categorias,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 6 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#eaf5de] dark:border-[#334233]">
        <p className="font-body text-[15px] font-normal text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
          Gestión de categorías de Veggie Food Store.
        </p>
        <button
          type="button"
          onClick={handleOpenCrear}
          className="bg-[#743502] hover:bg-[#c94b43] text-[#fcf7ef] font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0 font-body text-sm"
        >
          + Nueva categoría
        </button>
      </div>

      {isLoading && <LoadingState message="Cargando categorías desde el backend..." />}

      {isError && (
        <ErrorState
          title="Error al cargar las categorías"
          message={error instanceof Error ? error.message : 'Error desconocido'}
        />
      )}

      {!isLoading && !isError && categorias.length === 0 && (
        <EmptyState
          title="No hay categorías registradas"
          description="Comienza creando la primera categoría de comida vegetariana."
          icon="🥑"
        />
      )}

      {!isLoading && !isError && categorias.length > 0 && (
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
                ({categorias.length} {categorias.length === 1 ? 'categoría' : 'categorías'} en total)
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

      <CategoriaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        categoriaToEdit={categoriaEditar}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default AdminCategoriasPage;
