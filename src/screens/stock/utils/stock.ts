import type { StockItem } from "../types";

export const isLowStock = (item: StockItem) => item.stock <= 12;

export const getPurchaseUnit = (item: StockItem) => item.purchaseUnit ?? item.unit;

export const getStockUnitsPerPurchaseUnit = (item: StockItem) => {
  const conversion = item.stockUnitsPerPurchaseUnit ?? 1;
  return Number.isSafeInteger(conversion) && conversion > 0 ? conversion : 1;
};

export const getPurchaseUnitPrice = (item: StockItem) =>
  item.avgPrice * getStockUnitsPerPurchaseUnit(item);
