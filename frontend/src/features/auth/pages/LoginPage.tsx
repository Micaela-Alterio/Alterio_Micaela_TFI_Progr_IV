import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { authApi } from '../api/authApi';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { usuario, login } = useAuthStore();
  const { showSuccess } = useNotificationStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      setIsSubmitting(true);
      try {
        await authApi.login({
          username: value.username.trim(),
          password: value.password,
        });
        const me = await authApi.getMe();
        login(me);
        showSuccess(`¡Bienvenido de nuevo, ${me.full_name || me.username}!`);
        navigate('/', { replace: true });
      } catch (err: unknown) {
        setErrorMessage(
          handleApiError(err, 'Credenciales incorrectas o cuenta desactivada.')
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center relative before:content-[''] before:absolute before:inset-0 before:bg-black/25 bg-[url('/assets/img/chiles.jpg')]"
      style={{ backgroundImage: "url('/assets/img/chiles.jpg')" }}
    >
      <div className="relative z-10 w-full max-w-[380px] bg-[#eaf5de] dark:bg-[#202b20] border border-transparent dark:border-[#72a95c]/30 rounded-xl shadow-2xl px-8 py-9 transition-colors">
        <Link to="/" className="block">
          <img
            src="/assets/img/logo1.png"
            alt="Veggie Food Store"
            className="w-64 max-w-[85%] h-auto mx-auto mb-4 object-contain"
          />
        </Link>

        <h1 className="text-center font-title1 text-[28px] font-bold text-[#2F3A2F] dark:text-[#fcf7ef] mb-5">
          Iniciar Sesión
        </h1>

        {errorMessage && (
          <div className="p-3 mb-4 text-sm rounded-lg bg-[#c94b43]/10 border border-[#c94b43]/30 text-[#c94b43] font-body text-center">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                !value || !value.trim()
                  ? 'El usuario o email es obligatorio.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block font-body text-[14px] font-semibold text-[#2F3A2F] dark:text-[#fcf7ef] mb-1.5"
                >
                  Usuario o Email
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ej: cliente o user@veggiefood.com"
                  disabled={isSubmitting}
                  className="w-full bg-[#fcf7ef] dark:bg-[#1a231a] border border-[#e8c14b] rounded-md px-3 py-2 font-body text-[14px] text-[#2F3A2F] dark:text-[#fcf7ef] placeholder:text-[#2F3A2F]/50 dark:placeholder:text-[#fcf7ef]/50 focus:outline-hidden focus:border-[#72a95c]"
                  autoComplete="username"
                  autoFocus
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-[#c94b43] mt-1 font-body">
                    {field.state.meta.errors.filter(Boolean).map(String).join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                !value ? 'La contraseña es requerida.' : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block font-body text-[14px] font-semibold text-[#2F3A2F] dark:text-[#fcf7ef] mb-1.5"
                >
                  Contraseña
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  disabled={isSubmitting}
                  className="w-full bg-[#fcf7ef] dark:bg-[#1a231a] border border-[#e8c14b] rounded-md px-3 py-2 font-body text-[14px] text-[#2F3A2F] dark:text-[#fcf7ef] placeholder:text-[#2F3A2F]/50 dark:placeholder:text-[#fcf7ef]/50 focus:outline-hidden focus:border-[#72a95c]"
                  autoComplete="current-password"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-[#c94b43] mt-1 font-body">
                    {field.state.meta.errors.filter(Boolean).map(String).join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 rounded-md bg-[#c94b43] hover:bg-[#b53d35] text-white font-body font-semibold text-[15px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-4 text-center font-body text-[13px] text-[#2F3A2F] dark:text-[#fcf7ef]">
          ¿No estás registrado?{' '}
          <Link
            to="/register"
            className="underline font-medium hover:text-[#743502] dark:hover:text-[#e8c14b]"
          >
            Registrate acá
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
