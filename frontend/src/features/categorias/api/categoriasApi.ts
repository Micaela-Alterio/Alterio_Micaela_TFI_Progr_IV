import { axiosInstance } from '@/shared/api/axiosInstance';
import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from '../types/categoria.types';

export const categoriasApi = {
  listarActivas: async (): Promise<Categoria[]> => {
    const res = await axiosInstance.get<Categoria[]>('/categorias');
    return res.data;
  },

  obtenerPorId: async (id: number): Promise<Categoria> => {
    const res = await axiosInstance.get<Categoria>(`/categorias/${id}`);
    return res.data;
  },

  crear: async (data: CategoriaCreate): Promise<Categoria> => {
    const res = await axiosInstance.post<Categoria>('/categorias', data);
    return res.data;
  },

  actualizar: async (id: number, data: CategoriaUpdate): Promise<Categoria> => {
    const res = await axiosInstance.put<Categoria>(`/categorias/${id}`, data);
    return res.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/categorias/${id}`);
  },
};
