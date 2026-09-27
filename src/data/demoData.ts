import type { Category, Order, Product } from "../types/pos";
import type { StockMovement } from "../types/stock";
import type { PosNotification } from "../store/notificationStore";
import { colors } from "../theme";
import {
  defaultBaseRecipe,
  defaultRecipe,
  defaultRecipeId,
  getAvailablePortions,
  getRecipeHpp,
  initialRecipeItems,
} from "../utils/standardRecipe";
import { getLocalDateKey } from "../utils/date";

const demoDate = new Date();
export const demoDateKey = getLocalDateKey(demoDate);
export const demoTime = demoDate.toLocaleTimeString("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

export const demoProduct: Product = {
  id: "p-1001",
  name: "Matcha Latte",
  recipeId: defaultRecipeId,
  categoryId: "minuman",
  categoryName: "Minuman",
  price: 22000,
  stock: getAvailablePortions(initialRecipeItems, defaultRecipe, [defaultBaseRecipe, defaultRecipe]),
  description: "Matcha Latte botol",
  isAvailable: true,
  accent: colors.cyan,
  icon: "cup-outline",
};

export const demoCategories: Category[] = [
  { id: "all", name: "Semua", count: 1, tint: colors.primary },
  { id: "minuman", name: "Minuman", count: 1, tint: colors.cyan },
];

export const demoOrder: Order = {
  id: "demo-order-001",
  number: "#001",
  createdAt: demoTime,
  createdOn: demoDateKey,
  customer: "Pelanggan Demo",
  items: [{
    product: demoProduct,
    quantity: 1,
    hppPerPortion: getRecipeHpp(initialRecipeItems, defaultRecipe, [defaultBaseRecipe, defaultRecipe]),
  }],
  preparedItemIds: [],
  status: "waiting",
  paymentMethod: "QRIS",
  orderType: "Take away",
  total: demoProduct.price,
};

export const demoStockMovements: StockMovement[] = [
  {
    id: "demo-stock-movement-001",
    dateKey: demoDateKey,
    time: `Hari ini, ${demoTime} WIB`,
    itemId: "recipe-powder-matcha",
    item: "Bubuk Matcha",
    type: "purchase",
    quantity: 10,
    unit: "sachet",
    note: "Pembelian contoh · Transfer · Rp 65.000",
  },
];

export const demoNotifications: PosNotification[] = [
  {
    id: "demo-order-notification-001",
    title: "Pesanan baru masuk",
    message: "#001 · 1 menu menunggu diproses",
    time: demoTime,
    unread: true,
  },
];
