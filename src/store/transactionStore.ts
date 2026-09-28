import { create } from "zustand";
import { Order } from "../types/pos";
import { useNotificationStore } from "./notificationStore";

type TransactionState = {
  orders: Order[];
  addCreatedOrder: (order: Order) => void;
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  orders: [],
  addCreatedOrder: (order) => {
    if (get().orders.some((entry) => entry.id === order.id)) return;
    set((state) => ({ orders: [order, ...state.orders] }));
    useNotificationStore.getState().addNotification({
      id: `order-${order.id}`,
      title: "Pesanan baru masuk",
      message: `${order.number} · ${order.items.length} menu menunggu diproses`,
      time: order.createdAt,
    });
  },
}));
