import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  closeCashRegister,
  createCashExpense,
  getCashOutflowSummary,
  getCashRegister,
  listCashOutflows,
  openCashRegister,
  recordCashSale,
} from "../api";
import type {
  CashOutflowFilters,
  CashRegister,
} from "../../../types/cash";
import type { ApiEnvelope } from "../../../services/apiTypes";

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
  { alwaysRefresh = false }: { alwaysRefresh?: boolean } = {},
) {
  return useQuery({
    queryKey: cashQueryKeys.register,
    queryFn: ({ signal }) => getCashRegister(signal),
    staleTime: Infinity,
    gcTime: Infinity,
    // Kelola Kas needs current register status every time the screen mounts.
    refetchOnMount: alwaysRefresh ? "always" : true,
    refetchOnWindowFocus: false,
  });
}

export function useCashOutflows(filters: CashOutflowFilters) {
  return useQuery({
    queryKey: cashQueryKeys.outflows(filters),
    queryFn: ({ signal }) => listCashOutflows(filters, signal),
    placeholderData: (previousData) => previousData,
  });
}

export function useCashOutflowSummary(
  filters: Pick<CashOutflowFilters, "from" | "to">,
) {
  return useQuery({
    queryKey: cashQueryKeys.summary(filters),
    queryFn: ({ signal }) => getCashOutflowSummary(filters, signal),
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
  const updateOpenRegister = (
    update: (register: CashRegister) => CashRegister,
  ) => {
    queryClient.setQueryData<ApiEnvelope<CashRegister>>(
      cashQueryKeys.register,
      (current) => {
        if (!current || current.data.status !== "open") return current;
        return { ...current, data: update(current.data) };
      },
    );
  };

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
    recordSale: useMutation({
      mutationFn: recordCashSale,
      onSuccess: (_, sale) =>
        updateOpenRegister((register) => ({
          ...register,
          cashSalesRupiah: register.cashSalesRupiah + sale.amountRupiah,
          expectedAmountRupiah:
            register.expectedAmountRupiah + sale.amountRupiah,
        })),
    }),
    createExpense: useMutation({
      mutationFn: createCashExpense,
      onSuccess: async (_, expense) => {
        if (expense.fundingSource === "cash_drawer") {
          updateOpenRegister((register) => ({
            ...register,
            cashOutflowsRupiah:
              register.cashOutflowsRupiah + expense.amountRupiah,
            expectedAmountRupiah:
              register.expectedAmountRupiah - expense.amountRupiah,
          }));
        }
        await refreshCashHistory();
      },
    }),
  };
}
