import {
  HStack,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { AppShell } from "../../components/app-shell";
import { DataTable, type DataTableColumn } from "../../components/data-table";
import { DatePeriodFilter } from "../../components/date-period-filter";
import { SegmentedFilterGroup } from "../../components/segmented-filter";
import {
  AppIcon,
  AppInput,
  AppPressable,
  EmptyState,
  Panel,
} from "../../components/ui";
import { DateRangePickerModal } from "../../components/date-range-picker/DateRangePickerModal";
import type { DatePeriod, DateRange } from "../../types/dateRange";
import { getLocalDateKey, getPresetDateRange } from "../../utils/date";
import { colors, spacing } from "../../theme";
import { formatCurrency, formatThousands } from "../../utils/format";
import { useCashLedgerStore } from "../../store/cashLedgerStore";
import { useTransactionStore } from "../../store/transactionStore";
import { useStockStore } from "../../store/stockStore";
import { StockAdjustmentModal } from "./components/StockAdjustmentModal";
import type { HistoryFilter, ModalMode, StockDraft, StockItem, StockMovement } from "./types";
import { getPurchaseUnit, getPurchaseUnitPrice, getStockUnitsPerPurchaseUnit, isLowStock } from "./utils/stock";
import { styles } from "./styles";


const historyFilters: { key: HistoryFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "purchase", label: "Masuk / Beli" },
  { key: "sale", label: "Penjualan" },
  { key: "correction", label: "Koreksi / Waste" },
];

const stockTablePageSize = 10;

function getStockMovementTime(dateKey: string, time: string) {
  const dateLabel = dateKey === getLocalDateKey()
    ? "Hari ini"
    : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(
        new Date(dateKey + "T12:00:00"),
      );
  return dateLabel + ", " + time + " WIB";
}

export function StockScreen() {
  const { height, width } = useWindowDimensions();
  const items = useStockStore((state) => state.items);
  const setItems = useStockStore((state) => state.setItems);
  const movements = useStockStore((state) => state.movements);
  const setMovements = useStockStore((state) => state.setMovements);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [query, setQuery] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyPeriod, setHistoryPeriod] = useState<DatePeriod>("today");
  const [historyDateRange, setHistoryDateRange] = useState<DateRange>(() =>
    getPresetDateRange(getLocalDateKey(), "today"),
  );
  const [historyDatePickerOpen, setHistoryDatePickerOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [modal, setModal] = useState<{
    mode: ModalMode;
    itemId?: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    message: string;
    kind: "success" | "error";
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPhone = width < 768;
  const isToolbarCompact = width < 920;
  const isCompact = width < 1240;
  const inventoryWidth = Math.max(900, width - (isToolbarCompact ? 32 : 176));
  const historyWidth = Math.max(980, width - (isToolbarCompact ? 32 : 176));

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (
    title: string,
    message: string,
    kind: "success" | "error" = "success",
  ) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ title, message, kind });
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  };

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) =>
      !normalizedQuery ||
      `${item.name} ${item.description} ${item.unit}`.toLowerCase().includes(normalizedQuery),
    );
  }, [items, query]);

  const visibleMovements = useMemo(() => {
    const normalizedQuery = historyQuery.trim().toLowerCase();
    return movements.filter((movement) => {
      const matchesQuery =
        !normalizedQuery ||
        `${movement.item} ${movement.note} ${movement.type}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesFilter =
        historyFilter === "all" || movement.type === historyFilter;
      const matchesDateRange =
        movement.dateKey >= historyDateRange.startDate &&
        movement.dateKey <= historyDateRange.endDate;
      return matchesQuery && matchesFilter && matchesDateRange;
    });
  }, [
    historyDateRange.endDate,
    historyDateRange.startDate,
    historyFilter,
    historyQuery,
    movements,
  ]);

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

  const changeHistoryPeriod = (nextPeriod: "today" | "month") => {
    setHistoryPeriod(nextPeriod);
    setHistoryDateRange(getPresetDateRange(getLocalDateKey(), nextPeriod));
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
          {formatThousands(item.stock)}
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
      flex: 1.2,
      minWidth: 110,
      align: "center",
      render: (item) => (
        <HStack style={styles.stockActions}>
          <AppPressable
            onPress={() => setModal({ mode: "correction", itemId: item.id })}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={`Sesuaikan stok ${item.name}`}
          >
            <AppIcon name="tune-variant" size={14} color={colors.primary} />
            <Text style={styles.actionButtonText}>Koreksi</Text>
          </AppPressable>
        </HStack>
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
        <Text style={styles.cellMuted}>{movement.time}</Text>
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
            {formatThousands(Math.abs(movement.quantity))}
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
      key: "note",
      title: "KETERANGAN / OLEH",
      flex: 1.2,
      minWidth: 160,
      render: (movement) => (
        <Text style={styles.cellMuted}>{movement.note}</Text>
      ),
    },
  ];

  const handleSaveStock = (draft: StockDraft) => {
    if (draft.mode === "purchase") {
      const now = new Date();
      const dateKey = getLocalDateKey(now);
      const time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      const selected = draft.newItem
        ? undefined
        : items.find((item) => item.id === draft.itemId);
      const customName = draft.newItem?.name.trim();
      if (
        draft.quantity <= 0 ||
        draft.totalCost <= 0 ||
        (!draft.newItem && !selected) ||
        (draft.newItem &&
          (!customName ||
            !draft.newItem.unit ||
            items.some(
              (item) => item.name.trim().toLowerCase() === customName.toLowerCase(),
            )))
      ) {
        return;
      }

      const stockUnitsPerPurchaseUnit = selected
        ? getStockUnitsPerPurchaseUnit(selected)
        : 1;
      const quantityInStockUnits = draft.quantity * stockUnitsPerPurchaseUnit;
      if (!Number.isSafeInteger(quantityInStockUnits) || quantityInStockUnits <= 0) return;
      const purchaseUnit = selected ? getPurchaseUnit(selected) : draft.newItem!.unit;
      const stockUnit = selected?.unit ?? draft.newItem!.unit;
      const itemName = customName ?? selected?.name ?? "bahan";
      const totalCost = draft.totalCost;
      const transactionStore = useTransactionStore.getState();
      if (draft.fundingSource === "cash" && !transactionStore.isCashRegisterOpen()) {
        showToast("Kasir belum dibuka", "Buka kasir di Kelola Kas sebelum membayar pembelian stok dari laci.", "error");
        return;
      }
      if (draft.fundingSource === "cash" && totalCost > transactionStore.getExpectedCash()) {
        showToast("Uang di laci tidak cukup", "Periksa nominal pembelian atau pilih transfer usaha.", "error");
        return;
      }
      useCashLedgerStore.getState().addStockPurchase({
        dateKey,
        timeLabel: dateKey + ", " + time + " WIB",
        description: `Beli ${draft.quantity} ${purchaseUnit} ${itemName}`,
        detail: `Masuk ${formatThousands(quantityInStockUnits)} ${stockUnit}`,
        source: draft.fundingSource,
        amount: totalCost,
      });
      if (draft.fundingSource === "cash") {
        transactionStore.recordCashOutflow(totalCost);
      }
      const purchaseItem: StockItem = draft.newItem
        ? {
            id: `stock-${Date.now()}`,
            name: customName!,
            description: "",
            stock: 0,
            unit: draft.newItem.unit,
            estDays: "—",
            avgPrice: 0,
            initials: customName!
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join(""),
          }
        : selected!;
      const costPerStockUnit = totalCost / quantityInStockUnits;
      const nextAverage = purchaseItem.stock > 0
        ? (purchaseItem.stock * purchaseItem.avgPrice + totalCost) /
          (purchaseItem.stock + quantityInStockUnits)
        : costPerStockUnit;
      const updatedItem = {
        ...purchaseItem,
        stock: purchaseItem.stock + quantityInStockUnits,
        avgPrice: nextAverage,
      };

      if (draft.newItem) {
        setItems((current) => [updatedItem, ...current]);
      } else {
        setItems((current) =>
          current.map((item) =>
            item.id === purchaseItem.id ? updatedItem : item,
          ),
        );
      }
      setInventoryPage(1);
      setMovements((current) => [
        {
          id: `movement-${Date.now()}`,
          dateKey,
          time: getStockMovementTime(dateKey, time),
          itemId: updatedItem.id,
          item: updatedItem.name,
          type: "purchase",
          quantity: quantityInStockUnits,
          unit: updatedItem.unit,
          note: `Beli ${draft.quantity} ${purchaseUnit} · ${formatCurrency(totalCost)} · ${draft.fundingSource === "cash" ? "Kas laci" : "Transfer"}`,
        },
        ...current,
      ]);
      setHistoryPage(1);
      setModal(null);
      showToast(
        draft.newItem ? "Bahan baru ditambahkan" : "Stok berhasil ditambahkan",
        draft.newItem
          ? `${updatedItem.name} dibuat dengan stok ${formatThousands(quantityInStockUnits)} ${updatedItem.unit}.`
          : `${updatedItem.name} bertambah ${draft.quantity} ${purchaseUnit} (${formatThousands(quantityInStockUnits)} ${updatedItem.unit}).`,
      );
      return;
    }

    const now = new Date();
    const dateKey = getLocalDateKey(now);
    const time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    const selected = items.find((item) => item.id === draft.itemId);
    if (!selected) return;

    const signedQuantity = draft.actualStock - selected.stock;
    const priceChanged = draft.purchaseUnitPrice !== Math.round(getPurchaseUnitPrice(selected));
    if (!signedQuantity && !priceChanged) return;
    const nextAverageCost = priceChanged
      ? draft.purchaseUnitPrice / getStockUnitsPerPurchaseUnit(selected)
      : selected.avgPrice;
    setItems((current) =>
      current.map((item) =>
        item.id === selected.id
          ? { ...item, stock: draft.actualStock, avgPrice: nextAverageCost }
          : item,
      ),
    );
    if (signedQuantity) {
      const notes = [
        draft.reason,
        draft.note,
        priceChanged ? `Harga modal ${formatCurrency(draft.purchaseUnitPrice)} / ${getPurchaseUnit(selected)}` : "",
      ].filter(Boolean);
      setMovements((current) => [
        {
          id: `movement-${Date.now()}`,
          dateKey,
          time: getStockMovementTime(dateKey, time),
          itemId: selected.id,
          item: selected.name,
          type: "correction",
          quantity: signedQuantity,
          unit: selected.unit,
          note: notes.join(" · "),
        },
        ...current,
      ]);
      setHistoryPage(1);
    }
    setModal(null);
    if (signedQuantity && priceChanged) {
      showToast(
        "Stok dan harga diperbarui",
        `${selected.name}: ${formatThousands(selected.stock)} → ${formatThousands(draft.actualStock)} ${selected.unit}; harga modal ${formatCurrency(draft.purchaseUnitPrice)} / ${getPurchaseUnit(selected)}.`,
      );
    } else if (signedQuantity) {
      showToast(
        "Koreksi stok tersimpan",
        `${selected.name}: ${formatThousands(selected.stock)} → ${formatThousands(draft.actualStock)} ${selected.unit}.`,
      );
    } else {
      showToast(
        "Harga modal diperbarui",
        `HPP ${selected.name} sekarang ${formatCurrency(draft.purchaseUnitPrice)} per ${getPurchaseUnit(selected)}.`,
      );
    }
  };

  return (
    <AppShell active="Stock" scrollable>
      <VStack style={styles.page}>
        <Panel style={styles.sectionPanel} padding={0}>
          <VStack>
            <HStack
              style={[
                styles.inventoryToolbar,
                isToolbarCompact && styles.inventoryToolbarMobile,
              ]}
            >
              <HStack
                style={[
                  styles.toolbarControls,
                  isToolbarCompact && styles.toolbarControlsMobile,
                ]}
              >
                <AppInput
                  value={query}
                  onChangeText={changeInventoryQuery}
                  placeholder="Cari bahan..."
                  variant="search"
                  style={[
                    styles.searchInput,
                    isToolbarCompact && styles.searchInputMobile,
                  ]}
                  leading={
                    <AppIcon
                      name="magnify"
                      size={17}
                      color={colors.inkSubtle}
                    />
                  }
                  accessibilityLabel="Cari bahan"
                />
                <Text
                  style={[
                    styles.resultCount,
                    isToolbarCompact && styles.resultCountMobile,
                  ]}
                  numberOfLines={1}
                >
                  {visibleItems.length} bahan
                </Text>
              </HStack>
              <AppPressable
                onPress={() =>
                  setModal({ mode: "purchase", itemId: items[0]?.id })
                }
                style={[
                  styles.primaryAction,
                  isToolbarCompact && styles.primaryActionFullWidth,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Tambah stok"
              >
                <AppIcon name="plus" size={15} color={colors.white} />
                <Text style={styles.primaryActionText}>
                  Tambah Stok
                </Text>
              </AppPressable>
            </HStack>

            <DataTable
              rows={visibleItems}
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
                onPageChange: setInventoryPage,
                itemLabel: "bahan",
              }}
              emptyState={
                <EmptyState
                  icon={items.length === 0 ? "package-variant-closed" : "magnify-close"}
                  title={items.length === 0 ? "Belum ada stok" : "Stok tidak ditemukan"}
                  compact
                />
              }
            />
          </VStack>
        </Panel>

        <Panel style={styles.sectionPanel} padding={0}>
          <VStack>
            <HStack
              style={[
                styles.historyToolbar,
                isCompact && styles.historyToolbarMobile,
              ]}
            >
              <VStack
                style={[
                  styles.toolbarHeading,
                  isCompact && styles.toolbarHeadingMobile,
                ]}
              >
                <HStack style={styles.historyTitleRow}>
                  <Text style={styles.historyTitle}>
                    Riwayat Mutasi Stok Terbaru
                  </Text>
                </HStack>
                <Text style={styles.sectionDescription}>
                  Pembelian, penjualan, dan koreksi stok bahan.
                </Text>
              </VStack>
              <HStack
                style={[
                  styles.historyControls,
                  isCompact && styles.historyControlsMobile,
                ]}
              >
                <HStack
                  style={[
                    styles.historySearchDateGroup,
                    isPhone && styles.historySearchDateGroupPhone,
                  ]}
                >
                  <AppInput
                    value={historyQuery}
                    onChangeText={changeHistoryQuery}
                    placeholder="Cari riwayat mutasi..."
                    variant="search"
                    style={[
                      styles.historySearchInput,
                      isCompact &&
                        !isPhone &&
                        styles.historySearchInputCompact,
                      isPhone && styles.historySearchInputMobile,
                    ]}
                    leading={
                      <AppIcon
                        name="magnify"
                        size={17}
                        color={colors.inkSubtle}
                      />
                    }
                    accessibilityLabel="Cari riwayat mutasi"
                  />
                  <DatePeriodFilter
                    period={historyPeriod}
                    dateRange={historyDateRange}
                    onSelectPreset={changeHistoryPeriod}
                    onOpenDatePicker={() => setHistoryDatePickerOpen(true)}
                  />
                </HStack>
                <SegmentedFilterGroup
                  options={historyFilters}
                  value={historyFilter}
                  onChange={changeHistoryFilter}
                  accessibilityLabel="Filter"
                  fullWidth={isPhone}
                />
              </HStack>
            </HStack>
            <DataTable
              rows={visibleMovements}
              columns={historyColumns}
              keyExtractor={(movement) => movement.id}
              width={historyWidth}
              minWidth={980}
              rowHeight={48}
              horizontalPadding={spacing.md}
              verticalPadding={spacing.xs}
              columnGap={spacing.sm}
              pagination={{
                page: historyPage,
                pageSize: stockTablePageSize,
                onPageChange: setHistoryPage,
                itemLabel: "mutasi",
              }}
              emptyState={
                <EmptyState
                  icon="clipboard-text-outline"
                  title="Belum ada mutasi"
                  compact
                />
              }
            />
          </VStack>
        </Panel>
      </VStack>

      {modal ? (
        <StockAdjustmentModal
          key={`${modal.mode}-${modal.itemId ?? "default"}`}
          mode={modal.mode}
          items={items}
          initialItemId={modal.itemId}
          height={height}
          onClose={() => setModal(null)}
          onSubmit={handleSaveStock}
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

      {toast ? (
        <View
          style={[styles.toast, toast.kind === "error" && styles.toastError]}
        >
          <AppIcon
            name={
              toast.kind === "success"
                ? "check-circle-outline"
                : "alert-circle-outline"
            }
            size={18}
            color={colors.white}
          />
          <VStack style={styles.toastCopy}>
            <Text style={styles.toastTitle}>{toast.title}</Text>
            <Text style={styles.toastMessage}>{toast.message}</Text>
          </VStack>
          <AppPressable
            onPress={() => setToast(null)}
            accessibilityRole="button"
            accessibilityLabel="Tutup notifikasi"
          >
            <AppIcon name="close" size={16} color="rgba(255,255,255,0.72)" />
          </AppPressable>
        </View>
      ) : null}
    </AppShell>
  );
}
