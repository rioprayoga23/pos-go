import type { ApiEnvelope, ApiPage } from "../../services/apiTypes";
import { apiClient, buildQueryString } from "../../services/apiClient";
import type {
  CashExpenseDraft,
  CashOutflowFilters,
  CashOutflowSummary,
  CashRegister,
  CashTransaction,
} from "../../types/cash";

export function getCashRegister(signal?: AbortSignal) {
  return apiClient.get<ApiEnvelope<CashRegister>>("/cash-register", signal);
}

export function openCashRegister(openingAmountRupiah: number) {
  return apiClient.post<ApiEnvelope<CashRegister>>("/cash-register/open", {
    openingAmountRupiah,
  });
}

export function closeCashRegister({
  sessionId,
  countedAmountRupiah,
}: {
  sessionId: string;
  countedAmountRupiah: number;
}) {
  return apiClient.post<ApiEnvelope<CashRegister>>("/cash-register/close", {
    sessionId,
    countedAmountRupiah,
  });
}

export function createCashExpense(draft: CashExpenseDraft) {
  return apiClient.post<ApiEnvelope<CashTransaction>>("/cash-expenses", draft);
}

export function listCashOutflows(
  filters: CashOutflowFilters,
  signal?: AbortSignal,
) {
  return apiClient.get<ApiPage<CashTransaction>>(
    `/cash-outflows${buildQueryString(filters)}`,
    signal,
  );
}

export function getCashOutflowSummary(
  filters: Pick<CashOutflowFilters, "from" | "to">,
  signal?: AbortSignal,
) {
  return apiClient.get<ApiEnvelope<CashOutflowSummary>>(
    `/cash-outflows/summary${buildQueryString(filters)}`,
    signal,
  );
}
