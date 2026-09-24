import type { ReceiptData } from "../../../components/receipt/types";
import type { Order } from "../../../types/pos";
import {
  getCartItemName,
  getCartLineTotal,
} from "../../../utils/cartPricing";

export function createHistoryReceiptData(
  order: Order,
  {
    billNumber,
    queueNumber,
    time,
  }: {
    billNumber: string;
    queueNumber: string;
    time: string;
  },
): ReceiptData {
  const items = order.items.map(({ product, quantity }) => ({
    id: product.id,
    name: getCartItemName(product.id, product.name),
    quantity,
    amount: getCartLineTotal(product.id, quantity, product.price),
  }));
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    billNumber,
    queueNumber,
    cashier: "Sarah",
    date: "24/10/2024",
    time,
    itemCount,
    orderType: "Take Away",
    items,
    subtotal,
  };
}
