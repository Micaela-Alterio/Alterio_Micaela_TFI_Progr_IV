import { axiosInstance } from '@/shared/api/axiosInstance';
import type {
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido.types';

export const pedidosApi = {
  crear: async (data: PedidoCreate): Promise<Pedido> => {
    const res = await axiosInstance.post<Pedido>('/pedidos', data);
    return res.data;
  },

  listar: async (params: {
    skip?: number;
    limit?: number;
    estado?: string;
  } = {}): Promise<PedidosPaginados> => {
    const res = await axiosInstance.get<PedidosPaginados>('/pedidos', {
      params,
    });
    return res.data;
  },

  obtenerResumen: async (): Promise<ResumenPedidos> => {
    const res = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen');
    return res.data;
  },

  obtenerPorId: async (id: number): Promise<Pedido> => {
    const res = await axiosInstance.get<Pedido>(`/pedidos/${id}`);
    return res.data;
  },

  actualizarEstado: async (
    id: number,
    estado: string
  ): Promise<Pedido> => {
    const res = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, {
      estado,
    });
    return res.data;
  },

  cancelar: async (id: number): Promise<Pedido> => {
    const res = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
    return res.data;
  },
};
