import type { Order } from "../../../types/pos";
import { getCartSubtotal } from "../../../utils/cartPricing";
import type { HistoryTransactionDisplay } from "../types";

export function getHistoryTransactionDisplay(
  order: Order,
): HistoryTransactionDisplay {
  const cupCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return {
    orderNumber: order.number,
    time: order.createdAt,
    paymentMethod: order.paymentMethod,
    amount: order.total || getCartSubtotal(order.items),
    cupCount,
    details: order.items
      .map(
        ({ product, quantity }) =>
          `${quantity}x ${product.name}`,
      )
      .join(", "),
  };
}
