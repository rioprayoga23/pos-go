import type { StockItemDraft } from "./api";

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
  newItem?: StockItemDraft;
  /** Count in purchase units (for example, 1 galon). */
  quantity: number;
  totalCost: number;
};
