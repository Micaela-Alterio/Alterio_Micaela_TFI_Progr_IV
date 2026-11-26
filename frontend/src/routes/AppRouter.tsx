import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '@/shared/layout/MainLayout';

import { LoginPage, RegisterPage, UnauthorizedPage } from '@/features/auth';
import { CatalogoPage, AdminProductosPage } from '@/features/productos';
import { AdminCategoriasPage } from '@/features/categorias';
import { AdminUsuariosPage } from '@/features/usuarios';
import {
  CarritoPage,
  CheckoutPage,
  MisPedidosPage,
  AdminPedidosPage,
  AdminResumenPage,
} from '@/features/pedidos';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Páginas de Autenticación directas (full-screen con fondo de chiles) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Páginas principales envueltas en MainLayout (Navbar + Contenido) */}
      <Route element={<MainLayout />}>
        {/* Rutas Públicas */}
        <Route path="/" element={<CatalogoPage />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rutas Protegidas por Sesión Activa */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/mis-pedidos" element={<MisPedidosPage />} />
        </Route>

        {/* Rutas Protegidas de Administrador */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/resumen" element={<AdminResumenPage />} />
          <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
          <Route path="/admin/productos" element={<AdminProductosPage />} />
          <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
          <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
