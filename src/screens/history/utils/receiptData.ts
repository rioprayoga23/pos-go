import type { ReceiptData } from "../../../components/receipt/types";
import { historyOrderType, historyPaymentLabel } from "../api";
import type { HistoryOrder } from "../types";
import type { Order } from "../../../types/pos";
import { getCartLineTotal } from "../../../utils/cartPricing";

export function createHistoryReceiptData(
	order: HistoryOrder | Order,
): ReceiptData {
  const isHistoryOrder = "businessDate" in order;
  const items = isHistoryOrder
    ? order.items.map((item) => ({
        id: item.id,
        name: item.productName,
        quantity: item.quantity,
        amount: item.lineTotalRupiah,
      }))
    : order.items.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        quantity,
        amount: getCartLineTotal(quantity, product.price),
      }));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const createdAt = isHistoryOrder ? new Date(order.createdAt) : undefined;
  const businessDate = isHistoryOrder ? order.businessDate : order.createdOn;
  const date = businessDate?.split("-").reverse().join("/");
  const orderType = isHistoryOrder
    ? historyOrderType(order.orderType)
    : order.orderType;
  const paymentMethod = isHistoryOrder
    ? historyPaymentLabel(order.paymentMethod)
    : order.paymentMethod;
  const subtotal = isHistoryOrder ? order.totalRupiah : order.total;
  const time = createdAt
    ? createdAt.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Jakarta",
      })
    : order.createdAt;

  return {
    orderNumber: order.number,
    cashier: "Kasir",
    customer: "Pelanggan umum",
    date:
      date ||
      createdAt?.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" }) ||
      new Date().toLocaleDateString("id-ID"),
    time,
    itemCount,
    orderType,
    paymentMethod,
    items,
    subtotal,
    cashReceivedRupiah: order.cashReceivedRupiah,
    changeRupiah: order.changeRupiah,
  };
}
