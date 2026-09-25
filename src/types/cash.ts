export type CashCategoryKind = "stock_purchase" | "operational";
export type CashFundingSource = "cash" | "transfer";

export type CashTransaction = {
  id: string;
  dateKey: string;
  time: string;
  description: string;
  detail: string;
  categoryKind: CashCategoryKind;
  category: string;
  source: CashFundingSource;
  amount: number;
};

export type NewOperationalExpense = {
  dateKey: string;
  time: string;
  description: string;
  detail: string;
  category: string;
  source: CashFundingSource;
  amount: number;
};
