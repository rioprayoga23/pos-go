import type { Order } from "../../../types/pos";
import { getCartItemName, getCartSubtotal } from "../../../utils/cartPricing";
import type { HistoryTransactionDisplay } from "../types";

export const defaultHistoryDate = "2024-10-24";

const historyDisplayByOrderId: Record<
  string,
  Partial<Pick<HistoryTransactionDisplay, "billNumber" | "queueNumber" | "time">>
> = {
  "o-a044": {
    billNumber: "#B-042",
    queueNumber: "#A-042",
    time: "14:28",
  },
  "o-a041": {
    billNumber: "#B-041",
    queueNumber: "#A-041",
    time: "14:15",
  },
  "o-a039": {
    billNumber: "#B-040",
    queueNumber: "#A-040",
    time: "14:02",
  },
  "o-a040": {
    billNumber: "#B-039",
    queueNumber: "#A-039",
    time: "13:48",
  },
  "o-a038": {
    billNumber: "#B-038",
    queueNumber: "#A-038",
    time: "13:30",
  },
};

export function getHistoryTransactionDisplay(
  order: Order,
): HistoryTransactionDisplay {
  const fixture = historyDisplayByOrderId[order.id];
  const cupCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return {
    billNumber: fixture?.billNumber ?? order.number.replace("#A-", "#B-"),
    queueNumber: fixture?.queueNumber ?? order.number,
    time: fixture?.time ?? order.createdAt,
    paymentMethod: order.paymentMethod,
    amount: getCartSubtotal(order.items),
    cupCount,
    details: order.items
      .map(
        ({ product, quantity }) =>
          `${quantity}x ${getCartItemName(product.id, product.name)}`,
      )
      .join(", "),
  };
}
