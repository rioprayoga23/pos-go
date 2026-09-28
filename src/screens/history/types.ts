import type { PaymentMethod } from "../../types/pos";
import type { HistoryOrderRecord, SalesSummary } from "./api";

export type { DateRange } from "../../types/dateRange";

export type PaymentFilter = "Semua metode" | PaymentMethod;

export type HistoryTransactionDisplay = {
  orderNumber: string;
  time: string;
  paymentMethod: PaymentMethod;
  amount: number;
  cupCount: number;
  details: string;
};

export type HistoryOrder = HistoryOrderRecord;
export type HistorySalesSummary = SalesSummary;
