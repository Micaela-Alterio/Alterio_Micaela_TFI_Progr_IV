import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const { usuario, cargando } = useAuthStore();

  if (cargando) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 font-body">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#72a95c] border-t-transparent mb-2" />
        <p className="text-sm font-medium text-[#2F3A2F]/70 dark:text-[#fcf7ef]/70">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(usuario.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
