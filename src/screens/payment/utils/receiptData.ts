import type { ReceiptData } from "../../../components/receipt/types";
import type { CartItem, OrderType } from "../../../types/pos";
import { getLocalDateKey } from "../../../utils/date";
import {
  getCartLineTotal,
  getCartSubtotal,
} from "../../../utils/cartPricing";

export function createPaymentReceiptData(
  items: CartItem[],
  orderNumber: string,
  orderType: OrderType,
  paymentMethod: ReceiptData["paymentMethod"],
): ReceiptData {
  const now = new Date();
  const date = getLocalDateKey().split("-").reverse().join("/");
  return {
    orderNumber,
    cashier: "Kasir",
    customer: "Pelanggan umum",
    date,
    time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    orderType,
    paymentMethod,
    items: items.map(({ product, quantity }) => ({
      id: product.id,
      name: product.name,
      quantity,
      amount: getCartLineTotal(quantity, product.price),
    })),
    subtotal: getCartSubtotal(items),
  };
}
