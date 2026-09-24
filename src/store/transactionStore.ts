import { create } from 'zustand';
import { orders as seedOrders } from '../data/dummy';
import { CartItem, Order, OrderStatus, PaymentMethod } from '../types/pos';
import { getCartTotals } from './cartStore';
import { useNotificationStore } from './notificationStore';
import { getLocalDateKey } from '../utils/date';

type TransactionState = {
  orders: Order[];
  openingCash: number | null;
  cashSalesInShift: number;
  lastShiftReport: {
    openingCash: number;
    cashSales: number;
    expectedCash: number;
    countedCash: number;
    difference: number;
    closedOn: string;
  } | null;
  setOpeningCash: (amount: number) => void;
  completeOrder: (items: CartItem[], customer: string, paymentMethod: PaymentMethod) => Order;
  advanceStatus: (id: string) => void;
  togglePreparedItem: (orderId: string, productId: string) => void;
  closeShift: (countedCash: number) => void;
};

const nextStatus: Record<OrderStatus, OrderStatus> = { waiting: 'preparing', preparing: 'ready', ready: 'completed', completed: 'completed' };

export const useTransactionStore = create<TransactionState>((set, get) => ({
  orders: seedOrders,
  openingCash: null,
  cashSalesInShift: 0,
  lastShiftReport: null,
  setOpeningCash: (amount) => {
    if (Number.isFinite(amount) && amount >= 0) {
      set((state) => state.openingCash === null ? { openingCash: amount } : state);
    }
  },
  completeOrder: (items, customer, paymentMethod) => {
    const highestOrder = get().orders.reduce((highest, order) => {
      const numeric = Number(order.number.replace(/\D/g, ''));
      return Math.max(highest, Number.isFinite(numeric) ? numeric : 0);
    }, 42);
    const order: Order = {
      id: `o-${Date.now()}`,
      number: `#A-${String(highestOrder + 1).padStart(3, '0')}`,
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      createdOn: getLocalDateKey(),
      customer: customer || 'Pelanggan umum',
      items,
      preparedItemIds: [],
      status: 'waiting',
      paymentMethod,
      total: getCartTotals(items).subtotal,
    };
    set((state) => ({
      orders: [order, ...state.orders],
      cashSalesInShift: state.cashSalesInShift + (paymentMethod === 'Tunai' ? order.total : 0),
    }));
    useNotificationStore.getState().addNotification({
      id: `order-${order.id}`,
      title: 'Pesanan baru masuk',
      message: `${order.number} · ${items.length} menu menunggu diproses`,
      time: order.createdAt,
    });
    return order;
  },
  advanceStatus: (id) => set((state) => ({ orders: state.orders.map((order) => {
    if (order.id !== id) return order;
    if (order.status === 'preparing' && order.items.some((item) => !(order.preparedItemIds ?? []).includes(item.product.id))) return order;
    return { ...order, status: nextStatus[order.status] };
  }) })),
  togglePreparedItem: (orderId, productId) => set((state) => ({ orders: state.orders.map((order) => {
    if (order.id !== orderId || order.status !== 'preparing') return order;
    const preparedItemIds = order.preparedItemIds ?? [];
    return {
      ...order,
      preparedItemIds: preparedItemIds.includes(productId)
        ? preparedItemIds.filter((id) => id !== productId)
        : [...preparedItemIds, productId],
    };
  }) })),
  closeShift: (countedCash) => {
    if (!Number.isFinite(countedCash) || countedCash < 0) return;
    set((state) => {
      const openingCash = state.openingCash ?? 0;
      const expectedCash = openingCash + state.cashSalesInShift;
      return {
        orders: state.orders.map((order) => order.status === 'ready' ? { ...order, status: 'completed' } : order),
        lastShiftReport: {
          openingCash,
          cashSales: state.cashSalesInShift,
          expectedCash,
          countedCash,
          difference: countedCash - expectedCash,
          closedOn: getLocalDateKey(),
        },
        openingCash: null,
        cashSalesInShift: 0,
      };
    });
  },
}));
