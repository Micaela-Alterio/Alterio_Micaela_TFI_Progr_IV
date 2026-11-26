import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

const currentYear = new Date().getFullYear();

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4] dark:bg-[#1a231a] text-[#2F3A2F] dark:text-[#fcf7ef] transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-5 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-[#eaf5de] dark:border-[#334233] py-6 text-center text-xs text-[#2F3A2F]/60 dark:text-[#fcf7ef]/60 font-body">
        <p>
          &copy; {currentYear} Veggie Food Store - Trabajo Práctico Integrador Programación IV
        </p>
      </footer>
    </div>
  );
};

export default MainLayout;
