import { create } from 'zustand';
import { categories as seedCategories, products as seedProducts } from '../data/dummy';
import { Category, Product } from '../types/pos';

type ProductState = {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'count'>) => void;
};

const syncCounts = (items: Product[], currentCategories: Category[]) => currentCategories.map((category) => category.id === 'all' ? { ...category, count: items.length } : { ...category, count: items.filter((item) => item.categoryId === category.id).length });

export const useProductStore = create<ProductState>((set) => ({
  products: seedProducts,
  categories: seedCategories,
  addProduct: (product) => set((state) => { const products = [...state.products, { ...product, id: `p-${Date.now()}` }]; return { products, categories: syncCounts(products, state.categories) }; }),
  updateProduct: (id, product) => set((state) => { const products = state.products.map((item) => item.id === id ? { ...item, ...product } : item); return { products, categories: syncCounts(products, state.categories) }; }),
  deleteProduct: (id) => set((state) => { const products = state.products.filter((item) => item.id !== id); return { products, categories: syncCounts(products, state.categories) }; }),
  addCategory: (category) => set((state) => ({ categories: [...state.categories, { ...category, id: `category-${Date.now()}`, count: 0 }] })),
}));
