export type ReceiptLine = {
  id: string;
  name: string;
  quantity: number;
  amount: number;
};

export type ReceiptData = {
  billNumber: string;
  queueNumber: string;
  cashier: string;
  date: string;
  time: string;
  itemCount: number;
  orderType: string;
  items: ReceiptLine[];
  subtotal: number;
};
