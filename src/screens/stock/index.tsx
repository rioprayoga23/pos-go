import {
  HStack,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useEffect, useMemo, useState } from "react";
import { useIsFocused } from "expo-router/react-navigation";
import { useWindowDimensions, View } from "react-native";
import { AppShell } from "../../components/app-shell";
import { useAppToast } from "../../components/toast/useAppToast";
import { LoadingScreen } from "../../components/loading-screen";
import { QueryErrorNotice } from "../../components/query-error-notice";
import {
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableFilterBar,
  DataTableFilterGrid,
  DataTableSection,
  type DataTableColumn,
} from "../../components/data-table";
import { DropdownFilter } from "../../components/dropdown-filter";
import { DateRangeButton } from "../../components/date-period-filter";
import {
  AppIcon,
  AppInput,
  AppPressable,
  EmptyState,
} from "../../components/ui";
import { DateRangePickerModal } from "../../components/date-range-picker/DateRangePickerModal";
import type { DatePeriod, DateRange } from "../../types/dateRange";
import { getLocalDateKey, getPresetDateRange } from "../../utils/date";
import { colors, spacing } from "../../theme";
import { formatCurrency, formatQuantity } from "../../utils/format";
import { debounce } from "../../utils/debounce";
import { StockPurchaseModal } from "./components/StockPurchaseModal";
import { StockItemModal, type StockItemFormDraft } from "./components/StockItemModal";
import { DeleteStockItemModal } from "./components/DeleteStockItemModal";
import { StockMovementDetailModal } from "./components/StockMovementDetailModal";
import { useStockItem, useStockItemChoices, useStockItems, useStockMovements, useStockMutations } from "./hooks/useStockApi";
import type { StockAdjustmentDraft, StockPurchaseDraft } from "./api";
import type { HistoryFilter, ModalMode, PurchaseDraft, StockItem, StockMovement } from "./types";
import { getPurchaseUnit, getPurchaseUnitPrice, getStockUnitsPerPurchaseUnit, isLowStock } from "./utils/stock";
import { styles } from "./styles";


const historyFilters: { key: HistoryFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "purchase", label: "Masuk / Beli" },
  { key: "sale", label: "Penjualan" },
  { key: "correction", label: "Koreksi / Waste" },
];

const stockTablePageSize = 10;
const emptyStockItems: StockItem[] = [];

function getStockMovementTime(dateKey: string, time: string) {
  const dateLabel = dateKey === getLocalDateKey()
    ? "Hari ini"
    : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(
        new Date(dateKey + "T12:00:00"),
      );
  return dateLabel + ", " + time + " WIB";
}

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <AppPressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Coba muat ulang">
      <Text style={{ color: colors.primary, fontWeight: "600" }}>Coba lagi</Text>
    </AppPressable>
  );
}

export function StockScreen() {
  const { height, width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const [inventoryPage, setInventoryPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [debouncedHistoryQuery, setDebouncedHistoryQuery] = useState("");
  const [historyPeriod, setHistoryPeriod] = useState<DatePeriod>("today");
  const [historyDateRange, setHistoryDateRange] = useState<DateRange>(() =>
    getPresetDateRange(getLocalDateKey(), "today"),
  );
  const [historyDatePickerOpen, setHistoryDatePickerOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [modal, setModal] = useState<{
    mode: ModalMode | "edit-item";
    itemId?: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockItem | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const toast = useAppToast();
  const updateDebouncedQuery = useMemo(
    () => debounce(setDebouncedQuery, 250),
    [],
  );
  const updateDebouncedHistoryQuery = useMemo(
    () => debounce(setDebouncedHistoryQuery, 250),
    [],
  );
  const isToolbarCompact = width < 920;
  const inventoryWidth = Math.max(900, width - (isToolbarCompact ? 32 : 176));
  const historyWidth = Math.max(960, width - (isToolbarCompact ? 32 : 176));

  const itemsQuery = useStockItems({
    search: debouncedQuery,
    page: inventoryPage,
    limit: stockTablePageSize,
  }, isFocused);
  const movementsQuery = useStockMovements({
    search: debouncedHistoryQuery,
    type: historyFilter,
    from: historyDateRange.startDate,
    to: historyDateRange.endDate,
    page: historyPage,
    limit: stockTablePageSize,
  }, isFocused);
  const pickerOpen = modal?.mode === "purchase";
  const itemChoicesQuery = useStockItemChoices(Boolean(pickerOpen) && isFocused);
  const editingItemQuery = useStockItem(
    modal?.mode === "edit-item" ? modal.itemId ?? "" : "",
    modal?.mode === "edit-item" && isFocused,
  );
  const { refreshStock, ...mutations } = useStockMutations();
  const items = itemsQuery.data?.data ?? emptyStockItems;
  const movements = movementsQuery.data?.data ?? [];
  const editingItem = modal?.mode === "edit-item"
    ? editingItemQuery.data ?? items.find((item) => item.id === modal.itemId)
    : undefined;
  const pickerItems = useMemo(() => {
    const combined = [...(itemChoicesQuery.data ?? []), ...items];
    const seen = new Set<string>();
    return combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [itemChoicesQuery.data, items]);
  const isMutating = Object.values(mutations).some((mutation) => mutation.isPending);
  const isLoading =
    itemsQuery.isFetching ||
    movementsQuery.isFetching ||
    itemChoicesQuery.isFetching ||
    editingItemQuery.isFetching ||
    isMutating;
  const itemLoadFailed = itemsQuery.isError && !itemsQuery.data;
  const historyLoadFailed = movementsQuery.isError && !movementsQuery.data;

  useEffect(() => {
    updateDebouncedQuery(query.trim());
    return () => updateDebouncedQuery.cancel();
  }, [query, updateDebouncedQuery]);

  useEffect(() => {
    updateDebouncedHistoryQuery(historyQuery.trim());
    return () => updateDebouncedHistoryQuery.cancel();
  }, [historyQuery, updateDebouncedHistoryQuery]);

  const changeInventoryQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setInventoryPage(1);
  };

  const changeHistoryQuery = (nextQuery: string) => {
    setHistoryQuery(nextQuery);
    setHistoryPage(1);
  };

  const changeHistoryFilter = (nextFilter: HistoryFilter) => {
    setHistoryFilter(nextFilter);
    setHistoryPage(1);
  };

  const inventoryColumns: DataTableColumn<StockItem>[] = [
    {
      key: "item",
      title: "BAHAN / ITEM",
      flex: 2.4,
      minWidth: 180,
      render: (item) => {
        const low = isLowStock(item);
        return (
          <VStack style={styles.inventoryItemColumn}>
            <HStack style={styles.inventoryItemNameRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              {low ? <View style={styles.lowStockMark} /> : null}
            </HStack>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </VStack>
        );
      },
    },
    {
      key: "stock",
      title: "STOK SAAT INI",
      flex: 1.6,
      minWidth: 110,
      render: (item) => (
        <Text
          style={[
            styles.cellValue,
            isLowStock(item) && styles.cellWarning,
          ]}
        >
          {formatQuantity(item.stock)}
        </Text>
      ),
    },
    {
      key: "unit",
      title: "SATUAN",
      flex: 1,
      minWidth: 75,
      render: (item) => (
        <Text
          style={[
            styles.cellMuted,
            isLowStock(item) && styles.cellWarning,
          ]}
        >
          {item.unit}
        </Text>
      ),
    },
    {
      key: "price",
      title: "HARGA MODAL",
      flex: 2,
      minWidth: 175,
      render: (item) => (
        <Text style={styles.cellPrice}>
          {formatCurrency(getPurchaseUnitPrice(item))} / {getPurchaseUnit(item)}
        </Text>
      ),
    },
    {
      key: "status",
      title: "STATUS",
      flex: 1.5,
      minWidth: 88,
      align: "center",
      render: (item) => {
        const low = isLowStock(item);
        const empty = item.stock <= 0;
        return (
          <HStack
            style={[
              styles.statusBadge,
              low ? styles.statusBadgeLow : styles.statusBadgeSafe,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: low ? colors.warning : colors.success },
              ]}
            >
              {empty ? "Habis" : low ? "Menipis" : "Aman"}
            </Text>
          </HStack>
        );
      },
    },
    {
      key: "action",
      title: "AKSI",
      flex: 1,
      minWidth: 108,
      align: "center",
      render: (item) => (
        <DataTableActions>
          <DataTableActionButton
            action="edit"
            label={`Ubah bahan ${item.name}`}
            onPress={() => setModal({ mode: "edit-item", itemId: item.id })}
          />
          <DataTableActionButton
            action="delete"
            label={`Hapus bahan ${item.name}`}
            onPress={() => setDeleteTarget(item)}
          />
        </DataTableActions>
      ),
    },
  ];

  const historyColumns: DataTableColumn<StockMovement>[] = [
    {
      key: "time",
      title: "WAKTU",
      flex: 2,
      minWidth: 145,
      render: (movement) => (
        <Text style={styles.cellMuted}>{getStockMovementTime(movement.dateKey, movement.time)}</Text>
      ),
    },
    {
      key: "item",
      title: "BAHAN / ITEM",
      flex: 2.2,
      minWidth: 195,
      render: (movement) => (
        <VStack style={styles.historyItemCell}>
          <Text style={styles.itemName}>{movement.item}</Text>
        </VStack>
      ),
    },
    {
      key: "type",
      title: "JENIS MUTASI",
      flex: 1.8,
      minWidth: 132,
      render: (movement) => {
        const typeLabel = movement.type === "purchase" ? "Pembelian" : movement.type === "sale" ? "Penjualan" : "Koreksi";
        const typeColor = movement.type === "purchase" ? colors.success : movement.type === "sale" ? colors.danger : colors.warning;
        return (
          <HStack
            style={[
              styles.typeBadge,
              movement.type === "correction"
                ? styles.typeBadgeCorrection
                : styles.typeBadgePurchase,
            ]}
          >
            <Text style={[styles.typeBadgeText, { color: typeColor }]}>
              {typeLabel}
            </Text>
          </HStack>
        );
      },
    },
    {
      key: "quantity",
      title: "JUMLAH",
      width: 75,
      align: "right",
      render: (movement) => {
        const quantityColor =
          movement.type === "purchase"
            ? colors.success
            : movement.type === "correction"
              ? colors.warning
              : colors.danger;
        return (
          <Text style={[styles.cellValue, { color: quantityColor }]}>
            {movement.quantity > 0 ? "+" : movement.quantity < 0 ? "−" : ""}
            {formatQuantity(Math.abs(movement.quantity))}
          </Text>
        );
      },
    },
    {
      key: "unit",
      title: "SATUAN",
      width: 75,
      render: (movement) => (
        <Text
          style={[
            styles.cellMuted,
          ]}
        >
          {movement.unit}
        </Text>
      ),
    },
    {
      key: "purchaseTotal",
      title: "TOTAL BELI",
      width: 125,
      align: "right",
      render: (movement) => (
        <Text style={styles.cellValue}>
          {movement.purchase
            ? formatCurrency(movement.purchase.totalCostRupiah)
            : "—"}
        </Text>
      ),
    },
    {
      key: "action",
      title: "AKSI",
      width: 88,
      align: "center",
      render: (movement) => (
        <DataTableActionButton
          action="detail"
          label={`Lihat detail mutasi ${movement.item}`}
          onPress={() => setSelectedMovement(movement)}
        />
      ),
    },
  ];

  const handleSaveStock = async (draft: PurchaseDraft) => {
    const requestDraft: StockPurchaseDraft = {
      ...(draft.newItem
        ? {
            newItem: draft.newItem,
          }
        : { stockItemId: draft.itemId }),
      quantity: draft.quantity,
      totalCostRupiah: draft.totalCost,
    };
    const savedItem = await mutations.purchase.mutateAsync(requestDraft);
    setInventoryPage(1);
    setHistoryPage(1);
    setModal(null);
    toast.success(
      draft.newItem ? "Bahan baru ditambahkan" : "Stok berhasil ditambahkan",
      `${savedItem.name} · ${formatCurrency(draft.totalCost)}.`,
    );
  };

  const handleUpdateItem = async (draft: StockItemFormDraft) => {
    if (modal?.mode !== "edit-item" || !modal.itemId || !editingItem) {
      throw new Error("Bahan yang akan diubah tidak ditemukan.");
    }
    const metadataChanged =
      draft.name !== editingItem.name ||
      draft.description !== editingItem.description ||
      draft.unit !== editingItem.unit ||
      draft.purchaseUnit !== (editingItem.purchaseUnit ?? editingItem.unit) ||
      draft.stockUnitsPerPurchaseUnit !== getStockUnitsPerPurchaseUnit(editingItem);
    const stockChanged = draft.actualStock !== editingItem.stock;
    const nextAveragePrice =
      draft.purchaseUnitPriceRupiah / draft.stockUnitsPerPurchaseUnit;
    const priceChanged = draft.purchaseUnitPriceEdited &&
      Math.abs(nextAveragePrice - editingItem.avgPrice) > 0.000000000001;

    let savedChanges = false;
    let movementChanged = false;
    try {
      if (metadataChanged) {
        savedChanges = true;
        await mutations.updateItem.mutateAsync({
          id: modal.itemId,
          refresh: false,
          draft: {
            name: draft.name,
            description: draft.description,
            unit: draft.unit,
            purchaseUnit: draft.purchaseUnit,
            stockUnitsPerPurchaseUnit: draft.stockUnitsPerPurchaseUnit,
          },
        });
      }
      if (stockChanged || priceChanged) {
        const adjustment: StockAdjustmentDraft = {};
        if (stockChanged) {
          adjustment.actualStock = draft.actualStock;
          adjustment.note = draft.note;
        }
        if (priceChanged) {
          adjustment.purchaseUnitPriceRupiah = draft.purchaseUnitPriceRupiah;
        }
        savedChanges = true;
        movementChanged = true;
        await mutations.adjust.mutateAsync({ id: modal.itemId, draft: adjustment, refresh: false });
        setHistoryPage(1);
      }
    } finally {
      if (savedChanges) {
        await refreshStock({ itemId: modal.itemId, includeMovements: movementChanged });
      }
    }

    setModal(null);
    toast.success("Bahan diperbarui", `${draft.name} berhasil diperbarui.`);
  };

  const handleDeleteItem = async (item: StockItem) => {
    await mutations.deleteItem.mutateAsync(item.id);
    if (items.length === 1 && inventoryPage > 1) setInventoryPage((page) => page - 1);
    setDeleteTarget(null);
    toast.success("Bahan dihapus", `${item.name} berhasil dihapus permanen.`);
  };

  return (
    <>
    <AppShell active="Stock" scrollable>
      <VStack style={styles.page}>
        <DataTableSection
          title="Daftar Bahan"
          description="Stok dan harga modal bahan yang tersedia di outlet."
          action={
            <AppPressable
              onPress={() => setModal({ mode: "purchase", itemId: items[0]?.id })}
              style={styles.primaryAction}
              accessibilityRole="button"
              accessibilityLabel="Tambah stok"
            >
              <AppIcon name="plus" size={15} color={colors.white} />
              <Text style={styles.primaryActionText}>Tambah Stok</Text>
            </AppPressable>
          }
        >
          <VStack>
            <DataTableFilterBar>
              <DataTableFilterGrid>
                <AppInput
                  value={query}
                  onChangeText={changeInventoryQuery}
                  placeholder="Cari bahan"
                  variant="search"
                  style={styles.searchInputFilter}
                  leading={
                    <AppIcon
                      name="magnify"
                      size={17}
                      color={colors.inkSubtle}
                    />
                  }
                  accessibilityLabel="Cari bahan"
                />
              </DataTableFilterGrid>
            </DataTableFilterBar>

            {itemsQuery.isError && itemsQuery.data ? (
              <QueryErrorNotice onRetry={() => { void itemsQuery.refetch(); }} />
            ) : null}
            <DataTable
              rows={items}
              columns={inventoryColumns}
              keyExtractor={(item) => item.id}
              width={inventoryWidth}
              minWidth={900}
              rowHeight={55}
              horizontalPadding={spacing.md}
              columnGap={spacing.sm}
              pagination={{
                page: inventoryPage,
                pageSize: stockTablePageSize,
                totalItems: itemsQuery.data?.total ?? 0,
                onPageChange: setInventoryPage,
                itemLabel: "bahan",
              }}
              emptyState={
                <EmptyState
                  icon={itemLoadFailed ? "alert-circle-outline" : items.length === 0 && !query ? "package-variant-closed" : "magnify-close"}
                  title={itemLoadFailed ? "Bahan gagal dimuat" : items.length === 0 && !query ? "Belum ada stok" : "Stok tidak ditemukan"}
                  description={itemLoadFailed ? "Periksa koneksi lalu coba lagi." : undefined}
                  action={itemLoadFailed ? <RetryButton onRetry={() => { void itemsQuery.refetch(); }} /> : undefined}
                  compact
                />
              }
            />
          </VStack>
        </DataTableSection>

        <DataTableSection
          title="Riwayat Mutasi Stok Terbaru"
          description="Pembelian dan koreksi stok bahan."
        >
          <VStack>
            <DataTableFilterBar>
              <DataTableFilterGrid>
                <AppInput
                  value={historyQuery}
                  onChangeText={changeHistoryQuery}
                  placeholder="Cari mutasi"
                  variant="search"
                  style={styles.searchInputFilter}
                  leading={
                    <AppIcon
                      name="magnify"
                      size={17}
                      color={colors.inkSubtle}
                    />
                  }
                  accessibilityLabel="Cari riwayat mutasi"
                />
                <DateRangeButton
                  dateRange={historyDateRange}
                  onPress={() => setHistoryDatePickerOpen(true)}
                  selected={historyPeriod === "custom"}
                  fullWidth
                />
                <DropdownFilter
                  options={historyFilters}
                  value={historyFilter}
                  onChange={changeHistoryFilter}
                  accessibilityLabel="Filter jenis mutasi stok"
                  fullWidth
                />
              </DataTableFilterGrid>
            </DataTableFilterBar>
            {movementsQuery.isError && movementsQuery.data ? (
              <QueryErrorNotice onRetry={() => { void movementsQuery.refetch(); }} />
            ) : null}
            <DataTable
              rows={movements}
              columns={historyColumns}
              keyExtractor={(movement) => movement.id}
              width={historyWidth}
              minWidth={960}
              rowHeight={48}
              horizontalPadding={spacing.md}
              verticalPadding={spacing.xs}
              columnGap={spacing.sm}
              pagination={{
                page: historyPage,
                pageSize: stockTablePageSize,
                totalItems: movementsQuery.data?.total ?? 0,
                onPageChange: setHistoryPage,
                itemLabel: "mutasi",
              }}
              emptyState={
                <EmptyState
                  icon="clipboard-text-outline"
                  title={historyLoadFailed ? "Riwayat gagal dimuat" : "Belum ada mutasi"}
                  description={historyLoadFailed ? "Periksa koneksi lalu coba lagi." : undefined}
                  action={historyLoadFailed ? <RetryButton onRetry={() => { void movementsQuery.refetch(); }} /> : undefined}
                  compact
                />
              }
            />
          </VStack>
        </DataTableSection>
      </VStack>

      {modal?.mode === "purchase" ? (
        <StockPurchaseModal
          key={`${modal.mode}-${modal.itemId ?? "default"}`}
          items={pickerItems}
          initialItemId={modal.itemId}
          height={height}
          itemsError={itemChoicesQuery.isError}
          onRetryItems={() => { void itemChoicesQuery.refetch(); }}
          onClose={() => setModal(null)}
          onSubmit={handleSaveStock}
        />
      ) : null}
      {modal?.mode === "edit-item" && editingItem ? (
        <StockItemModal
          key={`edit-item-${modal.itemId}`}
          item={editingItem}
          height={height}
          onClose={() => setModal(null)}
          onSubmit={handleUpdateItem}
        />
      ) : null}
      {deleteTarget ? (
        <DeleteStockItemModal
          item={deleteTarget}
          height={height}
          onClose={() => setDeleteTarget(null)}
          onDelete={() => handleDeleteItem(deleteTarget)}
        />
      ) : null}
      {selectedMovement ? (
        <StockMovementDetailModal
          movement={selectedMovement}
          timeLabel={getStockMovementTime(selectedMovement.dateKey, selectedMovement.time)}
          height={height}
          onClose={() => setSelectedMovement(null)}
        />
      ) : null}
      {historyDatePickerOpen ? (
        <DateRangePickerModal
          isOpen
          initialRange={historyDateRange}
          onClose={() => setHistoryDatePickerOpen(false)}
          onApply={(range) => {
            setHistoryPeriod("custom");
            setHistoryDateRange(range);
            setHistoryPage(1);
          }}
        />
      ) : null}

    </AppShell>
    <LoadingScreen visible={isLoading} />
    </>
  );
}
