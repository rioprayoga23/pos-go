import { create } from 'zustand';
import type { Category, Product } from '../types/pos';
import type { Recipe, StockItem } from '../types/stock';
import { demoCategories, demoProduct } from '../data/demoData';
import { getAvailablePortions } from '../utils/standardRecipe';
import { useCartStore } from './cartStore';
import { useStockStore } from './stockStore';

type ProductState = {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id' | 'stock'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'count'>) => void;
  deleteRecipe: (id: string) => boolean;
  syncInventory: (items: StockItem[], recipes: Recipe[]) => void;
};

const syncCounts = (items: Product[], currentCategories: Category[]) => currentCategories.map((category) => category.id === 'all' ? { ...category, count: items.length } : { ...category, count: items.filter((item) => item.categoryId === category.id).length });
const availableFor = (product: Pick<Product, 'recipeId'>, items: StockItem[], recipes: Recipe[]) =>
  getAvailablePortions(items, recipes.find((recipe) => recipe.id === product.recipeId), recipes);
let nextProductId = 0;

export const useProductStore = create<ProductState>((set, get) => ({
  products: [demoProduct],
  categories: demoCategories,
  addProduct: (product) => set((state) => {
    const inventory = useStockStore.getState();
    const products = [...state.products, {
      ...product,
      stock: availableFor(product, inventory.items, inventory.recipes),
      id: `p-${Date.now()}-${++nextProductId}`,
    }];
    return { products, categories: syncCounts(products, state.categories) };
  }),
  updateProduct: (id, product) => {
    set((state) => {
      const inventory = useStockStore.getState();
      const products = state.products.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...product };
        return { ...updated, stock: availableFor(updated, inventory.items, inventory.recipes) };
      });
      return { products, categories: syncCounts(products, state.categories) };
    });
    const updatedProduct = get().products.find((item) => item.id === id);
    if (updatedProduct) useCartStore.getState().syncProduct(updatedProduct);
    useCartStore.getState().reconcileInventory(get().products);
  },
  deleteProduct: (id) => {
    set((state) => { const products = state.products.filter((item) => item.id !== id); return { products, categories: syncCounts(products, state.categories) }; });
    useCartStore.getState().removeItem(id);
  },
  addCategory: (category) => set((state) => ({ categories: [...state.categories, { ...category, id: `category-${Date.now()}`, count: 0 }] })),
  deleteRecipe: (id) => {
    if (get().products.some((product) => product.recipeId === id)) return false;
    return useStockStore.getState().deleteRecipe(id);
  },
  syncInventory: (items, recipes) => {
    set((state) => ({
      products: state.products.map((product) => ({ ...product, stock: availableFor(product, items, recipes) })),
    }));
    useCartStore.getState().reconcileInventory(get().products);
  },
}));

useStockStore.subscribe((state, previous) => {
  if (state.items !== previous.items || state.recipes !== previous.recipes) {
    useProductStore.getState().syncInventory(state.items, state.recipes);
  }
});
