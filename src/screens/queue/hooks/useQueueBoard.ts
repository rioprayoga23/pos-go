import { useMemo } from "react";
import { useAppToast } from "../../../components/toast/useAppToast";
import type { OrderStatus } from "../../../types/pos";
import { useQueueMutations, useQueueOrders } from "./useQueueApi";
import type { QueueOrder } from "../api";

const EMPTY_ORDERS: QueueOrder[] = [];

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  waiting: "preparing",
  preparing: "ready",
  ready: "completed",
};

export function useQueueBoard(enabled: boolean) {
  const toast = useAppToast();
  const query = useQueueOrders(enabled);
  const mutations = useQueueMutations();
  const orders = query.data?.data ?? EMPTY_ORDERS;
  const waiting = useMemo(() => orders.filter((order) => order.status === "waiting"), [orders]);
  const preparing = useMemo(() => orders.filter((order) => order.status === "preparing"), [orders]);
  const ready = useMemo(() => orders.filter((order) => order.status === "ready"), [orders]);

  const advanceStatus = async (id: string) => {
    const order = orders.find((entry) => entry.id === id);
    const target = order && nextStatus[order.status];
    if (!order || !target) return;
    try {
      await mutations.status.mutateAsync({ id, nextStatus: target });
      const labels: Record<OrderStatus, string> = {
        waiting: "Menunggu",
        preparing: "Sedang dibuat",
        ready: "Siap disajikan",
        completed: "Selesai",
      };
      toast.success("Status pesanan diperbarui", `Pesanan #${order.number} · ${labels[target]}.`);
    } catch (error) {
      toast.error("Status pesanan gagal diperbarui", error instanceof Error ? error.message : "Coba lagi.");
      mutations.status.reset();
    }
  };
  const togglePreparedItem = async (orderId: string, itemId: string, isPrepared: boolean) => {
    try {
      await mutations.itemPrepared.mutateAsync({ orderId, itemId, isPrepared });
    } catch (error) {
      toast.error("Status bahan pesanan gagal diperbarui", error instanceof Error ? error.message : "Coba lagi.");
      mutations.itemPrepared.reset();
    }
  };
  const retry = () => {
    mutations.status.reset();
    mutations.itemPrepared.reset();
    void query.refetch();
  };

  return {
    waiting,
    preparing,
    ready,
    readyCount: ready.length,
    activeCupCount: orders.reduce(
      (total, order) => total + order.items.reduce((cups, item) => cups + item.quantity, 0),
      0,
    ),
    advanceStatus,
    togglePreparedItem,
    hasData: query.data !== undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isMutating: mutations.status.isPending || mutations.itemPrepared.isPending,
    errorMessage: query.isError ? "Data antrean gagal dimuat." : null,
    retry,
  };
}
