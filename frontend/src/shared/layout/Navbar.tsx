import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { usuario, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const { theme, toggleTheme } = useThemeStore();

  // Ocultar completamente el Navbar en pantallas de autenticación o no autorizado
  if (['/login', '/register', '/unauthorized'].includes(location.pathname)) {
    return null;
  }

  const isAdmin = usuario?.role === 'admin';
  const isUser = usuario?.role === 'user';
  const isLoggedIn = !!usuario;

  const linkClass = (isActive: boolean) =>
    isActive
      ? 'bg-[#72a95c] text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors'
      : 'text-[#2F3A2F] dark:text-[#fcf7ef] hover:bg-[#d8ebc5] dark:hover:bg-[#344634] font-medium px-4 py-2 rounded-lg text-sm transition-colors';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="w-full max-w-[1200px] mx-auto mt-6 px-5">
      <nav className="w-full bg-[#eaf5de] dark:bg-[#253225] border border-transparent dark:border-[#72a95c]/20 rounded-[10px] px-6 py-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        {/* Sector izquierdo: Logo y enlaces de navegación */}
        <div className="flex items-center gap-6 flex-wrap justify-center md:justify-start">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/img/logo2.png"
              alt="Veggie Food Store"
              className="h-12 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Enlaces públicos */}
            <Link to="/" className={linkClass(location.pathname === '/')}>
              Catálogo
            </Link>

            <Link
              to="/carrito"
              className={`${linkClass(
                location.pathname === '/carrito'
              )} inline-flex items-center gap-1.5`}
            >
              <span>Carrito</span>
              {totalItems > 0 && (
                <span className="bg-[#c94b43] text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Enlaces de usuario cliente */}
            {isLoggedIn && isUser && (
              <Link
                to="/mis-pedidos"
                className={linkClass(location.pathname === '/mis-pedidos')}
              >
                Mis Pedidos
              </Link>
            )}

            {/* Enlaces de administración */}
            {isLoggedIn && isAdmin && (
              <>
                <Link
                  to="/admin/resumen"
                  className={linkClass(location.pathname === '/admin/resumen')}
                >
                  Resumen
                </Link>
                <Link
                  to="/admin/categorias"
                  className={linkClass(location.pathname === '/admin/categorias')}
                >
                  Categorías
                </Link>
                <Link
                  to="/admin/productos"
                  className={linkClass(location.pathname === '/admin/productos')}
                >
                  Productos
                </Link>
                <Link
                  to="/admin/pedidos"
                  className={linkClass(location.pathname === '/admin/pedidos')}
                >
                  Pedidos
                </Link>
                <Link
                  to="/admin/usuarios"
                  className={linkClass(location.pathname === '/admin/usuarios')}
                >
                  Usuarios
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Sector derecho: Perfil con roles, selector de tema claro/oscuro y sesión */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {isLoggedIn ? (
            <>
              {/* 1. Nombre y badge con rol */}
              <div className="flex items-center gap-2 text-right">
                <span className="font-title2 font-bold text-sm text-[#2F3A2F] dark:text-[#fcf7ef]">
                  {usuario.full_name || usuario.username}
                </span>
                <span className="bg-[#72a95c] text-white font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider font-body">
                  {usuario.role.toUpperCase()}
                </span>
              </div>

              {/* 2. Botón para alternar modo claro/oscuro */}
              <button
                type="button"
                onClick={toggleTheme}
                className="border border-[#e8c14b] bg-[#fcf7ef] dark:bg-[#273127] text-[#2F3A2F] dark:text-[#fbf9f4] hover:bg-[#e8c14b]/20 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title={
                  theme === 'dark'
                    ? 'Cambiar a modo claro'
                    : 'Cambiar a modo oscuro'
                }
                aria-label="Alternar tema de interfaz"
              >
                <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                <span className="font-body text-xs">
                  {theme === 'dark' ? 'Claro' : 'Oscuro'}
                </span>
              </button>

              {/* 3. Botón Cerrar sesión */}
              <button
                type="button"
                onClick={handleLogout}
                className="bg-[#c94b43] hover:bg-[#b03b34] text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              {/* Botón para alternar modo claro/oscuro en modo visitante */}
              <button
                type="button"
                onClick={toggleTheme}
                className="border border-[#e8c14b] bg-[#fcf7ef] dark:bg-[#273127] text-[#2F3A2F] dark:text-[#fbf9f4] hover:bg-[#e8c14b]/20 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title={
                  theme === 'dark'
                    ? 'Cambiar a modo claro'
                    : 'Cambiar a modo oscuro'
                }
                aria-label="Alternar tema de interfaz"
              >
                <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                <span className="font-body text-xs">
                  {theme === 'dark' ? 'Claro' : 'Oscuro'}
                </span>
              </button>

              {/* Botones de Iniciar sesión y Registrarse */}
              <Link
                to="/login"
                className="border border-[#72a95c] text-[#2F3A2F] dark:text-[#fcf7ef] hover:bg-[#d8ebc5] dark:hover:bg-[#344634] font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-[#72a95c] hover:bg-[#5f8f4c] text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
