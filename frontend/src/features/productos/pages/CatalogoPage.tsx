import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productosApi } from '../api/productosApi';
import { categoriasApi } from '@/features/categorias/api/categoriasApi';
import { ProductoCard } from '../components/ProductoCard';
import { Paginacion } from '@/shared/components/Paginacion';
import LoadingState from '@/shared/components/LoadingState';
import EmptyState from '@/shared/components/EmptyState';
import ErrorState from '@/shared/components/ErrorState';

export const CatalogoPage: React.FC = () => {
  const [pagina, setPagina] = useState(0); // 0-indexed
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const limit = 8;

  // Consulta de categorías para el filtro
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.listarActivas,
  });

  // Consulta de productos con paginación del servidor
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['productos', { pagina, limit, search, categoriaId }],
    queryFn: () =>
      productosApi.listarPaginado({
        skip: pagina * limit,
        limit,
        search: search.trim() || undefined,
        categoria_id: categoriaId,
        disponible: true,
      }),
  });

  const total = data?.total || 0;
  const productos = data?.items || [];
  const totalPaginas = Math.ceil(total / limit);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagina(0);
  };

  const handleCategoriaClick = (catId?: number) => {
    setCategoriaId(catId);
    setPagina(0);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado limpio con tipografía y estética de TP 10 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaf5de] dark:border-[#334233]">
        <div>
          <h1 className="font-title1 text-3xl font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
            Catálogo de Productos
          </h1>
          <p className="font-body text-[15px] font-normal text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
            Descubre nuestros platillos vegetarianos preparados artesanalmente con ingredientes naturales.
          </p>
        </div>
      </div>

      {/* Filtros: Búsqueda y Categorías */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar productos por nombre (ej: Burrito, Tacos, Quesadillas)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] text-[#2F3A2F] dark:text-[#fcf7ef] placeholder:text-[#2F3A2F]/50 dark:placeholder:text-[#fcf7ef]/50 font-body focus:outline-hidden transition-colors shadow-2xs"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-3 text-[#743502] dark:text-[#e8c14b] pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Píldoras de Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            type="button"
            onClick={() => handleCategoriaClick(undefined)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold font-body transition-colors cursor-pointer shrink-0 ${
              categoriaId === undefined
                ? 'bg-[#72a95c] text-white shadow-xs'
                : 'bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#2F3A2F] dark:text-[#fcf7ef] hover:bg-[#d8ebc5] dark:hover:bg-[#344634]'
            }`}
          >
            Todas las categorías
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoriaClick(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold font-body transition-colors cursor-pointer shrink-0 ${
                categoriaId === cat.id
                  ? 'bg-[#72a95c] text-white shadow-xs'
                  : 'bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#2F3A2F] dark:text-[#fcf7ef] hover:bg-[#d8ebc5] dark:hover:bg-[#344634]'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Estados de Carga y Error */}
      {isLoading && <LoadingState message="Cargando productos desde el backend..." />}

      {isError && (
        <ErrorState
          title="Error al cargar el catálogo"
          message={error instanceof Error ? error.message : 'Error desconocido al conectar con el backend'}
        />
      )}

      {/* Estado Vacío */}
      {!isLoading && !isError && productos.length === 0 && (
        <EmptyState
          title="No encontramos productos"
          description={
            search || categoriaId
              ? 'Intenta cambiar los términos de búsqueda o seleccionar otra categoría.'
              : 'Aún no hay productos disponibles en el catálogo.'
          }
          icon="🥑"
        />
      )}

      {/* Grilla de Productos */}
      {!isLoading && !isError && productos.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((prod) => (
              <ProductoCard key={prod.id} producto={prod} />
            ))}
          </div>

          {/* Paginación */}
          <Paginacion
            paginaActual={pagina + 1}
            totalPaginas={totalPaginas}
            onCambioPagina={(nuevaPagina) => setPagina(nuevaPagina - 1)}
          />
        </>
      )}
    </div>
  );
};

export default CatalogoPage;
