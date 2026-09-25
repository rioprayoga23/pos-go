import type { NativeStackScreenProps } from "@react-navigation/native-stack";
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
  Panel,
} from "../../components/ui";
import type { RootStackParamList } from "../../navigation/types";
import { DateRangePickerModal } from "../../components/date-range-picker/DateRangePickerModal";
import { defaultHistoryDate } from "../history/data/transactions";
import type { DatePeriod, DateRange } from "../../types/dateRange";
import { getPresetDateRange } from "../../utils/date";
import { colors, spacing } from "../../theme";
import { formatCurrency } from "../../utils/format";
import { useCashLedgerStore } from "../../store/cashLedgerStore";
import { StockAdjustmentModal } from "./components/StockAdjustmentModal";
import type { HistoryFilter, InventoryCategory, ModalMode, StockDraft, StockItem, StockMovement } from "./types";
import { isLowStock } from "./utils/stock";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Stock">;

const categoryOptions: ("Semua Kategori" | InventoryCategory)[] = [
  "Semua Kategori",
  "Bubuk / Sachet",
  "Bahan Minuman",
  "Biji Kopi",
  "Dairy / Susu",
  "Kemasan",
  "Es Batu",
  "Lainnya",
];


const historyFilters: { key: HistoryFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "purchase", label: "Masuk / Beli" },
  { key: "sale", label: "Keluar / POS" },
  { key: "correction", label: "Koreksi / Waste" },
];

const stockTablePageSize = 10;

const initialStockItems: StockItem[] = [
  {
    id: "matcha-35",
    name: "Matcha 35g",
    description: "Powder premix sachet",
    category: "Bubuk / Sachet",
    stock: 35,
    unit: "sachet",
    estDays: "~5 hari",
    avgPrice: 6500,
    initials: "MA",
  },
  {
    id: "americano-35",
    name: "Americano 35g",
    description: "House blend soluble",
    category: "Bubuk / Sachet",
    stock: 28,
    unit: "sachet",
    estDays: "~4 hari",
    avgPrice: 5000,
    initials: "AM",
  },
  {
    id: "taro-35",
    name: "Taro 35g",
    description: "Sweet purple taro",
    category: "Bubuk / Sachet",
    stock: 18,
    unit: "sachet",
    estDays: "~3 hari",
    avgPrice: 5800,
    initials: "TA",
  },
  {
    id: "avocado-35",
    name: "Avocado 35g",
    description: "Avocado milk blend",
    category: "Bubuk / Sachet",
    stock: 12,
    unit: "sachet",
    estDays: "< 1 hari",
    avgPrice: 6200,
    initials: "AV",
  },
  {
    id: "kopi-espresso-1kg",
    name: "Biji Kopi Espresso 1kg",
    description: "Arabica Robusta 70:30 roast",
    category: "Biji Kopi",
    stock: 6,
    unit: "kg",
    estDays: "~6 hari",
    avgPrice: 95000,
    initials: "BK",
  },
  {
    id: "fresh-milk-1l",
    name: "Fresh Milk Barista 1L",
    description: "Pasteurized fresh milk",
    category: "Dairy / Susu",
    stock: 14,
    unit: "liter",
    estDays: "~2 hari",
    avgPrice: 18500,
    initials: "FM",
  },
  {
    id: "sirup-aren-5l",
    name: "Sirup Gula Aren 5L",
    description: "Jerigen premium brown sugar",
    category: "Bahan Minuman",
    stock: 3,
    unit: "jerigen",
    estDays: "~7 hari",
    avgPrice: 110000,
    initials: "GA",
  },
  {
    id: "cup-boba-16oz",
    name: "Cup Plastik Boba 16oz",
    description: "Custom logo YoSher Go",
    category: "Kemasan",
    stock: 120,
    unit: "pcs",
    estDays: "~4 hari",
    avgPrice: 2000,
    initials: "CP",
  },
  {
    id: "tutup-cup-lid",
    name: "Tutup Cup Lid",
    description: "Flat lid transparent 16oz",
    category: "Kemasan",
    stock: 150,
    unit: "pcs",
    estDays: "~5 hari",
    avgPrice: 1500,
    initials: "TC",
  },
  {
    id: "es-batu-10kg",
    name: "Es Batu Kristal 10kg",
    description: "Ice tube supplier higienis",
    category: "Es Batu",
    stock: 8,
    unit: "pack",
    estDays: "~1 hari",
    avgPrice: 3500,
    initials: "ES",
  },
];

const initialMovements: StockMovement[] = [
  {
    id: "movement-1",
    dateKey: defaultHistoryDate,
    time: "Hari ini, 10:20 WIB",
    itemId: "avocado-35",
    item: "Avocado 35g",
    category: "Bubuk / Sachet",
    type: "correction",
    quantity: -2,
    unit: "sachet",
    note: "Kemasan robek (Sarah Putri)",
  },
  {
    id: "movement-2",
    dateKey: defaultHistoryDate,
    time: "Hari ini, 09:42 WIB",
    itemId: "fresh-milk-1l",
    item: "Fresh Milk Barista 1L",
    category: "Dairy / Susu",
    type: "purchase",
    quantity: 6,
    unit: "liter",
    note: "Restok Pagi CV Berkah Makmur",
  },
  {
    id: "movement-3",
    dateKey: defaultHistoryDate,
    time: "Hari ini, 09:15 WIB",
    itemId: "cup-boba-16oz",
    item: "Cup Plastik Boba 16oz",
    category: "Kemasan",
    type: "sale",
    quantity: -14,
    unit: "pcs",
    note: "Sistem Otomatis (Batch Order #042)",
  },
  {
    id: "movement-4",
    dateKey: defaultHistoryDate,
    time: "Hari ini, 08:30 WIB",
    itemId: "matcha-35",
    item: "Matcha 35g",
    category: "Bubuk / Sachet",
    type: "purchase",
    quantity: 15,
    unit: "sachet",
    note: "Belanja Restok (Sarah Putri)",
  },
  {
    id: "movement-5",
    dateKey: "2024-10-23",
    time: "Kemarin, 16:45 WIB",
    itemId: "es-batu-10kg",
    item: "Es Batu Kristal 10kg",
    category: "Es Batu",
    type: "sale",
    quantity: -4,
    unit: "pack",
    note: "Pemakaian Operasional Shift 2",
  },
];


export function StockScreen(_props: Props) {
  const { height, width } = useWindowDimensions();
  const [items, setItems] = useState(initialStockItems);
  const [movements, setMovements] = useState(initialMovements);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "Semua Kategori" | InventoryCategory
  >("Semua Kategori");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyPeriod, setHistoryPeriod] = useState<DatePeriod>("today");
  const [historyDateRange, setHistoryDateRange] = useState<DateRange>(() =>
    getPresetDateRange(defaultHistoryDate, "today"),
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
    return items.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        `${item.name} ${item.description} ${item.category} ${item.unit}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        categoryFilter === "Semua Kategori" || item.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [categoryFilter, items, query]);

  const visibleMovements = useMemo(() => {
    const normalizedQuery = historyQuery.trim().toLowerCase();
    return movements.filter((movement) => {
      const matchesQuery =
        !normalizedQuery ||
        `${movement.item} ${movement.category} ${movement.note} ${movement.type}`
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
    setHistoryDateRange(getPresetDateRange(defaultHistoryDate, nextPeriod));
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
          {item.stock}
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
      title: "HARGA SATUAN",
      flex: 2,
      minWidth: 140,
      render: (item) => (
        <Text style={styles.cellPrice}>{formatCurrency(item.avgPrice)}</Text>
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
              {low ? "Menipis" : "Aman"}
            </Text>
          </HStack>
        );
      },
    },
    {
      key: "action",
      title: "AKSI",
      flex: 1.2,
      minWidth: 90,
      align: "center",
      render: (item) => (
        <AppPressable
          onPress={() => setModal({ mode: "correction", itemId: item.id })}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel={`Koreksi ${item.name}`}
        >
          <AppIcon name="pencil-outline" size={12} color={colors.primary} />
          <Text style={styles.actionButtonText}>Koreksi</Text>
        </AppPressable>
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
          <Text style={styles.itemDescription}>{movement.category}</Text>
        </VStack>
      ),
    },
    {
      key: "type",
      title: "JENIS MUTASI",
      flex: 1.8,
      minWidth: 132,
      render: (movement) => {
        const typeLabel =
          movement.type === "purchase"
            ? "Pembelian"
            : movement.type === "sale"
              ? "Penjualan POS"
              : "Koreksi Rusak";
        const typeColor =
          movement.type === "purchase"
            ? colors.success
            : movement.type === "correction"
              ? colors.warning
              : colors.inkMuted;
        return (
          <HStack
            style={[
              styles.typeBadge,
              movement.type === "correction"
                ? styles.typeBadgeCorrection
                : movement.type === "sale"
                  ? styles.typeBadgeSale
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
            {movement.quantity > 0 ? "+" : ""}
            {movement.quantity}
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
            movement.type === "sale" && styles.cellDanger,
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
    if (!draft.quantity) return;

    if (draft.mode === "purchase") {
      const selected = draft.newItem
        ? undefined
        : items.find((item) => item.id === draft.itemId);
      const customName = draft.newItem?.name.trim();
      if (
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

      const totalCost =
        draft.priceMode === "unit"
          ? draft.quantity * draft.priceValue
          : draft.priceValue;
      useCashLedgerStore.getState().addStockPurchase({
        dateKey: defaultHistoryDate,
        timeLabel: draft.time,
        description: `Beli ${draft.quantity} ${draft.newItem?.unit ?? selected?.unit ?? "item"} ${draft.newItem?.name ?? selected?.name ?? "bahan"}`,
        detail: draft.note || "Sinkron dari inventaris stok",
        source: draft.fundingSource,
        amount: totalCost,
      });
      const nextUnitPrice =
        draft.priceMode === "unit"
          ? draft.priceValue || selected?.avgPrice || 0
          : draft.quantity > 0 && draft.priceValue > 0
            ? Math.round(draft.priceValue / draft.quantity)
            : selected?.avgPrice || 0;
      const purchaseItem: StockItem = draft.newItem
        ? {
            id: `stock-${Date.now()}`,
            name: customName!,
            description: "",
            category: "Lainnya",
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
      const nextAverage =
        purchaseItem.stock > 0
          ? Math.round(
              (purchaseItem.stock * purchaseItem.avgPrice +
                draft.quantity * nextUnitPrice) /
                (purchaseItem.stock + draft.quantity),
            )
          : nextUnitPrice;
      const updatedItem = {
        ...purchaseItem,
        stock: purchaseItem.stock + draft.quantity,
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
          dateKey: defaultHistoryDate,
          time: draft.time || "Baru saja",
          itemId: updatedItem.id,
          item: updatedItem.name,
          category: updatedItem.category,
          type: "purchase",
          quantity: draft.quantity,
          unit: updatedItem.unit,
          note: `${draft.note || "Belanja restok"} (${draft.fundingSource === "cash" ? "Kas Laci" : "Transfer Usaha"} · ${formatCurrency(totalCost)})`,
        },
        ...current,
      ]);
      setHistoryPage(1);
      setModal(null);
      showToast(
        draft.newItem ? "Bahan baru ditambahkan" : "Stok berhasil ditambahkan",
        draft.newItem
          ? `${updatedItem.name} dibuat dengan stok ${draft.quantity} ${updatedItem.unit}.`
          : `${updatedItem.name} bertambah ${draft.quantity} ${updatedItem.unit}.`,
      );
      return;
    }

    const selected = items.find((item) => item.id === draft.itemId);
    if (!selected) return;
    const signedQuantity =
      draft.direction === "subtract" ? -draft.quantity : draft.quantity;
    setItems((current) =>
      current.map((item) =>
        item.id === selected.id
          ? { ...item, stock: Math.max(0, item.stock + signedQuantity) }
          : item,
      ),
    );
    setMovements((current) => [
      {
        id: `movement-${Date.now()}`,
        dateKey: defaultHistoryDate,
        time: draft.time || "Baru saja",
        itemId: selected.id,
        item: selected.name,
        category: selected.category,
        type: "correction",
        quantity: signedQuantity,
        unit: selected.unit,
        note: `${draft.reason}${draft.note ? ` (${draft.note})` : ""}`,
      },
      ...current,
    ]);
    setHistoryPage(1);
    setModal(null);
    showToast(
      "Koreksi stok tersimpan",
      `${selected.name} disesuaikan ${Math.abs(signedQuantity)} ${selected.unit}.`,
    );
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
                  categoryOpen && styles.toolbarControlsDropdownOpen,
                ]}
              >
                <AppInput
                  value={query}
                  onChangeText={changeInventoryQuery}
                  placeholder="Cari bahan baku atau kemasan..."
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
                  accessibilityLabel="Cari bahan baku atau kemasan"
                />
                <VStack
                  style={[
                    styles.categoryControlWrap,
                    isToolbarCompact && styles.categoryControlWrapMobile,
                  ]}
                >
                  <AppPressable
                    onPress={() => setCategoryOpen((current) => !current)}
                    style={styles.selectControl}
                    accessibilityRole="button"
                    accessibilityLabel="Pilih kategori persediaan"
                  >
                    <Text style={styles.selectControlText} numberOfLines={1}>
                      {categoryFilter}
                    </Text>
                    <AppIcon
                      name="chevron-down"
                      size={16}
                      color={colors.inkMuted}
                    />
                  </AppPressable>
                  {categoryOpen ? (
                    <VStack style={styles.categoryMenu}>
                      {categoryOptions.map((option) => (
                        <AppPressable
                          key={option}
                          onPress={() => {
                            setCategoryFilter(option);
                            setInventoryPage(1);
                            setCategoryOpen(false);
                          }}
                          style={[
                            styles.categoryMenuItem,
                            option === categoryFilter &&
                              styles.categoryMenuItemActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryMenuText,
                              option === categoryFilter &&
                                styles.categoryMenuTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </AppPressable>
                      ))}
                    </VStack>
                  ) : null}
                </VStack>
                <Text
                  style={[
                    styles.resultCount,
                    isToolbarCompact && styles.resultCountMobile,
                  ]}
                  numberOfLines={1}
                >
                  {visibleItems.length} item cocok
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
                accessibilityLabel="Catat pembelian stok"
              >
                <AppIcon name="plus" size={15} color={colors.white} />
                <Text style={styles.primaryActionText}>
                  Catat Pembelian Stok
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
              getRowStyle={(item) =>
                item.id === "matcha-35" ? styles.inventoryRowSelected : null
              }
              emptyState={
                <Text style={styles.emptyTableText}>
                  Tidak ada item yang cocok dengan pencarian.
                </Text>
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
                  Log pergerakan belanja, otomatisasi POS kasir, dan penyesuaian
                  opname.
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
                <Text style={styles.emptyTableText}>
                  Belum ada mutasi dengan filter ini.
                </Text>
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
