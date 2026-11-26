import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { EmptyState } from '@/shared/components/EmptyState';

export const CarritoPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, cambiarCantidad, quitar, vaciar, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          titulo="Tu carrito está vacío"
          descripcion="Aún no has agregado platillos saludables a tu pedido."
          icono="🥑"
          accion={
            <Link
              to="/"
              className="inline-block bg-[#72a95c] hover:bg-[#5f914b] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors font-body shadow-xs"
            >
              Explorar Catálogo
            </Link>
          }
        />
      </div>
    );
  }

  const montoTotal = total();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-[#eaf5de] dark:border-[#334233]">
        <div>
          <h1 className="font-title1 text-3xl font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
            Tu Carrito de Compras
          </h1>
          <p className="font-body text-[15px] font-normal text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
            Revisa tus platillos seleccionados antes de confirmar el pedido.
          </p>
        </div>
        <button
          type="button"
          onClick={vaciar}
          className="bg-[#c94b43]/15 hover:bg-[#c94b43] text-[#c94b43] hover:text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer font-body"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listado de Ítems */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.producto_id}
              className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] p-4 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-xs"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.imagen_url || '/assets/img/burrito1.jpg'}
                  alt={item.nombre}
                  className="w-16 h-16 object-cover rounded-lg border border-[#eaf5de] dark:border-[#334233] shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/img/burrito1.jpg';
                  }}
                />
                <div>
                  <h3 className="font-title1 text-[20px] leading-tight text-[#2F3A2F] dark:text-[#fcf7ef]">
                    {item.nombre}
                  </h3>
                  <p className="text-xs text-[#2F3A2F]/70 dark:text-[#fcf7ef]/70 font-body">
                    ${item.precio_unitario.toLocaleString('es-AR')} c/u • Máx: {item.stock} u.
                  </p>
                </div>
              </div>

              {/* Controles de cantidad y subtotal */}
              <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#eaf5de] dark:border-[#334233]">
                {/* Controles de Cantidad */}
                <div className="flex items-center border border-[#e8c14b] rounded-lg overflow-hidden bg-[#fcf7ef] dark:bg-[#1a231a]">
                  <button
                    type="button"
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad - 1)
                    }
                    className="px-2.5 py-1 text-[#2F3A2F] dark:text-[#fcf7ef] hover:bg-[#eaf5de] dark:hover:bg-[#2c3d2c] transition-colors font-bold cursor-pointer"
                    aria-label="Restar uno"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-bold text-[#2F3A2F] dark:text-[#fcf7ef] font-body">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    disabled={item.cantidad >= item.stock}
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad + 1)
                    }
                    className="px-2.5 py-1 text-[#2F3A2F] dark:text-[#fcf7ef] hover:bg-[#eaf5de] dark:hover:bg-[#2c3d2c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold cursor-pointer"
                    aria-label="Sumar uno"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[80px]">
                  <span className="font-title2 font-bold text-base text-[#2F3A2F] dark:text-[#fcf7ef] block">
                    ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>

                {/* Quitar */}
                <button
                  type="button"
                  onClick={() => quitar(item.producto_id)}
                  className="text-[#c94b43] hover:text-[#b03b34] p-1.5 transition-colors cursor-pointer text-lg font-bold leading-none"
                  title="Eliminar producto del carrito"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen Lateral */}
        <div className="lg:col-span-1">
          <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#e8c14b]/40 p-6 space-y-4 shadow-xs sticky top-24">
            <h2 className="font-title2 font-bold text-lg text-[#2F3A2F] dark:text-[#fcf7ef] pb-3 border-b border-[#eaf5de] dark:border-[#334233]">
              Resumen del Pedido
            </h2>

            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.cantidad, 0)} ítems)</span>
                <span className="font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
                  ${montoTotal.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
                <span>Costo de envío</span>
                <span className="text-[#72a95c] font-bold">¡Gratis!</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#eaf5de] dark:border-[#334233] flex justify-between items-baseline">
              <span className="font-title2 text-base font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
                Total
              </span>
              <span className="text-2xl font-black font-title2 text-[#2F3A2F] dark:text-[#fcf7ef]">
                ${montoTotal.toLocaleString('es-AR')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#72a95c] hover:bg-[#5f914b] text-white font-bold py-3 rounded-lg transition-colors font-body text-sm shadow-xs cursor-pointer block text-center"
            >
              Iniciar Checkout
            </button>

            <Link
              to="/"
              className="block text-center text-xs font-bold font-body text-[#743502] dark:text-[#e8c14b] hover:underline pt-1"
            >
              &larr; Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarritoPage;
