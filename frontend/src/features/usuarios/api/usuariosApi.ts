import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Usuario } from '../types/usuario.types';

export const usuariosApi = {
  listar: async (): Promise<Usuario[]> => {
    const res = await axiosInstance.get<Usuario[]>('/admin/usuarios');
    return res.data;
  },

  activar: async (id: number): Promise<Usuario> => {
    const res = await axiosInstance.post<Usuario>(
      `/admin/usuarios/${id}/activar`
    );
    return res.data;
  },

  desactivar: async (id: number): Promise<Usuario> => {
    const res = await axiosInstance.post<Usuario>(
      `/admin/usuarios/${id}/desactivar`
    );
    return res.data;
  },
};
