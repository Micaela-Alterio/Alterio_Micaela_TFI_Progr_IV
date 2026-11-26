import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url?: string | null;
  stock: number;
}

interface CartState {
  items: CartItem[];
  agregar: (
    producto: {
      id: number;
      nombre: string;
      precio_base: number;
      imagen_url?: string | null;
      stock: number;
    },
    cantidad?: number
  ) => boolean;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) => {
        if (producto.stock <= 0) return false;

        const currentItems = get().items;
        const existing = currentItems.find(
          (item) => item.producto_id === producto.id
        );

        if (existing) {
          const nuevaCantidad = existing.cantidad + cantidad;
          if (nuevaCantidad > producto.stock) {
            return false;
          }
          set({
            items: currentItems.map((item) =>
              item.producto_id === producto.id
                ? { ...item, cantidad: nuevaCantidad, stock: producto.stock }
                : item
            ),
          });
          return true;
        }

        const cantidadReal = Math.min(cantidad, producto.stock);
        const newItem: CartItem = {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio_unitario: producto.precio_base,
          cantidad: cantidadReal,
          imagen_url: producto.imagen_url,
          stock: producto.stock,
        };

        set({ items: [...currentItems, newItem] });
        return true;
      },

      quitar: (producto_id: number) => {
        set({
          items: get().items.filter((item) => item.producto_id !== producto_id),
        });
      },

      cambiarCantidad: (producto_id: number, cantidad: number) => {
        if (cantidad <= 0) {
          get().quitar(producto_id);
          return;
        }
        set({
          items: get().items.map((item) => {
            if (item.producto_id === producto_id) {
              const cantidadValida = Math.min(cantidad, item.stock);
              return { ...item, cantidad: cantidadValida };
            }
            return item;
          }),
        });
      },

      vaciar: () => {
        set({ items: [] });
      },

      total: () => {
        return get().items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0
        );
      },

      totalItems: () => {
        return get().items.reduce((acc, item) => acc + item.cantidad, 0);
      },
    }),
    {
      name: 'veggiefood-cart-storage',
    }
  )
);
