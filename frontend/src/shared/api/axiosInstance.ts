import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const detail = error.response?.data?.detail;

    const isAuthBypassUrl =
      url.includes('/auth/token') ||
      url.includes('/auth/me') ||
      url.includes('/auth/register');

    if (
      (status === 401 && !isAuthBypassUrl) ||
      (status === 400 && detail === 'Cuenta de usuario desactivada')
    ) {
      useAuthStore.getState().setUsuario(null);
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
