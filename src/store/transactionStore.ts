import { create } from "zustand";
import {
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from "../types/pos";
import { getCartTotals } from "./cartStore";
import { useNotificationStore } from "./notificationStore";
import { useProductStore } from "./productStore";
import { useStockStore } from "./stockStore";
import { getLocalDateKey } from "../utils/date";
import { getNextOrderNumber } from "../utils/orderNumber";
import { canFulfillRecipes, getRecipeHpp } from "../utils/standardRecipe";
import { demoOrder } from "../data/demoData";

type TransactionState = {
  orders: Order[];
  canCompleteOrder: (items: CartItem[]) => boolean;
  completeOrder: (
    items: CartItem[],
    customer: string,
    paymentMethod: PaymentMethod,
    orderType: OrderType,
  ) => Order | null;
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
  orders: [demoOrder],
  canCompleteOrder: (items) => {
    if (!items.length) return false;
    const currentProducts = useProductStore.getState().products;
    if (
      items.some((item) => {
        const current = currentProducts.find(
          (product) => product.id === item.product.id,
        );
        return (
          !current ||
          !current.isAvailable ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
        );
      })
    )
      return false;
    const currentItems = items.map((item) => ({
      product: currentProducts.find(
        (product) => product.id === item.product.id,
      )!,
      quantity: item.quantity,
    }));
    const stockState = useStockStore.getState();
    return canFulfillRecipes(
      stockState.items,
      stockState.recipes,
      currentItems.map((item) => ({
        recipeId: item.product.recipeId,
        quantity: item.quantity,
      })),
    );
  },
  completeOrder: (items, customer, paymentMethod, orderType) => {
    if (!get().canCompleteOrder(items)) return null;
    const currentProducts = useProductStore.getState().products;
    if (
      !items.length ||
      items.some((item) => {
        const current = currentProducts.find(
          (product) => product.id === item.product.id,
        );
        return (
          !current ||
          !current.isAvailable ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
        );
      })
    )
      return null;
    const currentItems = items.map((item) => ({
      product: currentProducts.find(
        (product) => product.id === item.product.id,
      )!,
      quantity: item.quantity,
    }));
    const number = getNextOrderNumber(get().orders);
    const stockState = useStockStore.getState();
    const orderItems: OrderItem[] = currentItems.map((item) => ({
      ...item,
      hppPerPortion: getRecipeHpp(
        stockState.items,
        stockState.recipes.find(
          (recipe) => recipe.id === item.product.recipeId,
        ),
        stockState.recipes,
      ),
    }));
    if (
      !stockState.consumeForOrder(
        currentItems.map((item) => ({
          recipeId: item.product.recipeId,
          quantity: item.quantity,
        })),
        number,
      )
    )
      return null;
    const order: Order = {
      id: `o-${Date.now()}`,
      number,
      createdAt: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdOn: getLocalDateKey(),
      customer: customer || "Pelanggan umum",
      items: orderItems,
      preparedItemIds: [],
      status: "waiting",
      paymentMethod,
      orderType,
      total: getCartTotals(currentItems).subtotal,
    };
    set((state) => ({
      orders: [order, ...state.orders],
    }));
    useNotificationStore.getState().addNotification({
      id: `order-${order.id}`,
      title: "Pesanan baru masuk",
      message: `${order.number} · ${items.length} menu menunggu diproses`,
      time: order.createdAt,
    });
    return order;
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
