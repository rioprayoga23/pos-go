import { useMemo, useState } from "react";
import { useTransactionStore } from "../../../store/transactionStore";
import { getLocalDateKey } from "../../../utils/date";
import { getHistoryTransactionDisplay } from "../data/transactions";
import type { DateRange, PaymentFilter } from "../types";

export function useHistoryOrders() {
  const orders = useTransactionStore((state) => state.orders);
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("Semua metode");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
  const latestOrderDate = useMemo(() => {
    let latestDate = "";

    for (const order of orders) {
      const orderDate = order.createdOn ?? getLocalDateKey();
      if (orderDate > latestDate) latestDate = orderDate;
    }

    return latestDate || getLocalDateKey();
  }, [orders]);
  const dateRange = useMemo(
    () =>
      selectedDateRange ?? {
        startDate: latestOrderDate,
        endDate: latestOrderDate,
      },
    [latestOrderDate, selectedDateRange],
  );
  const filteredOrders = useMemo(
    () => {
      const normalizedQuery = query.toLowerCase();
      const matches: typeof orders = [];

      for (const order of orders) {
        const orderDate = order.createdOn ?? getLocalDateKey();
        if (orderDate < dateRange.startDate || orderDate > dateRange.endDate) {
          continue;
        }

        const transaction = getHistoryTransactionDisplay(order);
        if (
          paymentFilter !== "Semua metode" &&
          transaction.paymentMethod !== paymentFilter
        ) {
          continue;
        }

        const searchableText = `${order.number} ${order.customer} ${order.items
          .map(({ product }) => product.name)
          .join(" ")}`.toLowerCase();
        if (!searchableText.includes(normalizedQuery)) continue;

        matches.push(order);
      }

      return matches;
    },
    [orders, query, paymentFilter, dateRange.startDate, dateRange.endDate],
  );

  return {
    query,
    setQuery,
    filteredOrders,
    paymentFilter,
    setPaymentFilter,
    dateRange,
    setDateRange: setSelectedDateRange,
  };
}
