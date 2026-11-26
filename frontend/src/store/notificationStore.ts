import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id'>) => string;
  removeNotification: (id: string) => void;
  showSuccess: (message: string, title?: string) => string;
  showError: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const duration = notification.duration ?? 3000;
    const newItem: NotificationItem = { ...notification, id, duration };

    set((state) => ({
      notifications: [...state.notifications, newItem],
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }

    return id;
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  showSuccess: (message, title = 'Éxito') =>
    get().addNotification({ type: 'success', message, title }),

  showError: (message, title = 'Error') =>
    get().addNotification({ type: 'error', message, title }),

  showInfo: (message, title = 'Información') =>
    get().addNotification({ type: 'info', message, title }),

  showWarning: (message, title = 'Atención') =>
    get().addNotification({ type: 'warning', message, title }),
}));
