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
import { productosApi } from '../api/productosApi';
import { categoriasApi } from '@/features/categorias/api/categoriasApi';
import type {
  Producto,
  ProductoCreate,
  ProductoStockUpdate,
} from '../types/producto.types';
import { ProductoModal } from '../components/ProductoModal';
import { StockModal } from '../components/StockModal';
import LoadingState from '@/shared/components/LoadingState';
import ErrorState from '@/shared/components/ErrorState';
import EmptyState from '@/shared/components/EmptyState';

export const AdminProductosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotificationStore();
  const [sorting, setSorting] = useState<SortingState>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [productoStock, setProductoStock] = useState<Producto | null>(null);

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.listarActivas,
  });

  const {
    data: dataProductos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['productos-admin'],
    queryFn: () => productosApi.listarPaginado({ limit: 100 }),
  });

  const productos = dataProductos?.items || [];

  const createMutation = useMutation({
    mutationFn: productosApi.crear,
    onSuccess: (nuevo) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos-admin'] });
      showSuccess(`Producto "${nuevo.nombre}" creado exitosamente`);
    },
    onError: (err) => {
      showError(handleApiError(err, 'Error al crear producto'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoCreate }) =>
      productosApi.actualizar(id, data),
    onSuccess: (actualizado) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos-admin'] });
      showSuccess(`Producto "${actualizado.nombre}" actualizado`);
    },
    onError: (err) => {
      showError(handleApiError(err, 'Error al actualizar producto'));
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoStockUpdate }) =>
      productosApi.actualizarStock(id, data),
    onSuccess: (actualizado) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos-admin'] });
      showSuccess(`Stock de "${actualizado.nombre}" actualizado (${actualizado.stock})`);
    },
    onError: (err) => {
      showError(handleApiError(err, 'Error al actualizar stock'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productosApi.eliminar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos-admin'] });
      showSuccess('Producto dado de baja correctamente');
    },
    onError: (err) => {
      showError(handleApiError(err, 'Error al eliminar producto'));
    },
  });

  const handleOpenCrear = () => {
    setProductoEditar(null);
    setModalOpen(true);
  };

  const handleOpenEditar = React.useCallback((p: Producto) => {
    setProductoEditar(p);
    setModalOpen(true);
  }, []);

  const handleOpenStock = React.useCallback((p: Producto) => {
    setProductoStock(p);
    setStockModalOpen(true);
  }, []);

  const handleEliminar = React.useCallback(
    (p: Producto) => {
      if (
        window.confirm(`¿Confirmas la baja lógica del producto "${p.nombre}"?`)
      ) {
        deleteMutation.mutate(p.id);
      }
    },
    [deleteMutation]
  );

  const handleFormSubmit = async (formData: ProductoCreate) => {
    if (productoEditar) {
      await updateMutation.mutateAsync({
        id: productoEditar.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleStockSubmit = async (stockData: ProductoStockUpdate) => {
    if (productoStock) {
      await stockMutation.mutateAsync({
        id: productoStock.id,
        data: stockData,
      });
    }
  };

  const columns = useMemo<ColumnDef<Producto>[]>(
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
        accessorKey: 'imagen_url',
        header: 'Foto',
        enableSorting: false,
        cell: (info) => {
          const url = info.getValue<string | null>();
          return (
            <img
              src={url || '/assets/img/burrito1.jpg'}
              alt="Producto"
              className="w-12 h-12 object-cover rounded-lg border border-[#eaf5de] dark:border-[#334233] shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/img/burrito1.jpg';
              }}
            />
          );
        },
      },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: (info) => (
          <div>
            <span className="font-title1 text-[20px] text-[#2F3A2F] dark:text-[#fcf7ef] leading-tight block">
              {info.getValue<string>()}
            </span>
            <span className="bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#743502] dark:text-[#e8c14b] font-bold text-xs px-2.5 py-0.5 rounded-full font-body inline-block mt-1">
              {info.row.original.categoria?.nombre || 'Sin categoría'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: (info) => (
          <span className="text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80 text-sm font-body leading-relaxed max-w-xs block line-clamp-2">
            {info.getValue<string>() || (
              <em className="text-[#2F3A2F]/40 dark:text-[#fcf7ef]/40">Sin descripción</em>
            )}
          </span>
        ),
      },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: (info) => (
          <span className="font-title2 font-bold text-[#2F3A2F] dark:text-[#fcf7ef] text-sm">
            ${info.getValue<number>().toLocaleString('es-AR')}
          </span>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: (info) => {
          const stock = info.getValue<number>();
          return (
            <span className="bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#2F3A2F] dark:text-[#eaf5de] font-bold text-xs px-2.5 py-1 rounded-full font-body">
              {stock} u.
            </span>
          );
        },
      },
      {
        accessorKey: 'disponible',
        header: 'Estado',
        cell: (info) => {
          const disp = info.getValue<boolean>();
          const stock = info.row.original.stock;
          const hayStock = disp && stock > 0;
          return (
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full font-body inline-block ${
                hayStock
                  ? 'bg-[#72a95c] text-white'
                  : 'bg-[#c94b43] text-white'
              }`}
            >
              {hayStock ? 'Disponible' : 'Agotado'}
            </span>
          );
        },
      },
      {
        id: 'acciones',
        header: () => <div className="text-right">Acciones</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenStock(prod)}
                className="bg-[#e8c14b] hover:bg-[#d6b03c] text-[#2F3A2F] font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Ajustar stock rápido"
              >
                Stock
              </button>
              <button
                type="button"
                onClick={() => handleOpenEditar(prod)}
                className="bg-[#72a95c] hover:bg-[#5f914b] text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleEliminar(prod)}
                className="bg-[#c94b43] hover:bg-[#b03b34] text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          );
        },
      },
    ],
    [handleOpenEditar, handleOpenStock, handleEliminar]
  );

  const table = useReactTable({
    data: productos,
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
          Gestión de productos y stock de Veggie Food Store.
        </p>
        <button
          type="button"
          onClick={handleOpenCrear}
          className="bg-[#743502] hover:bg-[#c94b43] text-[#fcf7ef] font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0 font-body text-sm"
        >
          + Nuevo producto
        </button>
      </div>

      {isLoading && <LoadingState message="Cargando productos desde el backend..." />}

      {isError && (
        <ErrorState
          title="Error al cargar los productos"
          message={error instanceof Error ? error.message : 'Error desconocido'}
        />
      )}

      {!isLoading && !isError && productos.length === 0 && (
        <EmptyState
          title="No hay productos registrados"
          description="Agrega el primer producto vegetariano de la tienda usando el botón superior."
          icon="🥑"
        />
      )}

      {!isLoading && !isError && productos.length > 0 && (
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
                ({productos.length} {productos.length === 1 ? 'producto' : 'productos'} en total)
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

      {/* Modal Crear / Editar */}
      <ProductoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        producto={productoEditar}
        categorias={categorias}
      />

      {/* Modal Stock Rápido */}
      {productoStock && (
        <StockModal
          isOpen={stockModalOpen}
          onClose={() => {
            setStockModalOpen(false);
            setProductoStock(null);
          }}
          onSubmit={handleStockSubmit}
          producto={productoStock}
        />
      )}
    </div>
  );
};

export default AdminProductosPage;
