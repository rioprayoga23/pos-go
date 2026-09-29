import { create } from "zustand";
import { CartItem, OrderType, Product } from "../types/pos";
import { getCartSubtotal } from "../utils/cartPricing";
import { getRequiredStock } from "../utils/standardRecipe";
import { useStockStore } from "./stockStore";

type CartState = {
  items: CartItem[];
  orderType: OrderType;
  addItem: (product: Product) => void;
  syncProduct: (product: Product) => void;
  reconcileInventory: (products: Product[]) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  setOrderType: (type: CartState["orderType"]) => void;
  clearCart: () => void;
};

function maxAdditionalPortions(items: CartItem[], product: Product): number {
  if (!product.isAvailable) return 0;
  const inventory = useStockStore.getState();
  const recipe = inventory.recipes.find((entry) => entry.id === product.recipeId);
  if (!recipe) {
    const inCart = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
    return Math.max(0, product.stock - inCart);
  }
  if (recipe.kind !== "menu" || !recipe.ingredients.length) return 0;
  const used = items.length
    ? getRequiredStock(items.map((item) => ({ recipeId: item.product.recipeId, quantity: item.quantity })), inventory.recipes)
    : new Map<string, number>();
  if (!used) return 0;
  const stockById = new Map(inventory.items.map((item) => [item.id, item.stock]));
  const onePortion = getRequiredStock([{ recipeId: recipe.id, quantity: 1 }], inventory.recipes);
  if (!onePortion) return 0;
  return Math.max(0, Math.min(...[...onePortion].map(([itemId, quantity]) =>
    Math.floor(((stockById.get(itemId) ?? 0) - (used.get(itemId) ?? 0)) / quantity),
  )));
}

export function canAddToCart(items: CartItem[], product: Product): boolean {
  return maxAdditionalPortions(items, product) >= 1;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  orderType: "Dine in",
  addItem: (product) =>
    set((state) => {
      const found = state.items.find((item) => item.product.id === product.id);
      if (!canAddToCart(state.items, product)) return state;
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
  syncProduct: (product) =>
    set((state) => ({
      items: state.items.flatMap((item) => {
        if (item.product.id !== product.id) return [item];
        if (!product.isAvailable || product.stock <= 0) return [];
        return [{ ...item, product, quantity: Math.min(item.quantity, product.stock) }];
      }),
    })),
  reconcileInventory: (products) =>
    set((state) => {
      const byId = new Map(products.map((product) => [product.id, product]));
      const items: CartItem[] = [];
      for (const item of state.items) {
        const product = byId.get(item.product.id);
        if (!product?.isAvailable) continue;
        const quantity = Math.min(item.quantity, maxAdditionalPortions(items, product));
        if (quantity > 0) items.push({ product, quantity });
      }
      return {
        items,
      };
    }),
  setQuantity: (productId, quantity) =>
    set((state) => {
      if (!Number.isFinite(quantity)) return state;
      const current = state.items.find((item) => item.product.id === productId);
      if (!current) return state;
      const others = state.items.filter((item) => item.product.id !== productId);
      const nextQuantity = Math.min(Math.floor(quantity), maxAdditionalPortions(others, current.product));
      return { items: nextQuantity > 0
        ? state.items.map((item) => item.product.id === productId ? { ...item, quantity: nextQuantity } : item)
        : others };
    }),
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
