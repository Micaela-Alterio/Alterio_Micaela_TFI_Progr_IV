import React from 'react';
import type { Pedido } from '../types/pedido.types';
import { Modal } from '@/shared/ui/Modal';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';

interface PedidoDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido | null;
}

export const PedidoDetalleModal: React.FC<PedidoDetalleModalProps> = ({
  isOpen,
  onClose,
  pedido,
}) => {
  if (!pedido) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Pedido #${pedido.id}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Metadatos del Pedido */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#eaf5de]/60 dark:bg-[#1a231a] rounded-xl border border-[#eaf5de] dark:border-[#334233] text-xs font-body">
          <div>
            <span className="text-[#743502] dark:text-[#e8c14b] font-bold uppercase tracking-wider block">
              Estado
            </span>
            <div className="mt-1">
              <BadgeEstado estado={pedido.estado} />
            </div>
          </div>
          <div>
            <span className="text-[#743502] dark:text-[#e8c14b] font-bold uppercase tracking-wider block">
              Forma de Pago
            </span>
            <span className="font-bold text-[#2F3A2F] dark:text-[#fcf7ef] mt-1 block">
              {pedido.forma_pago}
            </span>
          </div>
          <div>
            <span className="text-[#743502] dark:text-[#e8c14b] font-bold uppercase tracking-wider block">
              Fecha
            </span>
            <span className="font-bold text-[#2F3A2F] dark:text-[#fcf7ef] mt-1 block">
              {new Date(pedido.created_at).toLocaleString('es-AR')}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <span className="text-[#743502] dark:text-[#e8c14b] font-bold uppercase tracking-wider block">
              Dirección de Entrega
            </span>
            <span className="font-bold text-[#2F3A2F] dark:text-[#fcf7ef] mt-0.5 block">
              {pedido.direccion_entrega}
            </span>
          </div>
          {pedido.notas && (
            <div className="col-span-2 sm:col-span-3">
              <span className="text-[#743502] dark:text-[#e8c14b] font-bold uppercase tracking-wider block">
                Notas / Observaciones
              </span>
              <span className="text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80 italic mt-0.5 block">
                "{pedido.notas}"
              </span>
            </div>
          )}
        </div>

        {/* Tabla de Líneas del Pedido */}
        <div>
          <h3 className="text-sm font-bold text-[#2F3A2F] dark:text-[#fcf7ef] uppercase tracking-wider mb-2 font-title2">
            Productos Comprados
          </h3>
          <div className="border border-[#eaf5de] dark:border-[#334233] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs font-body">
              <thead className="bg-[#eaf5de] dark:bg-[#2c3d2c] text-[#2F3A2F] dark:text-[#fcf7ef] font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3 text-right">Precio Unitario</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaf5de] dark:divide-[#334233]">
                {pedido.items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fbf9f4] dark:hover:bg-[#2a362a] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#2F3A2F] dark:text-[#fcf7ef]">
                      {item.nombre_producto}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80">
                      ${item.precio_unitario.toLocaleString('es-AR')}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#2F3A2F] dark:text-[#fcf7ef]">
                      {item.cantidad}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#72a95c]">
                      ${item.subtotal.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total General */}
        <div className="flex justify-between items-center p-4 bg-[#eaf5de]/40 dark:bg-[#1a231a] rounded-xl border border-[#eaf5de] dark:border-[#334233]">
          <span className="font-title2 font-bold text-base text-[#2F3A2F] dark:text-[#fcf7ef]">
            Total del Pedido
          </span>
          <span className="text-2xl font-black font-title2 text-[#2F3A2F] dark:text-[#fcf7ef]">
            ${pedido.total.toLocaleString('es-AR')}
          </span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#e8c14b] hover:bg-[#d6b03c] text-[#2F3A2F] font-bold px-5 py-2 rounded-lg transition-colors cursor-pointer font-body text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};
