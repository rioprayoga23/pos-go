export type { HistoryFilter, StockItem, StockMovement } from "../../types/stock";

export type ModalMode = "purchase" | "correction";

export type PurchaseDraft = {
  mode: "purchase";
  itemId: string;
  newItem?: { name: string; unit: string };
  /** Count in purchase units (for example, 1 galon). */
  quantity: number;
  totalCost: number;
  fundingSource: "cash" | "transfer";
};

export type CorrectionDraft = {
  mode: "correction";
  itemId: string;
  actualStock: number;
  /** Cost for one purchase unit, converted to stock-unit cost when saved. */
  purchaseUnitPrice: number;
  reason: string;
  note: string;
};

export type StockDraft = PurchaseDraft | CorrectionDraft;
