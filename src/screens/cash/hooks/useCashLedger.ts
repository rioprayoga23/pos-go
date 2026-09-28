import { useEffect, useMemo, useState } from "react";
import type { CashOutflowFilters } from "../../../types/cash";
import type { DatePeriod, DateRange } from "../../../types/dateRange";
import { debounce } from "../../../utils/debounce";
import { getLocalDateKey, getPresetDateRange } from "../../../utils/date";
import { useCashOutflowSummary, useCashOutflows } from "./useCashApi";

export type CashPeriod = DatePeriod;
export type CashTransactionFilter = "all" | "stock_purchase" | "operational";

const pageSize = 10;

export function useCashLedger(enabled = true) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filter, setFilter] = useState<CashTransactionFilter>("all");
  const [period, setPeriod] = useState<CashPeriod>("month");
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getPresetDateRange(getLocalDateKey(), "month"),
  );
  const [page, setPage] = useState(1);
  const updateDebouncedQuery = useMemo(
    () => debounce(setDebouncedQuery, 250),
    [],
  );

  useEffect(() => {
    updateDebouncedQuery(query.trim());
    return () => updateDebouncedQuery.cancel();
  }, [query, updateDebouncedQuery]);

  const rangeFilters = useMemo(
    () => ({ from: dateRange.startDate, to: dateRange.endDate }),
    [dateRange.endDate, dateRange.startDate],
  );
  const filters: CashOutflowFilters = useMemo(
    () => ({
      ...rangeFilters,
      search: debouncedQuery,
      category: filter,
      page,
      limit: pageSize,
    }),
    [debouncedQuery, filter, page, rangeFilters],
  );

  const outflowsQuery = useCashOutflows(filters, enabled);
  const summaryQuery = useCashOutflowSummary(rangeFilters, enabled);
  const pageCount = Math.max(
    1,
    Math.ceil((outflowsQuery.data?.total ?? 0) / pageSize),
  );
  const activePage = Math.min(page, pageCount);

  const selectFilter = (nextFilter: CashTransactionFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setPage(1);
  };

  const selectPeriod = (nextPeriod: "today" | "month") => {
    setPeriod(nextPeriod);
    setDateRange(getPresetDateRange(getLocalDateKey(), nextPeriod));
    setPage(1);
  };

  const applyDateRange = (nextRange: DateRange) => {
    setDateRange(nextRange);
    setPeriod("custom");
    setPage(1);
  };

  return {
    dateRange,
    filter,
    page: activePage,
    pageSize,
    period,
    query,
    transactions: outflowsQuery.data?.data ?? [],
    total: outflowsQuery.data?.total ?? 0,
    summary: summaryQuery.data?.data ?? {
      stockAmount: 0,
      stockCount: 0,
      operationalAmount: 0,
      operationalCount: 0,
    },
    isFetching: outflowsQuery.isFetching || summaryQuery.isFetching,
    isError: outflowsQuery.isError || summaryQuery.isError,
    refetch: () =>
      Promise.all([outflowsQuery.refetch(), summaryQuery.refetch()]),
    changeQuery,
    applyDateRange,
    selectFilter,
    selectPeriod,
    setPage,
  };
}
