import { Category, DailySummary, Order, Product } from '../types/pos';

export const categories: Category[] = [
  { id: 'all', name: 'Semua', count: 24, tint: '#2563EB' },
  { id: 'coffee', name: 'Signature Coffee', count: 8, tint: '#F2F4F6' },
  { id: 'boba', name: 'Boba & Milk Tea', count: 6, tint: '#F2F4F6' },
  { id: 'tea', name: 'Artisan Tea & Fruit', count: 5, tint: '#F2F4F6' },
  { id: 'non-coffee', name: 'Smoothies', count: 3, tint: '#F2F4F6' },
  { id: 'snacks', name: 'Snacks & Pastry', count: 2, tint: '#F2F4F6' },
];

export const products: Product[] = [
  { id: 'p-01', name: 'Kopi Susu Gula Aren', categoryId: 'coffee', categoryName: 'Signature Coffee', price: 22000, stock: 48, description: 'Double espresso, aren organik & susu segar', isAvailable: true, accent: '#9A6B48', icon: 'coffee-outline', image: require('../../assets/stitch/order/kopi-susu.png') },
  { id: 'p-02', name: 'Brown Sugar Boba Milk', categoryId: 'boba', categoryName: 'Boba & Milk Tea', price: 28000, stock: 35, description: 'Boba kenyal & sirup karamel brown sugar', isAvailable: true, accent: '#B77949', icon: 'cup', image: require('../../assets/stitch/order/brown-sugar.png') },
  { id: 'p-03', name: 'Matcha Latte Espresso', categoryId: 'non-coffee', categoryName: 'Non-Coffee', price: 30000, stock: 22, description: 'Uji matcha otentik & espresso blend', isAvailable: true, accent: '#6A9B63', icon: 'leaf', image: require('../../assets/stitch/order/matcha.png') },
  { id: 'p-04', name: 'Salted Caramel Macchiato', categoryId: 'coffee', categoryName: 'Signature Coffee', price: 32000, stock: 19, description: 'Sea salt vanilla foam & shot karamel', isAvailable: true, accent: '#C48A45', icon: 'coffee-maker-outline', image: require('../../assets/stitch/order/salted-caramel.png') },
  { id: 'p-05', name: 'Jasmine Peach Sparkling', categoryId: 'tea', categoryName: 'Artisan Tea & Fruit', price: 24000, stock: 40, description: 'Teh melati cold-brew & buah persik segar', isAvailable: true, accent: '#E39B73', icon: 'cup-water', image: require('../../assets/stitch/order/jasmine.png') },
  { id: 'p-06', name: 'Mango Coconut Freeze', categoryId: 'non-coffee', categoryName: 'Non-Coffee', price: 29000, stock: 16, description: 'Mangga segar blend dengan santan kelapa', isAvailable: true, accent: '#E6A52C', icon: 'fruit-cherries', image: require('../../assets/stitch/order/mango.png') },
  { id: 'p-07', name: 'Roasted Hojicha Boba', categoryId: 'boba', categoryName: 'Boba & Milk Tea', price: 27000, stock: 27, description: 'Teh hijau panggang Kyoto & boba kenyal', isAvailable: true, accent: '#9B7556', icon: 'cup-outline', image: require('../../assets/stitch/order/hojicha.png') },
  { id: 'p-08', name: 'Caffe Americano', categoryId: 'coffee', categoryName: 'Signature Coffee', price: 18000, stock: 85, description: 'Double shot espresso arabika Gayo murni', isAvailable: true, accent: '#765442', icon: 'coffee-outline', image: require('../../assets/stitch/order/americano.png') },
  { id: 'p-09', name: 'Taro Cheese Velvet', categoryId: 'boba', categoryName: 'Boba & Milk Tea', price: 28000, stock: 14, description: 'Taro creamy dengan salted cream cheese', isAvailable: true, accent: '#9A78B8', icon: 'cup-outline', image: require('../../assets/stitch/order/taro.png') },
  { id: 'p-10', name: 'Strawberry Lychee Tea', categoryId: 'tea', categoryName: 'Artisan Tea & Fruit', price: 26000, stock: 85, description: 'Strawberry, lychee, jasmine tea', isAvailable: true, accent: '#D87587', icon: 'fruit-strawberry' },
  { id: 'p-11', name: 'Hojicha Cream Cloud', categoryId: 'non-coffee', categoryName: 'Non-Coffee', price: 29000, stock: 85, description: 'Hojicha cream cold foam', isAvailable: true, accent: '#B58163', icon: 'cup' },
  { id: 'p-12', name: 'Espresso Double', categoryId: 'coffee', categoryName: 'Signature Coffee', price: 20000, stock: 0, description: 'Double shot espresso', isAvailable: false, accent: '#694B3B', icon: 'coffee-outline' },
];

const orderItems = (ids: [string, number][]): Order['items'] => ids.map(([id, quantity]) => ({ product: products.find((product) => product.id === id)!, quantity }));

export const orders: Order[] = [
  { id: 'o-a044', number: '#A-044', createdAt: '14:24', createdOn: '2024-10-24', customer: 'Pelanggan umum', items: orderItems([['p-02', 2], ['p-01', 1]]), status: 'waiting', paymentMethod: 'QRIS', total: 78000 },
  { id: 'o-a041', number: '#A-041', createdAt: '14:18', createdOn: '2024-10-24', customer: 'Meja 04', items: orderItems([['p-03', 1], ['p-05', 1]]), preparedItemIds: ['p-03'], status: 'preparing', paymentMethod: 'Tunai', total: 54000 },
  { id: 'o-a039', number: '#A-039', createdAt: '14:10', createdOn: '2024-10-24', customer: 'Rani', items: orderItems([['p-06', 1], ['p-07', 1]]), status: 'ready', paymentMethod: 'QRIS', total: 56000 },
  { id: 'o-a040', number: '#A-040', createdAt: '14:05', createdOn: '2024-10-24', customer: 'Bagas', items: orderItems([['p-08', 1]]), status: 'completed', paymentMethod: 'QRIS', total: 18000 },
  { id: 'o-a038', number: '#A-038', createdAt: '13:58', createdOn: '2024-10-24', customer: 'Meja 02', items: orderItems([['p-04', 1]]), status: 'completed', paymentMethod: 'Tunai', total: 32000 },
  { id: 'o-a037', number: '#A-037', createdAt: '13:52', createdOn: '2024-10-24', customer: 'Dimas', items: orderItems([['p-05', 1], ['p-09', 1]]), status: 'completed', paymentMethod: 'QRIS', total: 52000 },
];

export const dailySummary: DailySummary = {
  revenue: 3420000,
  orders: 58,
  averageOrder: 58965,
  cashOnHand: 950000,
};
