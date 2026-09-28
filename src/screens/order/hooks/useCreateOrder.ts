import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../services/apiClient";
import { cashQueryKeys } from "../../cash/hooks/useCashApi";
import { stockQueryKeys } from "../../stock/hooks/useStockApi";
import { menuQueryKeys } from "../../products/hooks/useMenuApi";
import type { CashRegister } from "../../../types/cash";
import type { ApiEnvelope } from "../../../services/apiTypes";
import { createOrder, type CreateOrderDraft } from "../api";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: CreateOrderDraft) => createOrder(draft),
    onSuccess: (order) => {
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
