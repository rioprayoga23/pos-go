import { ImageSourcePropType } from 'react-native';

export type PaymentMethod = 'QRIS' | 'Tunai';
export type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'completed';

export type Category = {
  id: string;
  name: string;
  count: number;
  tint: string;
};

export type HppComponent = {
  id: string;
  name: string;
  detail: string;
  icon: string;
  cost: number;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  hpp?: number;
  hppComponents?: HppComponent[];
  description: string;
  isAvailable: boolean;
  accent: string;
  icon: string;
  image?: ImageSourcePropType;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  number: string;
  createdAt: string;
  createdOn?: string;
  customer: string;
  items: CartItem[];
  preparedItemIds?: string[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
};

export type DailySummary = {
  revenue: number;
  orders: number;
  averageOrder: number;
  cashOnHand: number;
};
