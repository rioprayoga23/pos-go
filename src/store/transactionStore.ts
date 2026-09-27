import { create } from 'zustand';
import { CartItem, Order, OrderStatus, OrderType, PaymentMethod } from '../types/pos';
import { getCartTotals } from './cartStore';
import { useNotificationStore } from './notificationStore';
import { useProductStore } from './productStore';
import { useStockStore } from './stockStore';
import { getLocalDateKey } from '../utils/date';
import { getNextOrderNumber } from '../utils/orderNumber';

type TransactionState = {
  orders: Order[];
  openingCash: number | null;
  openingCashDefault: number;
  cashRegisterOpenedOn: string | null;
  cashRegisterOpenedAt: string | null;
  cashRegisterClosedOn: string | null;
  cashSalesInShift: number;
  cashOutflowsInShift: number;
  lastShiftReport: {
    openingCash: number;
    cashSales: number;
    cashOutflows: number;
    expectedCash: number;
    countedCash: number;
    difference: number;
    closedOn: string;
  } | null;
  openCashRegister: (amount: number) => boolean;
  isCashRegisterOpen: () => boolean;
  isCashRegisterClosedToday: () => boolean;
  getExpectedCash: () => number;
  recordCashOutflow: (amount: number) => boolean;
  completeOrder: (items: CartItem[], customer: string, paymentMethod: PaymentMethod, orderType: OrderType) => Order | null;
  advanceStatus: (id: string) => void;
  togglePreparedItem: (orderId: string, productId: string) => void;
  closeShift: (countedCash: number) => void;
};

const nextStatus: Record<OrderStatus, OrderStatus> = { waiting: 'preparing', preparing: 'ready', ready: 'completed', completed: 'completed' };

export const useTransactionStore = create<TransactionState>((set, get) => ({
  orders: [],
  openingCash: null,
  openingCashDefault: 100_000,
  cashRegisterOpenedOn: null,
  cashRegisterOpenedAt: null,
  cashRegisterClosedOn: null,
  cashSalesInShift: 0,
  cashOutflowsInShift: 0,
  lastShiftReport: null,
  openCashRegister: (amount) => {
    if (!Number.isFinite(amount) || amount < 0 || get().isCashRegisterOpen()) return false;
    const today = getLocalDateKey();
    if (get().cashRegisterClosedOn === today) return false;
    set({
      openingCash: amount,
      cashRegisterOpenedOn: today,
      cashRegisterOpenedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      cashSalesInShift: 0,
      cashOutflowsInShift: 0,
    });
    return true;
  },
  isCashRegisterOpen: () => {
    const state = get();
    const today = getLocalDateKey();
    return state.openingCash !== null &&
      state.cashRegisterOpenedOn === today &&
      state.cashRegisterClosedOn !== today;
  },
  isCashRegisterClosedToday: () => get().cashRegisterClosedOn === getLocalDateKey(),
  getExpectedCash: () => {
    const state = get();
    return (state.openingCash ?? 0) + state.cashSalesInShift - state.cashOutflowsInShift;
  },
  recordCashOutflow: (amount) => {
    if (!Number.isFinite(amount) || amount <= 0 || !get().isCashRegisterOpen()) return false;
    const state = get();
    const expectedCash = (state.openingCash ?? 0) + state.cashSalesInShift - state.cashOutflowsInShift;
    if (amount > expectedCash) return false;
    set((state) => ({ cashOutflowsInShift: state.cashOutflowsInShift + amount }));
    return true;
  },
  completeOrder: (items, customer, paymentMethod, orderType) => {
    if (!get().isCashRegisterOpen()) return null;
    const currentProducts = useProductStore.getState().products;
    if (!items.length || items.some((item) => {
      const current = currentProducts.find((product) => product.id === item.product.id);
      return !current || !current.isAvailable || !Number.isInteger(item.quantity) || item.quantity <= 0;
    })) return null;
    const currentItems = items.map((item) => ({
      product: currentProducts.find((product) => product.id === item.product.id)!,
      quantity: item.quantity,
    }));
    const number = getNextOrderNumber(get().orders);
    if (!useStockStore.getState().consumeForOrder(
      currentItems.map((item) => ({ recipeId: item.product.recipeId, quantity: item.quantity })), number,
    )) return null;
    const order: Order = {
      id: `o-${Date.now()}`,
      number,
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      createdOn: getLocalDateKey(),
      customer: customer || 'Pelanggan umum',
      items: currentItems,
      preparedItemIds: [],
      status: 'waiting',
      paymentMethod,
      orderType,
      total: getCartTotals(currentItems).subtotal,
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
    if (!Number.isFinite(countedCash) || countedCash < 0 || !get().isCashRegisterOpen()) return;
    set((state) => {
      const openingCash = state.openingCash ?? 0;
      const cashOutflows = state.cashOutflowsInShift;
      const expectedCash = openingCash + state.cashSalesInShift - cashOutflows;
      return {
        lastShiftReport: {
          openingCash,
          cashSales: state.cashSalesInShift,
          cashOutflows,
          expectedCash,
          countedCash,
          difference: countedCash - expectedCash,
          closedOn: getLocalDateKey(),
        },
        openingCash: null,
        cashRegisterClosedOn: getLocalDateKey(),
        cashSalesInShift: 0,
        cashOutflowsInShift: 0,
      };
    });
  },
}));
