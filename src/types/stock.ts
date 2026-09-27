export type HistoryFilter = "all" | "purchase" | "correction" | "sale";

export type StockItem = {
  id: string;
  name: string;
  description: string;
  stock: number;
  /** Unit used by formulas and the stock ledger (for example, ml). */
  unit: string;
  /** Unit used for supplier purchases, such as galon. Defaults to `unit`. */
  purchaseUnit?: string;
  /** How many stock units are in one purchase unit. Defaults to 1. */
  stockUnitsPerPurchaseUnit?: number;
  /** Weighted-average cost per stock unit. Fractional rupiah is retained for HPP. */
  avgPrice: number;
};

export type RecipeKind = "base" | "menu";

export type RecipeIngredient =
  | { type: "stock"; itemId: string; quantity: number }
  | { type: "base"; recipeId: string; quantity: number };

export type Recipe = {
  id: string;
  name: string;
  kind: RecipeKind;
  ingredients: RecipeIngredient[];
};

export type StockPurchaseDetail = {
  quantity: number;
  unit: string;
  totalCostRupiah: number;
};

export type StockMovement = {
  id: string;
  dateKey: string;
  time: string;
  itemId: string;
  item: string;
  type: Exclude<HistoryFilter, "all">;
  quantity: number;
  unit: string;
  note: string;
  purchase?: StockPurchaseDetail;
};
