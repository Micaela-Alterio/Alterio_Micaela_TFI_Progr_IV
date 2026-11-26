import { axiosInstance } from '@/shared/api/axiosInstance';
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto.types';

export const productosApi = {
  listarPaginado: async (
    filtros: FiltrosProductos = {}
  ): Promise<ProductosPaginados> => {
    const params = new URLSearchParams();
    if (filtros.skip !== undefined) params.append('skip', String(filtros.skip));
    if (filtros.limit !== undefined) params.append('limit', String(filtros.limit));
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.categoria_id !== undefined && filtros.categoria_id !== null) {
      params.append('categoria_id', String(filtros.categoria_id));
    }
    if (filtros.disponible !== undefined) {
      params.append('disponible', String(filtros.disponible));
    }

    const res = await axiosInstance.get<ProductosPaginados>('/productos', {
      params,
    });
    return res.data;
  },

  obtenerPorId: async (id: number): Promise<Producto> => {
    const res = await axiosInstance.get<Producto>(`/productos/${id}`);
    return res.data;
  },

  crear: async (data: ProductoCreate): Promise<Producto> => {
    const res = await axiosInstance.post<Producto>('/productos', data);
    return res.data;
  },

  actualizar: async (id: number, data: ProductoUpdate): Promise<Producto> => {
    const res = await axiosInstance.put<Producto>(`/productos/${id}`, data);
    return res.data;
  },

  actualizarStock: async (
    id: number,
    data: ProductoStockUpdate
  ): Promise<Producto> => {
    const res = await axiosInstance.patch<Producto>(
      `/productos/${id}/stock`,
      data
    );
    return res.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/productos/${id}`);
  },
};
