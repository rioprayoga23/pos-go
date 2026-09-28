import { apiClient } from "../../services/apiClient";
import type { ApiEnvelope } from "../../services/apiTypes";
import type { OrderStatus } from "../../types/pos";
import type { OrderRecord } from "../order/api";

export type QueueOrderItem = {
  id: string;
  productName: string;
  quantity: number;
  isPrepared: boolean;
};

export type QueueOrder = {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  items: QueueOrderItem[];
};

export async function listActiveOrders(signal?: AbortSignal) {
  return apiClient.get<ApiEnvelope<QueueOrder[]>>("/orders?status=active", signal);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const response = await apiClient.patch<ApiEnvelope<QueueOrder>>(
    `/orders/${id}/status`,
    { status },
  );
  return response.data;
}

export async function updateOrderItemPrepared(
  orderId: string,
  itemId: string,
  isPrepared: boolean,
) {
  const response = await apiClient.patch<ApiEnvelope<QueueOrder>>(
    `/orders/${orderId}/items/${itemId}`,
    { isPrepared },
  );
  return response.data;
}

export function orderRecordToQueueOrder(record: OrderRecord): QueueOrder {
  return {
    id: record.id,
    number: record.number,
    createdAt: record.createdAt,
    status: record.status,
    items: record.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      isPrepared: item.isPrepared,
    })),
  };
}
