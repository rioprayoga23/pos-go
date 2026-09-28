import type { ApiEnvelope } from "../../services/apiTypes";
import { apiClient, buildQueryString, resolveApiUrl } from "../../services/apiClient";
import type { OrderStatus, OrderType, PaymentMethod } from "../../types/pos";
import type { DateRange } from "../../types/dateRange";

export type OrderHistoryFilters = DateRange & {
  search: string;
  paymentMethod: "all" | "cash" | "qris";
  page: number;
  limit: number;
};

export type HistoryOrderRecord = {
  id: string;
  number: string;
  orderType: "dine_in" | "take_away";
  paymentMethod: "cash" | "qris";
  status: OrderStatus;
  totalRupiah: number;
  cashReceivedRupiah?: number;
  changeRupiah: number;
  businessDate: string;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    productCategoryName: string;
    quantity: number;
    unitPriceRupiah: number;
    lineTotalRupiah: number;
    hppPerPortionRupiah: number | null;
    isPrepared: boolean;
  }[];
};

export type HistoryOrderPage = {
  data: HistoryOrderRecord[];
  total: number;
  page: number;
  limit: number;
};

export type SalesSummary = {
  revenueRupiah: number;
  cashRupiah: number;
  qrisRupiah: number;
  transactionCount: number;
  itemCount: number;
  hppAmountRupiah: number | null;
  grossProfitRupiah: number | null;
  soldMenu: {
    id: string;
    name: string;
    categoryName: string;
    quantity: number;
    amountRupiah: number;
    photoUrl?: string;
  }[];
};

export async function listOrderHistory(
  filters: OrderHistoryFilters,
  signal?: AbortSignal,
) {
  const query = buildQueryString({
    from: filters.startDate,
    to: filters.endDate,
    search: filters.search,
    paymentMethod: filters.paymentMethod,
    page: filters.page,
    limit: filters.limit,
  });
  return apiClient.get<HistoryOrderPage>(`/orders/history${query}`, signal);
}

export async function getSalesSummary(
  range: DateRange,
  signal?: AbortSignal,
) {
  const query = buildQueryString({ from: range.startDate, to: range.endDate });
  const response = await apiClient.get<ApiEnvelope<SalesSummary>>(
    `/orders/summary${query}`,
    signal,
  );
  return {
    ...response.data,
    soldMenu: response.data.soldMenu.map((item) => ({
      ...item,
      photoUrl: item.photoUrl ? resolveApiUrl(item.photoUrl) : undefined,
    })),
  };
}

export function historyOrderType(type: HistoryOrderRecord["orderType"]): OrderType {
  return type === "dine_in" ? "Dine in" : "Take away";
}

export function historyPaymentLabel(method: HistoryOrderRecord["paymentMethod"]): PaymentMethod {
  return method === "cash" ? "Tunai" : "QRIS";
}
