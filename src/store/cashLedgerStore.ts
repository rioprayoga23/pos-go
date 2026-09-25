import { create } from "zustand";
import { initialCashTransactions } from "../data/cashTransactions";
import type { CashTransaction, NewOperationalExpense } from "../types/cash";

type NewStockPurchase = {
  dateKey: string;
  timeLabel: string;
  description: string;
  detail: string;
  source: "cash" | "transfer";
  amount: number;
};

type CashLedgerState = {
  transactions: CashTransaction[];
  addStockPurchase: (purchase: NewStockPurchase) => void;
  addOperationalExpense: (expense: NewOperationalExpense) => void;
};

function getTimeValue(label: string) {
  return label.match(/\b\d{1,2}:\d{2}\b/)?.[0] ?? "10:20";
}

export const useCashLedgerStore = create<CashLedgerState>((set) => ({
  transactions: initialCashTransactions,
  addStockPurchase: (purchase) => {
    if (!purchase.description.trim() || purchase.amount <= 0) return;
    const transaction: CashTransaction = {
      id: `cash-stock-${Date.now()}`,
      dateKey: purchase.dateKey,
      time: getTimeValue(purchase.timeLabel),
      description: purchase.description,
      detail: purchase.detail,
      categoryKind: "stock_purchase",
      category: "Pembelian Stok",
      source: purchase.source,
      amount: purchase.amount,
    };
    set((state) => ({ transactions: [transaction, ...state.transactions] }));
  },
  addOperationalExpense: (expense) => {
    if (!expense.description.trim() || expense.amount <= 0) return;
    const transaction: CashTransaction = {
      ...expense,
      id: `cash-ops-${Date.now()}`,
      categoryKind: "operational",
    };
    set((state) => ({ transactions: [transaction, ...state.transactions] }));
  },
}));
