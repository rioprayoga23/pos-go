import { create } from 'zustand';
import { demoNotifications } from '../data/demoData';

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

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: demoNotifications,
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
