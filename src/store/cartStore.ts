import { create } from "zustand";
import { products } from "../data/dummy";
import { CartItem, Product } from "../types/pos";
import { getCartSubtotal } from "../utils/cartPricing";

type CartState = {
  items: CartItem[];
  orderType: "Dine in" | "Take away";
  addItem: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  setOrderType: (type: CartState["orderType"]) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [
    { product: products[1], quantity: 2 },
    { product: products[0], quantity: 1 },
    { product: products[4], quantity: 1 },
  ],
  orderType: "Dine in",
  addItem: (product) =>
    set((state) => {
      const found = state.items.find((item) => item.product.id === product.id);
      if (found)
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      return { items: [...state.items, { product, quantity: 1 }] };
    }),
  setQuantity: (productId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.product.id !== productId)
          : state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item,
            ),
    })),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    })),
  setOrderType: (orderType) => set({ orderType }),
  clearCart: () => set({ items: [] }),
}));

export const getCartTotals = (items: CartItem[]) => {
  return { subtotal: getCartSubtotal(items) };
};
