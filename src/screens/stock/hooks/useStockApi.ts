import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteStockItem,
  createStockAdjustment,
  createStockPurchase,
  getStockItem,
  listAllStockItems,
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
  itemsRoot: ["stock", "items"] as const,
  items: (filters: { search: string; page: number; limit: number }) =>
    ["stock", "items", filters] as const,
  item: (id: string) => ["stock", "item", id] as const,
  allItems: ["stock", "all-items"] as const,
  movementsRoot: ["stock", "movements"] as const,
  movements: (filters: StockMovementFilters) => ["stock", "movements", filters] as const,
};

export function useStockItems(
  filters: { search: string; page: number; limit: number },
  enabled = true,
) {
  return useQuery({
    queryKey: stockQueryKeys.items(filters),
    queryFn: ({ signal }) => listStockItems(filters, signal),
    enabled,
    staleTime: 0,
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
    queryKey: stockQueryKeys.allItems,
    queryFn: ({ signal }) => listAllStockItems(signal),
    enabled,
    staleTime: 0,
  });
}

export function useStockMovements(filters: StockMovementFilters, enabled = true) {
  return useQuery({
    queryKey: stockQueryKeys.movements(filters),
    queryFn: ({ signal }) => listStockMovements(filters, signal),
    enabled,
    staleTime: 0,
    placeholderData: (previousData) => previousData,
  });
}

export function useStockMutations() {
  const queryClient = useQueryClient();
  const refreshStock = async ({ itemId, includeMovements = true }: { itemId?: string; includeMovements?: boolean } = {}) => {
    const invalidations = [
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.itemsRoot }),
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.allItems, exact: true, refetchType: "none" }),
    ];
    if (includeMovements) {
      invalidations.push(queryClient.invalidateQueries({ queryKey: stockQueryKeys.movementsRoot }));
    }
    if (itemId) {
      invalidations.push(queryClient.invalidateQueries({ queryKey: stockQueryKeys.item(itemId), exact: true, refetchType: "none" }));
    }
    await Promise.all(invalidations);
  };
  const refreshAfterPurchase = async () => {
    await refreshStock();
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: cashQueryKeys.outflowsRoot, refetchType: "none" }),
      queryClient.invalidateQueries({ queryKey: cashQueryKeys.summaryRoot, refetchType: "none" }),
    ]);
  };

  return {
    refreshStock,
    updateItem: useMutation({
      mutationFn: ({ id, draft }: { id: string; draft: StockItemDraft; refresh?: boolean }) => updateStockItem(id, draft),
      onSuccess: (_, variables) => variables.refresh === false ? undefined : refreshStock({ itemId: variables.id, includeMovements: false }),
    }),
    deleteItem: useMutation({
      mutationFn: (id: string) => deleteStockItem(id),
      onSuccess: (_, id) => refreshStock({ itemId: id, includeMovements: false }),
    }),
    purchase: useMutation({ mutationFn: (draft: StockPurchaseDraft) => createStockPurchase(draft), onSuccess: refreshAfterPurchase }),
    adjust: useMutation({
      mutationFn: ({ id, draft }: { id: string; draft: StockAdjustmentDraft; refresh?: boolean }) => createStockAdjustment(id, draft),
      onSuccess: (_, variables) => variables.refresh === false ? undefined : refreshStock({ itemId: variables.id }),
    }),
  };
}
