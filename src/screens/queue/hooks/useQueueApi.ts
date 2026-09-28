import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiEnvelope } from "../../../services/apiTypes";
import type { OrderStatus } from "../../../types/pos";
import {
  listActiveOrders,
  updateOrderItemPrepared,
  updateOrderStatus,
  type QueueOrder,
} from "../api";

export const queueQueryKeys = {
  active: ["orders", "queue", "active"] as const,
};

function saveQueueOrder(
  queryClient: ReturnType<typeof useQueryClient>,
  order: QueueOrder,
) {
  queryClient.setQueryData<ApiEnvelope<QueueOrder[]>>(queueQueryKeys.active, (current) => {
    if (!current) return current;
    const data = order.status === "completed"
      ? current.data.filter((entry) => entry.id !== order.id)
      : current.data.some((entry) => entry.id === order.id)
        ? current.data.map((entry) => entry.id === order.id ? order : entry)
        : [...current.data, order];
    data.sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
    return { ...current, data };
  });
}

export function useQueueOrders(enabled: boolean) {
  return useQuery({
    queryKey: queueQueryKeys.active,
    queryFn: ({ signal }) => listActiveOrders(signal),
    enabled,
    staleTime: 0,
    gcTime: Infinity,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

export function useQueueMutations() {
  const queryClient = useQueryClient();
  const status = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: OrderStatus }) =>
      updateOrderStatus(id, nextStatus),
    onSuccess: (order) => saveQueueOrder(queryClient, order),
  });
  const itemPrepared = useMutation({
    mutationFn: ({ orderId, itemId, isPrepared }: {
      orderId: string;
      itemId: string;
      isPrepared: boolean;
    }) => updateOrderItemPrepared(orderId, itemId, isPrepared),
    onSuccess: (order) => saveQueueOrder(queryClient, order),
  });

  return { status, itemPrepared };
}
