import type { StockItem } from "../types";

export const isLowStock = (item: StockItem) => item.stock <= 12;
