import { create } from "zustand";
import { Order, OrderStatus } from "../types/pos";
import { useNotificationStore } from "./notificationStore";

type TransactionState = {
  orders: Order[];
  addCreatedOrder: (order: Order) => void;
  advanceStatus: (id: string) => void;
  togglePreparedItem: (orderId: string, productId: string) => void;
};

const nextStatus: Record<OrderStatus, OrderStatus> = {
  waiting: "preparing",
  preparing: "ready",
  ready: "completed",
  completed: "completed",
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
  advanceStatus: (id) =>
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== id) return order;
        if (
          order.status === "preparing" &&
          order.items.some(
            (item) => !(order.preparedItemIds ?? []).includes(item.product.id),
          )
        )
          return order;
        return { ...order, status: nextStatus[order.status] };
      }),
    })),
  togglePreparedItem: (orderId, productId) =>
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId || order.status !== "preparing") return order;
        const preparedItemIds = order.preparedItemIds ?? [];
        return {
          ...order,
          preparedItemIds: preparedItemIds.includes(productId)
            ? preparedItemIds.filter((id) => id !== productId)
            : [...preparedItemIds, productId],
        };
      }),
    })),
}));
