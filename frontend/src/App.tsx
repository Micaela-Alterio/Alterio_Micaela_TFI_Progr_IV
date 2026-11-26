import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AppRouter } from '@/routes/AppRouter';
import { Toast } from '@/shared/components/Toast';

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}
