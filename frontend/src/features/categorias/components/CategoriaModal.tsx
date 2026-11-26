import React from 'react';
import { useForm } from '@tanstack/react-form';
import type { Categoria, CategoriaCreate } from '../types/categoria.types';

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoriaCreate) => Promise<void>;
  categoriaToEdit?: Categoria | null;
  isLoading?: boolean;
}

export const CategoriaModal: React.FC<CategoriaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categoriaToEdit,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <CategoriaModalDialog
      key={categoriaToEdit ? `edit-${categoriaToEdit.id}` : 'create'}
      onClose={onClose}
      onSubmit={onSubmit}
      categoriaToEdit={categoriaToEdit}
      isLoading={isLoading}
    />
  );
};

interface CategoriaModalDialogProps {
  onClose: () => void;
  onSubmit: (data: CategoriaCreate) => Promise<void>;
  categoriaToEdit?: Categoria | null;
  isLoading: boolean;
}

const CategoriaModalDialog: React.FC<CategoriaModalDialogProps> = ({
  onClose,
  onSubmit,
  categoriaToEdit,
  isLoading,
}) => {
  const isEditing = Boolean(categoriaToEdit);

  const form = useForm({
    defaultValues: {
      nombre: categoriaToEdit?.nombre ?? '',
      descripcion: categoriaToEdit?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || undefined,
      });
      onClose();
    },
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3A2F]/40 backdrop-blur-xs"
    >
      <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-2xl border border-[#e8c14b]/40 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 pt-6 pb-4 border-b border-[#eaf5de] dark:border-[#334233] flex items-center justify-between">
          <h2 className="font-title2 font-bold text-xl text-[#2F3A2F] dark:text-[#fcf7ef]">
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
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
          className="p-6 space-y-4"
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                !value || !value.trim()
                  ? 'El nombre es obligatorio (mínimo 2 caracteres).'
                  : value.trim().length < 2
                  ? 'El nombre debe tener al menos 2 caracteres.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
                >
                  Nombre de la categoría *
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Burritos, Chilaquiles, Tacos"
                  className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef]"
                  disabled={isLoading}
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

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-xs font-semibold uppercase tracking-wider text-[#743502] dark:text-[#e8c14b] mb-1 font-body"
                >
                  Descripción (opcional)
                </label>
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={2}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe las características de la categoría..."
                  className="w-full border-2 border-[#e8c14b] focus:border-[#72a95c] bg-[#fcf7ef] dark:bg-[#1a231a] rounded-[5px] p-2 text-sm focus:outline-hidden font-body text-[#2F3A2F] dark:text-[#fcf7ef] resize-none"
                  disabled={isLoading}
                />
              </div>
            )}
          </form.Field>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
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
                  disabled={!canSubmit || isSubmitting || isLoading}
                  className="bg-[#72a95c] hover:bg-[#5f914b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  {isSubmitting || isLoading
                    ? 'Guardando...'
                    : isEditing
                    ? 'Actualizar'
                    : 'Guardar'}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  );
};
