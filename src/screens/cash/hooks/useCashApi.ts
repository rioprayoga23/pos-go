import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  closeCashRegister,
  createCashExpense,
  getCashOutflowSummary,
  getCashRegister,
  listCashOutflows,
  openCashRegister,
} from "../api";
import type { CashOutflowFilters } from "../../../types/cash";

export const cashQueryKeys = {
  register: ["cash", "register"] as const,
  outflowsRoot: ["cash", "outflows"] as const,
  outflows: (filters: CashOutflowFilters) =>
    ["cash", "outflows", filters] as const,
  summaryRoot: ["cash", "summary"] as const,
  summary: (filters: Pick<CashOutflowFilters, "from" | "to">) =>
    ["cash", "summary", filters] as const,
};

export function useCashRegister(
  {
    alwaysRefresh = false,
    enabled = true,
  }: { alwaysRefresh?: boolean; enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: cashQueryKeys.register,
    queryFn: ({ signal }) => getCashRegister(signal),
    enabled,
    staleTime: 0,
    gcTime: Infinity,
    // Kelola Kas needs current register status every time the screen mounts.
    refetchOnMount: alwaysRefresh ? "always" : true,
    refetchOnWindowFocus: false,
  });
}

export function useCashOutflows(filters: CashOutflowFilters, enabled = true) {
  return useQuery({
    queryKey: cashQueryKeys.outflows(filters),
    queryFn: ({ signal }) => listCashOutflows(filters, signal),
    enabled,
    staleTime: 0,
    placeholderData: (previousData) => previousData,
  });
}

export function useCashOutflowSummary(
  filters: Pick<CashOutflowFilters, "from" | "to">,
  enabled = true,
) {
  return useQuery({
    queryKey: cashQueryKeys.summary(filters),
    queryFn: ({ signal }) => getCashOutflowSummary(filters, signal),
    enabled,
    staleTime: 0,
    placeholderData: (previousData) => previousData,
  });
}

export function useCashMutations() {
  const queryClient = useQueryClient();
  const refreshCashHistory = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: cashQueryKeys.outflowsRoot }),
      queryClient.invalidateQueries({ queryKey: cashQueryKeys.summaryRoot }),
    ]);
  return {
    openRegister: useMutation({
      mutationFn: openCashRegister,
      onSuccess: (register) =>
        queryClient.setQueryData(cashQueryKeys.register, register),
    }),
    closeRegister: useMutation({
      mutationFn: closeCashRegister,
      onSuccess: (register) =>
        queryClient.setQueryData(cashQueryKeys.register, register),
    }),
    createExpense: useMutation({
      mutationFn: createCashExpense,
      onSuccess: async (_, expense) => {
        if (expense.fundingSource === "cash_drawer") {
          await queryClient.invalidateQueries({ queryKey: cashQueryKeys.register });
        }
        await refreshCashHistory();
      },
    }),
  };
}
