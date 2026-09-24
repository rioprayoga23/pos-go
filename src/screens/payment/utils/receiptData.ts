import type { ReceiptData } from "../../../components/receipt/types";
import type { CartItem } from "../../../types/pos";
import {
  getCartItemName,
  getCartLineTotal,
  getCartSubtotal,
} from "../../../utils/cartPricing";

export function createPaymentReceiptData(items: CartItem[]): ReceiptData {
  return {
    billNumber: "#B-042",
    queueNumber: "#A-042",
    cashier: "Sarah",
    date: "24/10/2024",
    time: "14:28:05",
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    orderType: "Take Away",
    items: items.map(({ product, quantity }) => ({
      id: product.id,
      name: getCartItemName(product.id, product.name),
      quantity,
      amount: getCartLineTotal(product.id, quantity, product.price),
    })),
    subtotal: getCartSubtotal(items),
  };
}
