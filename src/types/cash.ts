export type CashCategoryKind = "stock_purchase" | "operational";
export type CashFundingSource = "cash_drawer" | "external_transfer";
export type CashTransaction = {
  id: string;
  dateKey: string;
  time: string;
  description: string;
  detail: string;
  categoryKind: CashCategoryKind;
  category: string;
  amount: number;
  fundingSource?: CashFundingSource;
};

export type CashRegisterStatus = "not_opened" | "open" | "closed_today";

export type CashRegister = {
  id?: string;
  status: CashRegisterStatus;
  businessDate?: string;
  openingAmountRupiah: number;
  cashSalesRupiah: number;
  cashOutflowsRupiah: number;
  expectedAmountRupiah: number;
  countedAmountRupiah?: number;
  differenceRupiah?: number;
  openedAt?: string;
  closedAt?: string;
};

export type CashOutflowSummary = {
  stockAmount: number;
  stockCount: number;
  operationalAmount: number;
  operationalCount: number;
};

export type CashOutflowFilters = {
  search?: string;
  category?: CashCategoryKind | "all";
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type CashExpenseDraft = {
  description: string;
  note?: string;
  amountRupiah: number;
  fundingSource: CashFundingSource;
};
