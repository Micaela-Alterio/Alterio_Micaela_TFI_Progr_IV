import React from 'react';
import { useForm } from '@tanstack/react-form';
import type { Categoria } from '@/features/categorias/types/categoria.types';
import type { Producto, ProductoCreate } from '../types/producto.types';

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductoCreate) => Promise<void>;
  producto?: Producto | null;
  categorias: Categoria[];
}

export const ProductoModal: React.FC<ProductoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  producto,
  categorias,
}) => {
  if (!isOpen) return null;

  return (
    <ProductoModalDialog
      key={producto ? `edit-${producto.id}` : 'create'}
      onClose={onClose}
      onSubmit={onSubmit}
      producto={producto}
      categorias={categorias}
    />
  );
};

interface ProductoModalDialogProps {
  onClose: () => void;
  onSubmit: (data: ProductoCreate) => Promise<void>;
  producto?: Producto | null;
  categorias: Categoria[];
}

const ProductoModalDialog: React.FC<ProductoModalDialogProps> = ({
  onClose,
  onSubmit,
  producto,
  categorias,
}) => {
  const isEditing = Boolean(producto);

  const form = useForm({
    defaultValues: {
      categoria_id: producto?.categoria_id || (categorias[0]?.id ?? 1),
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        categoria_id: Number(value.categoria_id),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: Boolean(value.disponible),
      });
      onClose();
    },
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3A2F]/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-2xl border border-[#e8c14b]/40 shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 pt-6 pb-4 border-b border-[#eaf5de] dark:border-[#334233] flex items-center justify-between">
          <h2 className="font-title2 font-bold text-xl text-[#2F3A2F] dark:text-[#fcf7ef]">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Categoría */}
            <form.Field name="categoria_id">
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
                  >
                    Categoría *
                  </label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef]"
                    required
                  >
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>

            {/* Nombre */}
            <form.Field
              name="nombre"
              validators={{
                onChange: ({ value }) =>
                  !value || !value.trim() ? 'El nombre es obligatorio.' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
                  >
                    Nombre del producto *
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: Burrito Tex"
                    className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef]"
                    autoFocus
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-[#c94b43] mt-1 font-body">
                      {field.state.meta.errors.filter(Boolean).map(String).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Descripción */}
          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
                >
                  Descripción
                </label>
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={2}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ingredientes y características..."
                  className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef] resize-none"
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Precio Base */}
            <form.Field
              name="precio_base"
              validators={{
                onChange: ({ value }) =>
                  Number(value) < 0 ? 'El precio no puede ser negativo.' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
                  >
                    Precio Base ($) *
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef]"
                    required
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-[#c94b43] mt-1 font-body">
                      {field.state.meta.errors.filter(Boolean).map(String).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Stock */}
            <form.Field
              name="stock"
              validators={{
                onChange: ({ value }) =>
                  Number(value) < 0 ? 'El stock no puede ser negativo.' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
                  >
                    Stock Inicial *
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="0"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef]"
                    required
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-[#c94b43] mt-1 font-body">
                      {field.state.meta.errors.filter(Boolean).map(String).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Imagen URL */}
          <form.Field name="imagen_url">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
                >
                  URL de Imagen (ej: /assets/img/burrito1.jpg)
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="/assets/img/burrito1.jpg"
                  className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef]"
                />
              </div>
            )}
          </form.Field>

          {/* Disponible */}
          <form.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
                <input
                  id={field.name}
                  name={field.name}
                  type="checkbox"
                  checked={Boolean(field.state.value)}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="w-4 h-4 rounded text-[#72a95c] focus:ring-[#72a95c] accent-[#72a95c]"
                />
                <span className="font-body text-sm font-semibold text-[#2F3A2F] dark:text-[#fcf7ef]">
                  Producto disponible para la venta
                </span>
              </label>
            )}
          </form.Field>

          <div className="pt-4 border-t border-[#eaf5de] dark:border-[#334233] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#e8c14b] hover:bg-[#d6b03c] text-[#2F3A2F] font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="bg-[#72a95c] hover:bg-[#5f914b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  );
};
