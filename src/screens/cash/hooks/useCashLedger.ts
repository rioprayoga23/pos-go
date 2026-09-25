import { useMemo, useState } from "react";
import { useCashLedgerStore } from "../../../store/cashLedgerStore";
import type { CashTransaction } from "../../../types/cash";
import type { DatePeriod, DateRange } from "../../../types/dateRange";
import { getPresetDateRange } from "../../../utils/date";

export type CashPeriod = DatePeriod;
export type CashTransactionFilter = "all" | "stock_purchase" | "operational";

const demoToday = "2024-10-24";

function compareTransactions(a: CashTransaction, b: CashTransaction) {
  return `${b.dateKey} ${b.time}`.localeCompare(`${a.dateKey} ${a.time}`);
}

export function useCashLedger() {
  const transactions = useCashLedgerStore((state) => state.transactions);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CashTransactionFilter>("all");
  const [period, setPeriod] = useState<CashPeriod>("month");
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getPresetDateRange(demoToday, "month"),
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const rangedTransactions = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.dateKey >= dateRange.startDate &&
            transaction.dateKey <= dateRange.endDate,
        )
        .sort(compareTransactions),
    [dateRange.endDate, dateRange.startDate, transactions],
  );

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    return rangedTransactions.filter((transaction) => {
      const matchesFilter =
        filter === "all" || transaction.categoryKind === filter;
      const sourceLabel =
        transaction.source === "cash"
          ? "kas laci pay-out"
          : "rekening usaha transfer";
      const searchableText = [
        transaction.description,
        transaction.detail,
        transaction.category,
        sourceLabel,
      ]
        .join(" ")
        .toLocaleLowerCase("id-ID");
      return (
        matchesFilter &&
        (!normalizedQuery || searchableText.includes(normalizedQuery))
      );
    });
  }, [filter, query, rangedTransactions]);

  const summary = useMemo(
    () =>
      rangedTransactions.reduce(
        (result, transaction) => {
          if (transaction.categoryKind === "stock_purchase") {
            result.stockAmount += transaction.amount;
            result.stockCount += 1;
          } else {
            result.operationalAmount += transaction.amount;
            result.operationalCount += 1;
          }
          return result;
        },
        {
          stockAmount: 0,
          stockCount: 0,
          operationalAmount: 0,
          operationalCount: 0,
        },
      ),
    [rangedTransactions],
  );

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
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
    setDateRange(getPresetDateRange(demoToday, nextPeriod));
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
    rangedTransactions,
    summary,
    transactions: filteredTransactions,
    changeQuery,
    applyDateRange,
    selectFilter,
    selectPeriod,
    setPage,
  };
}
