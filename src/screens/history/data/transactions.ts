import { historyPaymentLabel } from "../api";
import type { HistoryOrder, HistoryTransactionDisplay } from "../types";

export function getHistoryTransactionDisplay(
	order: HistoryOrder,
): HistoryTransactionDisplay {
  const cupCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return {
    orderNumber: order.number,
		time: new Date(order.createdAt).toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Jakarta",
		}),
		paymentMethod: historyPaymentLabel(order.paymentMethod),
		amount: order.totalRupiah,
		cupCount,
		details: order.items.map(({ productName, quantity }) => `${quantity}x ${productName}`).join(", "),
	};
}
