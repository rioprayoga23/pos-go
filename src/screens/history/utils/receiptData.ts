import type { ReceiptData } from "../../../components/receipt/types";
import type { Order } from "../../../types/pos";
import {
  getCartLineTotal,
} from "../../../utils/cartPricing";

export function createHistoryReceiptData(
  order: Order,
): ReceiptData {
  const items = order.items.map(({ product, quantity }) => ({
    id: product.id,
    name: product.name,
    quantity,
    amount: getCartLineTotal(quantity, product.price),
  }));
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const date = (order.createdOn ?? "").split("-").reverse().join("/");

  return {
    orderNumber: order.number,
    cashier: "Kasir",
    customer: order.customer,
    date: date || new Date().toLocaleDateString("id-ID"),
    time: order.createdAt,
    itemCount,
    orderType: order.orderType,
    paymentMethod: order.paymentMethod,
    items,
    subtotal: order.total,
    cashReceivedRupiah: order.cashReceivedRupiah,
    changeRupiah: order.changeRupiah,
  };
}
