import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../services/apiClient";
import { cashQueryKeys } from "../../cash/hooks/useCashApi";
import { stockQueryKeys } from "../../stock/hooks/useStockApi";
import { menuQueryKeys } from "../../products/hooks/useMenuApi";
import type { CashRegister } from "../../../types/cash";
import type { ApiEnvelope } from "../../../services/apiTypes";
import { orderRecordToQueueOrder } from "../../queue/api";
import { queueQueryKeys } from "../../queue/hooks/useQueueApi";
import { historyQueryKeys } from "../../history/hooks/useHistoryOrders";
import type { QueueOrder } from "../../queue/api";
import { createOrder, type CreateOrderDraft } from "../api";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: CreateOrderDraft) => createOrder(draft),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({
        queryKey: historyQueryKeys.historyRoot,
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: historyQueryKeys.summaryRoot,
        refetchType: "active",
      });
      queryClient.setQueryData<ApiEnvelope<QueueOrder[]>>(
        queueQueryKeys.active,
        (current) => {
          if (!current) return current;
          const newOrder = orderRecordToQueueOrder(order);
          return {
            ...current,
            data: [...current.data.filter((entry) => entry.id !== newOrder.id), newOrder]
              .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)),
          };
        },
      );
      if (order.paymentMethod === "cash") {
        queryClient.setQueryData<ApiEnvelope<CashRegister>>(
          cashQueryKeys.register,
          (current) => {
            if (!current || current.data.status !== "open") return current;
            return {
              ...current,
              data: {
                ...current.data,
                cashSalesRupiah: current.data.cashSalesRupiah + order.totalRupiah,
                expectedAmountRupiah:
                  current.data.expectedAmountRupiah + order.totalRupiah,
              },
            };
          },
        );
      }
      void queryClient.invalidateQueries({
        queryKey: stockQueryKeys.all,
        refetchType: "none",
      });
      void queryClient.invalidateQueries({
        queryKey: menuQueryKeys.products,
        refetchType: "none",
      });
    },
    onError: async (error) => {
      if (!(error instanceof ApiError)) return;
      const refresh: Promise<unknown>[] = [];
      if (error.code === "cash_register_closed") {
        refresh.push(queryClient.invalidateQueries({ queryKey: cashQueryKeys.register }));
      }
      if (error.code === "menu_price_changed" || error.code === "product_unavailable") {
        refresh.push(queryClient.invalidateQueries({ queryKey: menuQueryKeys.products }));
      }
      await Promise.all(refresh);
    },
  });
}
