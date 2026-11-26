import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Usuario } from '@/store/authStore';
import type {
  LoginCredentials,
  MessageResponse,
  RegisterData,
} from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<MessageResponse> => {
    const params = new URLSearchParams();
    params.append('username', credentials.username.trim());
    params.append('password', credentials.password);

    const response = await axiosInstance.post<MessageResponse>(
      '/auth/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  },

  register: async (data: RegisterData): Promise<Usuario> => {
    const response = await axiosInstance.post<Usuario>('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<Usuario> => {
    const response = await axiosInstance.get<Usuario>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>('/auth/logout');
    return response.data;
  },
};
