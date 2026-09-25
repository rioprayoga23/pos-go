export type InventoryCategory =
  | "Bubuk / Sachet"
  | "Bahan Minuman"
  | "Biji Kopi"
  | "Dairy / Susu"
  | "Kemasan"
  | "Es Batu"
  | "Lainnya";
export type HistoryFilter = "all" | "purchase" | "sale" | "correction";
export type ModalMode = "purchase" | "correction";
export type CorrectionDirection = "add" | "subtract";

export type StockItem = {
  id: string;
  name: string;
  description: string;
  category: InventoryCategory;
  stock: number;
  unit: string;
  estDays: string;
  avgPrice: number;
  initials: string;
};

export type StockMovement = {
  id: string;
  dateKey: string;
  time: string;
  itemId: string;
  item: string;
  category: InventoryCategory;
  type: Exclude<HistoryFilter, "all">;
  quantity: number;
  unit: string;
  note: string;
};

export type PurchaseDraft = {
  mode: "purchase";
  itemId: string;
  newItem?: { name: string; unit: string };
  quantity: number;
  priceMode: "unit" | "total";
  priceValue: number;
  fundingSource: "cash" | "transfer";
  time: string;
  note: string;
};

export type CorrectionDraft = {
  mode: "correction";
  itemId: string;
  direction: CorrectionDirection;
  quantity: number;
  reason: string;
  time: string;
  note: string;
};

export type StockDraft = PurchaseDraft | CorrectionDraft;
