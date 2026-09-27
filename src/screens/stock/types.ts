export type {
  HistoryFilter,
  StockItem,
  StockMovement,
  StockPurchaseDetail,
} from "../../types/stock";

export type ModalMode = "purchase";

export type PurchaseDraft = {
  mode: "purchase";
  itemId: string;
  newItem?: { name: string; unit: string };
  /** Count in purchase units (for example, 1 galon). */
  quantity: number;
  totalCost: number;
};
