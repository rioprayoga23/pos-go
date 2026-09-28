import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "../../../types/dateRange";
import { debounce } from "../../../utils/debounce";
import { getLocalDateKey } from "../../../utils/date";
import {
  getSalesSummary,
  listOrderHistory,
  type OrderHistoryFilters,
} from "../api";
import type { PaymentFilter } from "../types";

const pageSize = 10;

export const historyQueryKeys = {
  historyRoot: ["orders", "history"] as const,
  history: (filters: OrderHistoryFilters) => ["orders", "history", filters] as const,
  summaryRoot: ["orders", "summary"] as const,
  summary: (range: DateRange) => ["orders", "summary", range] as const,
};

export function useHistoryOrders(enabled = true) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("Semua metode");
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = getLocalDateKey();
    return { startDate: today, endDate: today };
  });
  const [page, setPage] = useState(1);
  const updateDebouncedQuery = useMemo(
    () => debounce((value: string) => {
      setDebouncedQuery(value);
      setPage(1);
    }, 250),
    [],
  );

  useEffect(() => {
    updateDebouncedQuery(query.trim());
    return () => updateDebouncedQuery.cancel();
  }, [query, updateDebouncedQuery]);

  const filters = useMemo<OrderHistoryFilters>(
    () => ({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      search: debouncedQuery,
      paymentMethod: paymentFilter === "Semua metode"
        ? "all"
        : paymentFilter === "Tunai"
          ? "cash"
          : "qris",
      page,
      limit: pageSize,
    }),
    [dateRange.endDate, dateRange.startDate, debouncedQuery, page, paymentFilter],
  );
  const summaryRange = useMemo<DateRange>(
    () => ({ startDate: dateRange.startDate, endDate: dateRange.endDate }),
    [dateRange.endDate, dateRange.startDate],
  );
  const historyQuery = useQuery({
    queryKey: historyQueryKeys.history(filters),
    queryFn: ({ signal }) => listOrderHistory(filters, signal),
    enabled,
    staleTime: 0,
    gcTime: Infinity,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
  const summaryQuery = useQuery({
    queryKey: historyQueryKeys.summary(summaryRange),
    queryFn: ({ signal }) => getSalesSummary(summaryRange, signal),
    enabled,
    staleTime: 0,
    gcTime: Infinity,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
  const total = historyQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
  };
  const changePaymentFilter = (nextFilter: PaymentFilter) => {
    setPaymentFilter(nextFilter);
    setPage(1);
  };
  const changeDateRange = (nextRange: DateRange) => {
    setDateRange(nextRange);
    setPage(1);
  };

  return {
    query,
    changeQuery,
    dateRange,
    changeDateRange,
    paymentFilter,
    changePaymentFilter,
    orders: historyQuery.data?.data ?? [],
    total,
    page,
    pageSize,
    pageCount,
    setPage,
    summary: summaryQuery.data,
    isLoading: historyQuery.isLoading || summaryQuery.isLoading,
    isFetching: historyQuery.isFetching || summaryQuery.isFetching,
    isError: historyQuery.isError || summaryQuery.isError,
    refetch: () => Promise.all([historyQuery.refetch(), summaryQuery.refetch()]),
  };
}
