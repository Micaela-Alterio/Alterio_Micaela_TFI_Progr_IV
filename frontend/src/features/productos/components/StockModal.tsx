import React, { useState } from 'react';
import type { Producto, ProductoStockUpdate } from '../types/producto.types';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductoStockUpdate) => Promise<void>;
  producto: Producto;
}

export const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  producto,
}) => {
  const [stock, setStock] = useState(producto.stock);
  const [disponible, setDisponible] = useState(producto.disponible);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ stock: Number(stock), disponible });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3A2F]/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-2xl border border-[#e8c14b]/40 shadow-xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 pt-6 pb-4 border-b border-[#eaf5de] dark:border-[#334233] flex items-center justify-between">
          <h2 className="font-title2 font-bold text-xl text-[#2F3A2F] dark:text-[#fcf7ef]">
            Stock: {producto.nombre}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 hover:text-[#2F3A2F] dark:hover:text-[#fcf7ef] transition-colors text-xl font-bold leading-none p-1 cursor-pointer"
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="stock"
              className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
            >
              Cantidad en Stock *
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef]"
              required
              autoFocus
            />
          </div>

          <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
              className="w-4 h-4 rounded text-[#72a95c] focus:ring-[#72a95c] accent-[#72a95c]"
            />
            <span className="font-body text-sm font-semibold text-[#2F3A2F] dark:text-[#fcf7ef]">
              Disponible para la venta
            </span>
          </label>

          <div className="pt-4 border-t border-[#eaf5de] dark:border-[#334233] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="bg-[#e8c14b] hover:bg-[#d6b03c] text-[#2F3A2F] font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#72a95c] hover:bg-[#5f914b] disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {submitting ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
