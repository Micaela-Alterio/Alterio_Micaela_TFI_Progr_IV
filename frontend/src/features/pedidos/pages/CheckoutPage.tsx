import React from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { pedidosApi } from '../api/pedidosApi';
import type { FormaPago } from '../types/pedido.types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, vaciar } = useCartStore();
  const { showSuccess, showError } = useNotificationStore();

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await pedidosApi.crear({
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim() || null,
          items: items.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
          })),
        });

        vaciar();
        showSuccess('¡Pedido confirmado con éxito! Puedes seguir el estado en Mis Pedidos.');
        navigate('/mis-pedidos');
      } catch (err) {
        showError(handleApiError(err, 'No se pudo procesar el pedido'));
      }
    },
  });

  if (items.length === 0) {
    return <Navigate to="/carrito" replace />;
  }

  const montoTotal = total();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#eaf5de] dark:border-[#334233]">
        <h1 className="font-title1 text-3xl font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
          Finalizar Pedido
        </h1>
        <p className="font-body text-[15px] font-normal text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
          Completa los datos de envío y pago para preparar tu comida saludable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Formulario de Checkout */}
        <div className="md:col-span-3">
          <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#e8c14b]/40 p-6 shadow-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              {/* Dirección de Entrega */}
              <form.Field
                name="direccion_entrega"
                validators={{
                  onChange: ({ value }) => {
                    const l = value.trim().length;
                    if (l < 5 || l > 200) {
                      return 'La dirección debe tener entre 5 y 200 caracteres.';
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
                    >
                      Dirección de Entrega *
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="ej: Av. Santa Fe 1234, Piso 4 Depto B"
                      className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef]"
                      required
                    />
                    {field.state.meta.errors.length > 0 ? (
                      <p className="text-xs text-[#c94b43] mt-1 font-body">
                        {field.state.meta.errors.filter(Boolean).map(String).join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 mt-1 font-body">
                        Incluye calle, número, piso y depto si corresponde.
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Forma de Pago */}
              <form.Field name="forma_pago">
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
                    >
                      Forma de Pago *
                    </label>
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                      className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef]"
                    >
                      <option value="EFECTIVO">💵 Efectivo (Pago contra entrega)</option>
                      <option value="TRANSFERENCIA">💳 Transferencia Bancaria</option>
                    </select>
                  </div>
                )}
              </form.Field>

              {/* Notas u Observaciones */}
              <form.Field name="notas">
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
                    >
                      Notas / Instrucciones Especiales (Opcional)
                    </label>
                    <textarea
                      id={field.name}
                      name={field.name}
                      rows={3}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Ej: Tocar timbre 4B, sin cebolla en el burrito..."
                      className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef] resize-none"
                    />
                  </div>
                )}
              </form.Field>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="w-full mt-4 bg-[#72a95c] hover:bg-[#5f914b] disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors font-body text-sm shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? 'Confirmando pedido...' : 'Confirmar Pedido'}
                  </button>
                )}
              </form.Subscribe>
            </form>
          </div>
        </div>

        {/* Resumen de Compra Lateral */}
        <div className="md:col-span-2">
          <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-xl border border-[#eaf5de] dark:border-[#334233] p-5 space-y-4 shadow-xs sticky top-24">
            <h3 className="font-title2 font-bold text-base text-[#2F3A2F] dark:text-[#fcf7ef] pb-2 border-b border-[#eaf5de] dark:border-[#334233]">
              Tu Pedido
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.producto_id}
                  className="flex items-center justify-between text-xs font-body"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-[#2F3A2F] dark:text-[#fcf7ef] truncate">
                      {item.nombre}
                    </p>
                    <p className="text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60">
                      {item.cantidad} x ${item.precio_unitario.toLocaleString('es-AR')}
                    </p>
                  </div>
                  <span className="font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
                    ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#eaf5de] dark:border-[#334233] space-y-2 font-body text-xs">
              <div className="flex justify-between text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
                <span>Envío</span>
                <span className="text-[#72a95c] font-bold">¡Gratis!</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#eaf5de] dark:border-[#334233]">
                <span className="font-title2 text-sm font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
                  Total a Pagar
                </span>
                <span className="text-xl font-bold font-title2 text-[#2F3A2F] dark:text-[#fcf7ef]">
                  ${montoTotal.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <Link
              to="/carrito"
              className="block text-center text-xs font-bold font-body text-[#743502] dark:text-[#e8c14b] hover:underline"
            >
              &larr; Modificar carrito
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
