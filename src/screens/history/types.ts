import type { PaymentMethod } from "../../types/pos";

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type PaymentFilter = "Semua Bayar" | PaymentMethod;

export type HistoryTransactionDisplay = {
  billNumber: string;
  queueNumber: string;
  time: string;
  paymentMethod: PaymentMethod;
  amount: number;
  cupCount: number;
  details: string;
};
