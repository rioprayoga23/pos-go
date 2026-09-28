import type {
  HistoryFilter,
  StockItem,
  StockMovement,
  StockPurchaseDetail,
} from "../../types/stock";
import type { ApiEnvelope, ApiPage } from "../../services/apiTypes";
import { apiClient, buildQueryString } from "../../services/apiClient";

export type StockItemDraft = {
  name: string;
  description: string;
  unit: string;
  purchaseUnit: string;
  stockUnitsPerPurchaseUnit: number;
};

export type StockItemPatch = Partial<StockItemDraft>;

export type StockPurchaseDraft = {
  stockItemId?: string;
  newItem?: StockItemDraft;
  quantity: number;
  totalCostRupiah: number;
  note?: string;
};

export type StockAdjustmentDraft = {
  actualStock?: number;
  purchaseUnitPriceRupiah?: number;
  note?: string;
};

export type StockItemFilters = {
  search?: string;
  page?: number;
  limit?: number;
};

export type StockMovementFilters = StockItemFilters & {
  type?: HistoryFilter;
  itemId?: string;
  from?: string;
  to?: string;
};

type ApiStockItem = StockItem & { createdAt: string };

type ApiStockMovement = Omit<StockMovement, "time" | "note" | "purchase"> & {
  time: string;
  note: string;
  createdAt: string;
  purchase?: StockPurchaseDetail;
};

function itemFromApi(item: ApiStockItem): StockItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    stock: item.stock,
    unit: item.unit,
    purchaseUnit: item.purchaseUnit,
    stockUnitsPerPurchaseUnit: item.stockUnitsPerPurchaseUnit,
    avgPrice: item.avgPrice,
  };
}

function movementFromApi(movement: ApiStockMovement): StockMovement {
  return {
    id: movement.id,
    dateKey: movement.dateKey,
    time: movement.time,
    itemId: movement.itemId,
    item: movement.item,
    type: movement.type,
    quantity: movement.quantity,
    unit: movement.unit,
    note: movement.note.replace(/^Lainnya\s*[·.]\s*/i, "").trim(),
    ...(movement.purchase
      ? {
          purchase: {
            quantity: movement.purchase.quantity,
            unit: movement.purchase.unit,
            totalCostRupiah: movement.purchase.totalCostRupiah,
          },
        }
      : {}),
  };
}

export async function listStockItems(
  filters: StockItemFilters,
  signal?: AbortSignal,
): Promise<ApiPage<StockItem>> {
  const result = await apiClient.get<ApiPage<ApiStockItem>>(
    `/stock-items${buildQueryString(filters)}`,
    signal,
  );
  return { ...result, data: result.data.map(itemFromApi) };
}

export async function listAllStockItems(signal?: AbortSignal): Promise<StockItem[]> {
  const limit = 100;
  const firstPage = await listStockItems({ page: 1, limit }, signal);
  const items = [...firstPage.data];
  const pageCount = Math.ceil(firstPage.total / limit);
  for (let page = 2; page <= pageCount; page += 1) {
    const result = await listStockItems({ page, limit }, signal);
    items.push(...result.data);
  }
  return items;
}

export async function getStockItem(
  id: string,
  signal?: AbortSignal,
): Promise<StockItem> {
  const result = await apiClient.get<ApiEnvelope<ApiStockItem>>(
    `/stock-items/${id}`,
    signal,
  );
  return itemFromApi(result.data);
}

export async function updateStockItem(
  id: string,
  draft: StockItemPatch,
): Promise<StockItem> {
  const result = await apiClient.patch<ApiEnvelope<ApiStockItem>>(
    `/stock-items/${id}`,
    draft,
  );
  return itemFromApi(result.data);
}

export async function deleteStockItem(id: string): Promise<void> {
  return apiClient.delete(`/stock-items/${id}`);
}

export async function createStockPurchase(
  draft: StockPurchaseDraft,
): Promise<StockItem> {
  const result = await apiClient.post<ApiEnvelope<ApiStockItem>>(
    "/stock-purchases",
    draft,
  );
  return itemFromApi(result.data);
}

export async function createStockAdjustment(
  id: string,
  draft: StockAdjustmentDraft,
): Promise<StockItem> {
  const result = await apiClient.post<ApiEnvelope<ApiStockItem>>(
    `/stock-items/${id}/adjustments`,
    draft,
  );
  return itemFromApi(result.data);
}

export async function listStockMovements(
  filters: StockMovementFilters,
  signal?: AbortSignal,
): Promise<ApiPage<StockMovement>> {
  const result = await apiClient.get<ApiPage<ApiStockMovement>>(
    `/stock-movements${buildQueryString(filters)}`,
    signal,
  );
  return { ...result, data: result.data.map(movementFromApi) };
}
