import { create } from 'zustand';

export type PosNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

type NotificationState = {
  notifications: PosNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<PosNotification, 'unread'>) => void;
};

const initialNotifications: PosNotification[] = [
  {
    id: 'order-o-a044',
    title: 'Pesanan baru masuk',
    message: '#A-044 · 2 menu menunggu diproses',
    time: '14:24',
    unread: true,
  },
  {
    id: 'order-o-a041',
    title: 'Pesanan sedang dibuat',
    message: '#A-041 · 1 dari 2 menu selesai dibuat',
    time: '14:18',
    unread: true,
  },
  {
    id: 'order-o-a039',
    title: 'Pesanan siap disajikan',
    message: '#A-039 · Pesanan siap diambil pelanggan',
    time: '14:10',
    unread: true,
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: initialNotifications,
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification,
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.unread ? { ...notification, unread: false } : notification,
      ),
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [{ ...notification, unread: true }, ...state.notifications].slice(0, 50),
    })),
}));
