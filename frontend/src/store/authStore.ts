import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { axiosInstance } from '@/shared/api/axiosInstance';

export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'admin' | 'user' | string;
  disabled: boolean;
  created_at?: string;
}

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  login: (usuario: Usuario) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setUsuario: (usuario: Usuario | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: (usuario: Usuario) => {
        set({ usuario, cargando: false });
      },

      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout');
        } catch {
          // Si falla, igual limpiamos el estado local
        } finally {
          set({ usuario: null, cargando: false });
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/login')
          ) {
            window.location.href = '/login';
          }
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const res = await axiosInstance.get<Usuario>('/auth/me');
          set({ usuario: res.data, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      setUsuario: (usuario: Usuario | null) => {
        set({ usuario, cargando: false });
      },
    }),
    {
      name: 'veggiefood-auth-storage',
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);
