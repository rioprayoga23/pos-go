import { ImageSourcePropType } from 'react-native';

export type PaymentMethod = 'QRIS' | 'Tunai';
export type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'completed';
export type OrderType = 'Dine in' | 'Take away';

export type Category = {
  id: string;
  name: string;
  count: number;
  tint: string;
};

export type Product = {
  id: string;
  name: string;
  recipeId: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
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
  orderType: OrderType;
  total: number;
};
