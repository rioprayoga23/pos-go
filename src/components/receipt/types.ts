import type { PaymentMethod } from "../../types/pos";

export type ReceiptLine = {
  id: string;
  name: string;
  quantity: number;
  amount: number;
};

export type ReceiptData = {
  orderNumber: string;
  cashier: string;
  customer: string;
  date: string;
  time: string;
  itemCount: number;
  orderType: string;
  paymentMethod: PaymentMethod;
  items: ReceiptLine[];
  subtotal: number;
};
