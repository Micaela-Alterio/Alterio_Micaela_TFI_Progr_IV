import React from 'react';
import type { Producto } from '../types/producto.types';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';

interface ProductoCardProps {
  producto: Producto;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({ producto }) => {
  const { agregar } = useCartStore();
  const { showSuccess, showWarning } = useNotificationStore();

  const handleAgregar = () => {
    const ok = agregar({
      id: producto.id,
      nombre: producto.nombre,
      precio_base: producto.precio_base,
      imagen_url: producto.imagen_url,
      stock: producto.stock,
    });

    if (ok) {
      showSuccess(`"${producto.nombre}" agregado al carrito`);
    } else {
      showWarning(
        `No hay más stock disponible para "${producto.nombre}" (Stock máx: ${producto.stock})`
      );
    }
  };

  const puedeComprar = producto.disponible && producto.stock > 0;

  return (
    <article className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between group">
      {/* Imagen */}
      <div className="relative w-full h-48 bg-[#eaf5de] dark:bg-[#1a231a] overflow-hidden">
        <img
          src={producto.imagen_url || '/assets/img/burrito1.jpg'}
          alt={producto.nombre}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/img/burrito1.jpg';
          }}
        />

        {/* Categoría Tag */}
        {producto.categoria && (
          <span className="absolute top-3 left-3 bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#743502] dark:text-[#e8c14b] font-bold text-xs px-2.5 py-0.5 rounded-full shadow-xs font-body">
            {producto.categoria.nombre}
          </span>
        )}

        {/* Badge de Stock */}
        <div className="absolute top-3 right-3 font-body">
          {!producto.disponible ? (
            <span className="bg-[#c94b43] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              No disponible
            </span>
          ) : producto.stock === 0 ? (
            <span className="bg-[#c94b43] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              Sin stock
            </span>
          ) : producto.stock <= 5 ? (
            <span className="bg-[#e8c14b] text-[#2F3A2F] text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              ¡Últimos {producto.stock}!
            </span>
          ) : (
            <span className="bg-[#72a95c] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              {producto.stock} disponibles
            </span>
          )}
        </div>
      </div>

      {/* Info y Footer */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-title1 font-normal text-[24px] leading-tight text-[#2F3A2F] dark:text-[#fcf7ef] mb-1.5 group-hover:text-[#72a95c] transition-colors line-clamp-1">
            {producto.nombre}
          </h3>
          <p className="text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80 text-sm font-body leading-relaxed line-clamp-2 mb-4">
            {producto.descripcion || 'Sin descripción disponible.'}
          </p>
        </div>

        <div className="pt-3 border-t border-[#eaf5de] dark:border-[#334233] flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] font-bold font-body block">
              Precio
            </span>
            <span className="text-xl font-bold font-title2 text-[#2F3A2F] dark:text-[#fcf7ef]">
              ${producto.precio_base.toLocaleString('es-AR')}
            </span>
          </div>

          <button
            type="button"
            disabled={!puedeComprar}
            onClick={handleAgregar}
            className={`font-bold text-xs px-4 py-2 rounded-lg transition-colors font-body shadow-xs ${
              puedeComprar
                ? 'bg-[#72a95c] hover:bg-[#5f914b] text-white cursor-pointer active:scale-95'
                : 'bg-[#c94b43]/20 text-[#c94b43] cursor-not-allowed opacity-60'
            }`}
          >
            {puedeComprar ? 'Agregar al carrito' : 'Agotado'}
          </button>
        </div>
      </div>
    </article>
  );
};
