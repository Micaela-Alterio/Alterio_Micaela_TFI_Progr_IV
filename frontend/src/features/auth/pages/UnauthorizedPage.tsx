import React from 'react';
import { Link } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="bg-[#fcf7ef] dark:bg-[#232c23] rounded-2xl border border-[#c94b43]/30 shadow-lg max-w-md w-full p-8 text-center animate-in fade-in duration-150">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c94b43]/15 flex items-center justify-center text-3xl">
          🚫
        </div>

        <h1 className="font-title1 text-3xl text-[#c94b43] mb-2 tracking-wide">
          Acceso Denegado
        </h1>

        <p className="font-body text-sm text-[#2F3A2F]/80 dark:text-[#fcf7ef]/80 mb-6 leading-relaxed">
          No tienes los permisos requeridos para acceder a esta sección. Esta ruta está reservada exclusivamente para el personal administrador.
        </p>

        <Link
          to="/"
          className="inline-block bg-[#743502] hover:bg-[#562702] text-[#fcf7ef] font-bold px-6 py-2.5 rounded-lg transition-colors font-title2 text-sm shadow-xs"
        >
          Volver al Catálogo
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
