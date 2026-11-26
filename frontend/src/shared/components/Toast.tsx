import React from 'react';
import { useNotificationStore, type NotificationType } from '@/store/notificationStore';

const toastStyles: Record<
  NotificationType,
  {
    bg: string;
    border: string;
    text: string;
    icon: string;
    badgeBg: string;
  }
> = {
  success: {
    bg: 'bg-[#eaf5de] dark:bg-[#1f2b1f]',
    border: 'border-[#72a95c]',
    text: 'text-[#2F3A2F] dark:text-[#eaf5de]',
    badgeBg: 'bg-[#72a95c] text-white',
    icon: '✓',
  },
  error: {
    bg: 'bg-[#fcf7ef] dark:bg-[#2b1b1b]',
    border: 'border-[#c94b43]',
    text: 'text-[#c94b43] dark:text-[#f7a49e]',
    badgeBg: 'bg-[#c94b43] text-white',
    icon: '✕',
  },
  warning: {
    bg: 'bg-[#fcf7ef] dark:bg-[#2e2918]',
    border: 'border-[#e8c14b]',
    text: 'text-[#743502] dark:text-[#f5d97f]',
    badgeBg: 'bg-[#e8c14b] text-[#2F3A2F]',
    icon: '⚠',
  },
  info: {
    bg: 'bg-[#eaf5de] dark:bg-[#1d261e]',
    border: 'border-[#743502] dark:border-[#72a95c]',
    text: 'text-[#2F3A2F] dark:text-[#eaf5de]',
    badgeBg: 'bg-[#743502] text-[#fcf7ef]',
    icon: 'ℹ',
  },
};

export const Toast: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    >
      {notifications.map((item) => {
        const style = toastStyles[item.type];
        return (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${style.bg} ${style.border}`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${style.badgeBg}`}
            >
              {style.icon}
            </span>
            <div className="flex-1 min-w-0">
              {item.title && (
                <h4 className="font-title2 font-bold text-sm leading-tight mb-0.5 text-[#2F3A2F] dark:text-[#fcf7ef]">
                  {item.title}
                </h4>
              )}
              <p className={`font-body text-xs leading-relaxed ${style.text}`}>
                {item.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeNotification(item.id)}
              className="text-[#2F3A2F]/50 dark:text-[#fcf7ef]/50 hover:text-[#2F3A2F] dark:hover:text-[#fcf7ef] transition-colors text-lg leading-none p-1 cursor-pointer"
              aria-label="Cerrar notificación"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
