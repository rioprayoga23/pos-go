import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteStockItem,
  createStockAdjustment,
  createStockPurchase,
  getStockItem,
  listStockItems,
  listStockMovements,
  updateStockItem,
  type StockAdjustmentDraft,
  type StockItemDraft,
  type StockMovementFilters,
  type StockPurchaseDraft,
} from "../api";
import { cashQueryKeys } from "../../cash/hooks/useCashApi";

export const stockQueryKeys = {
  all: ["stock"] as const,
  items: (filters: { search: string; page: number; limit: number }) =>
    ["stock", "items", filters] as const,
  item: (id: string) => ["stock", "item", id] as const,
  itemChoices: ["stock", "item-choices"] as const,
  allItems: ["stock", "all-items"] as const,
  movements: (filters: StockMovementFilters) => ["stock", "movements", filters] as const,
};

export function useStockItems(filters: { search: string; page: number; limit: number }) {
  return useQuery({
    queryKey: stockQueryKeys.items(filters),
    queryFn: ({ signal }) => listStockItems(filters, signal),
    placeholderData: (previousData) => previousData,
  });
}

export function useStockItem(id: string, enabled: boolean) {
  return useQuery({
    queryKey: stockQueryKeys.item(id),
    queryFn: ({ signal }) => getStockItem(id, signal),
    enabled: Boolean(id) && enabled,
  });
}

export function useStockItemChoices(enabled: boolean) {
  return useQuery({
    queryKey: stockQueryKeys.itemChoices,
    queryFn: ({ signal }) => listStockItems({ page: 1, limit: 100 }, signal),
    enabled,
    staleTime: 30_000,
  });
}

export function useStockMovements(filters: StockMovementFilters) {
  return useQuery({
    queryKey: stockQueryKeys.movements(filters),
    queryFn: ({ signal }) => listStockMovements(filters, signal),
    placeholderData: (previousData) => previousData,
  });
}

export function useStockMutations() {
  const queryClient = useQueryClient();
  const refreshStock = async () => {
    await queryClient.invalidateQueries({ queryKey: stockQueryKeys.all });
  };
  const refreshAfterPurchase = async () => {
    await refreshStock();
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: cashQueryKeys.outflowsRoot }),
      queryClient.invalidateQueries({ queryKey: cashQueryKeys.summaryRoot }),
    ]);
  };

  return {
    updateItem: useMutation({ mutationFn: ({ id, draft }: { id: string; draft: StockItemDraft }) => updateStockItem(id, draft), onSuccess: refreshStock }),
    deleteItem: useMutation({ mutationFn: (id: string) => deleteStockItem(id), onSuccess: refreshStock }),
    purchase: useMutation({ mutationFn: (draft: StockPurchaseDraft) => createStockPurchase(draft), onSuccess: refreshAfterPurchase }),
    adjust: useMutation({ mutationFn: ({ id, draft }: { id: string; draft: StockAdjustmentDraft }) => createStockAdjustment(id, draft), onSuccess: refreshStock }),
  };
}
