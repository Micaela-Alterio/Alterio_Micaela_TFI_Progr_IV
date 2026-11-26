import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { authApi } from '../api/authApi';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const { showSuccess } = useNotificationStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      setIsSubmitting(true);
      try {
        await authApi.register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        showSuccess('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
        navigate('/login');
      } catch (err: unknown) {
        setErrorMessage(
          handleApiError(err, 'Error al registrar el usuario. Revisa los datos ingresados.')
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
      <div className="relative z-10 w-full max-w-[480px] bg-[#eaf5de] dark:bg-[#202b20] border border-transparent dark:border-[#72a95c]/30 rounded-xl shadow-2xl px-8 py-9 my-8 transition-colors">
        <Link to="/" className="block">
          <img
            src="/assets/img/logo1.png"
            alt="Veggie Food Store"
            className="w-64 max-w-[85%] h-auto mx-auto mb-4 object-contain"
          />
        </Link>

        <h1 className="text-center font-title1 text-[28px] font-bold text-[#2F3A2F] dark:text-[#fcf7ef] mb-5">
          Crear Cuenta
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) =>
                  !value || !value.trim()
                    ? 'El nombre de usuario es obligatorio.'
                    : value.trim().length < 3
                    ? 'Mínimo 3 caracteres.'
                    : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block font-body text-[14px] font-semibold text-[#2F3A2F] dark:text-[#fcf7ef] mb-1.5"
                  >
                    Usuario
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="ej: mica_alterio"
                    disabled={isSubmitting}
                    className="w-full bg-[#fcf7ef] dark:bg-[#1a231a] border border-[#e8c14b] rounded-md px-3 py-2 font-body text-[14px] text-[#2F3A2F] dark:text-[#fcf7ef] placeholder:text-[#2F3A2F]/50 dark:placeholder:text-[#fcf7ef]/50 focus:outline-hidden focus:border-[#72a95c]"
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
              name="full_name"
              validators={{
                onChange: ({ value }) =>
                  !value || !value.trim() ? 'El nombre completo es obligatorio.' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block font-body text-[14px] font-semibold text-[#2F3A2F] dark:text-[#fcf7ef] mb-1.5"
                  >
                    Nombre Completo
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="ej: Micaela Alterio"
                    disabled={isSubmitting}
                    className="w-full bg-[#fcf7ef] dark:bg-[#1a231a] border border-[#e8c14b] rounded-md px-3 py-2 font-body text-[14px] text-[#2F3A2F] dark:text-[#fcf7ef] placeholder:text-[#2F3A2F]/50 dark:placeholder:text-[#fcf7ef]/50 focus:outline-hidden focus:border-[#72a95c]"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-[#c94b43] mt-1 font-body">
                      {field.state.meta.errors.filter(Boolean).map(String).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value || !value.trim()
                  ? 'El email es requerido.'
                  : !/\S+@\S+\.\S+/.test(value)
                  ? 'Ingresa un email válido.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block font-body text-[14px] font-semibold text-[#2F3A2F] dark:text-[#fcf7ef] mb-1.5"
                >
                  Email
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="example@example.com"
                  disabled={isSubmitting}
                  className="w-full bg-[#fcf7ef] dark:bg-[#1a231a] border border-[#e8c14b] rounded-md px-3 py-2 font-body text-[14px] text-[#2F3A2F] dark:text-[#fcf7ef] placeholder:text-[#2F3A2F]/50 dark:placeholder:text-[#fcf7ef]/50 focus:outline-hidden focus:border-[#72a95c]"
                  autoComplete="email"
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
                !value
                  ? 'La contraseña es obligatoria.'
                  : value.length < 8
                  ? 'La contraseña debe contener al menos 8 caracteres.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block font-body text-[14px] font-semibold text-[#2F3A2F] dark:text-[#fcf7ef] mb-1.5"
                >
                  Contraseña (mínimo 8 caracteres)
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
                  autoComplete="new-password"
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
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-4 text-center font-body text-[13px] text-[#2F3A2F] dark:text-[#fcf7ef]">
          ¿Ya tienes una cuenta registrada?{' '}
          <Link
            to="/login"
            className="underline font-medium hover:text-[#743502] dark:hover:text-[#e8c14b]"
          >
            Inicia sesión acá
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
