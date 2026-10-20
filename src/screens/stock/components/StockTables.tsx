import { Text, VStack, HStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import {
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableFilterBar,
  DataTableFilterGrid,
  dataTableLayout,
  type DataTableColumn,
} from "../../../components/data-table";
import { AppIcon, AppInput, EmptyState } from "../../../components/ui";
import { DropdownFilter } from "../../../components/dropdown-filter";
import { DateRangeButton } from "../../../components/date-period-filter";
import { colors, spacing, typography } from "../../../theme";
import type { DateRange } from "../../../types/dateRange";
import { formatDateKey } from "../../../utils/date";
import { formatPreciseCurrency, formatQuantity } from "../../../utils/format";
import type { HistoryFilter, StockItem, StockMovement } from "../types";
import { DeleteStockItemModal } from "./DeleteStockItemModal";
import { styles } from "../styles";

export const movementLabels = {
  purchase: "Pembelian",
  sale: "Penjualan",
  correction: "Koreksi",
};
const labelStyle = { color: colors.ink, ...typography.label };
const mutedStyle = { color: colors.inkMuted, ...typography.helper };

type StockStatus = "available" | "low" | "empty";

function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "empty";
  if (stock <= 50) return "low";
  return "available";
}

function StockStatusChip({ stock }: { stock: number }) {
  const status = getStockStatus(stock);
  const labels: Record<StockStatus, string> = {
    available: "Tersedia",
    low: "Menipis",
    empty: "Habis",
  };
  const badgeStyles = {
    available: styles.statusBadgeSafe,
    low: styles.statusBadgeLow,
    empty: styles.statusBadgeEmpty,
  };
  const textStyles = {
    available: styles.statusBadgeTextSafe,
    low: styles.statusBadgeTextLow,
    empty: styles.statusBadgeTextEmpty,
  };

  return (
    <HStack style={[styles.statusBadge, badgeStyles[status]]}>
      <Text style={[styles.statusBadgeText, textStyles[status]]}>
        {labels[status]}
      </Text>
    </HStack>
  );
}

function MovementTypeChip({ type }: { type: StockMovement["type"] }) {
  const badgeStyle =
    type === "purchase"
      ? styles.typeBadgePurchase
      : type === "sale"
        ? styles.typeBadgeSale
        : styles.typeBadgeCorrection;
  const textStyle =
    type === "purchase"
      ? styles.typeBadgeTextPurchase
      : type === "sale"
        ? styles.typeBadgeTextSale
        : styles.typeBadgeTextCorrection;

  return (
    <HStack style={[styles.typeBadge, badgeStyle]}>
      <Text style={[styles.typeBadgeText, textStyle]}>
        {movementLabels[type]}
      </Text>
    </HStack>
  );
}

export function StockInventoryTable({
  items,
  loading,
  query,
  onQueryChange,
  page,
  total,
  onPageChange,
  onPurchase,
  onDetail,
  onDelete,
}: {
  items: StockItem[];
  loading: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  onPurchase: (item: StockItem) => void;
  onDetail: (item: StockItem) => void;
  onDelete: (item: StockItem) => Promise<void>;
}) {
  const [deleteItem, setDeleteItem] = useState<StockItem | null>(null);
  const { height } = useWindowDimensions();
  const identity = (item: StockItem) => (
    <VStack style={{ gap: 2 }}>
      <Text style={labelStyle}>{item.name}</Text>
      {item.description ? (
        <Text style={mutedStyle}>{item.description}</Text>
      ) : null}
    </VStack>
  );
  const balance = (item: StockItem) => (
    <Text style={labelStyle}>
      {formatQuantity(item.stock)} {item.unit}
    </Text>
  );
  const price = (item: StockItem) => (
    <Text style={mutedStyle}>
      {item.avgPrice > 0
        ? `${formatPreciseCurrency(item.avgPrice)} / ${item.unit}`
        : "Belum tercatat"}
    </Text>
  );
  const actions = (item: StockItem) => (
    <DataTableActions>
      <DataTableActionButton
        action="add"
        label={`Tambah stok ${item.name}`}
        onPress={() => onPurchase(item)}
      />
      <DataTableActionButton
        action="edit"
        label={`Edit bahan ${item.name}`}
        onPress={() => onDetail(item)}
      />
      <DataTableActionButton
        action="delete"
        label={`Hapus bahan ${item.name}`}
        onPress={() => setDeleteItem(item)}
      />
    </DataTableActions>
  );
  const columns: DataTableColumn<StockItem>[] = [
    { key: "name", title: "BAHAN", flex: 2.4, minWidth: 200, render: identity },
    {
      key: "stock",
      title: "STOK SAAT INI",
      flex: 1.2,
      minWidth: 130,
      render: balance,
    },
    {
      key: "status",
      title: "STATUS",
      flex: 0.9,
      minWidth: 104,
      render: (item) => <StockStatusChip stock={item.stock} />,
    },
    {
      key: "cost",
      title: "HARGA MODAL",
      flex: 1.4,
      minWidth: 150,
      render: price,
    },
    {
      key: "action",
      title: "AKSI",
      width: 144,
      align: "right",
      render: actions,
    },
  ];
  return (
    <>
      <DataTableFilterBar>
        <DataTableFilterGrid>
          <AppInput
            value={query}
            onChangeText={onQueryChange}
            variant="search"
            placeholder="Cari bahan"
            accessibilityLabel="Cari bahan stok"
            leading={
              <AppIcon name="magnify" size={16} color={colors.inkSubtle} />
            }
          />
        </DataTableFilterGrid>
      </DataTableFilterBar>
      <DataTable
        rows={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        minWidth={800}
        loading={loading}
        {...dataTableLayout}
        pagination={{
          page,
          pageSize: 10,
          totalItems: total,
          onPageChange,
          itemLabel: "bahan",
        }}
        emptyState={
          <EmptyState
            icon="package-variant-closed"
            title={query ? "Bahan tidak ditemukan" : "Belum ada bahan"}
            description={
              query
                ? "Coba nama bahan lain."
                : "Pilih Bahan Baru untuk mulai mencatat persediaan."
            }
            compact
          />
        }
        renderCompactRow={(item) => (
          <VStack style={{ width: "100%", gap: spacing.xs }}>
            <HStack style={{ gap: spacing.sm }}>
              <View style={{ flex: 1 }}>{identity(item)}</View>
              {balance(item)}
            </HStack>
            <HStack
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                gap: spacing.xs,
              }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>{price(item)}</View>
              <StockStatusChip stock={item.stock} />
              {actions(item)}
            </HStack>
          </VStack>
        )}
      />
      {deleteItem ? (
        <DeleteStockItemModal
          item={deleteItem}
          height={height}
          onClose={() => setDeleteItem(null)}
          onDelete={async () => {
            await onDelete(deleteItem);
            setDeleteItem(null);
          }}
        />
      ) : null}
    </>
  );
}

export function StockHistoryTable({
  movements,
  loading,
  query,
  onQueryChange,
  type,
  onTypeChange,
  dateRange,
  onOpenDatePicker,
  page,
  total,
  onPageChange,
  onDetail,
}: {
  movements: StockMovement[];
  loading: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  type: HistoryFilter;
  onTypeChange: (value: HistoryFilter) => void;
  dateRange: DateRange;
  onOpenDatePicker: () => void;
  page: number;
  total: number;
  onPageChange: (value: number) => void;
  onDetail: (movement: StockMovement) => void;
}) {
  const quantity = (entry: StockMovement) => (
    <Text style={labelStyle}>
      {entry.quantity > 0 ? "+" : ""}
      {formatQuantity(entry.quantity)} {entry.unit}
    </Text>
  );
  const columns: DataTableColumn<StockMovement>[] = [
    {
      key: "date",
      title: "TANGGAL & WAKTU",
      width: 160,
      render: (entry) => (
        <Text style={mutedStyle}>
          {formatDateKey(entry.dateKey)}, {entry.time}
        </Text>
      ),
    },
    {
      key: "item",
      title: "BAHAN",
      flex: 1.5,
      minWidth: 200,
      render: (entry) => <Text style={labelStyle}>{entry.item}</Text>,
    },
    {
      key: "note",
      title: "KETERANGAN",
      flex: 1.7,
      minWidth: 190,
      render: (entry) => (
        <Text style={mutedStyle} numberOfLines={1}>
          {entry.note || "—"}
        </Text>
      ),
    },
    {
      key: "type",
      title: "JENIS",
      width: 130,
      render: (entry) => <MovementTypeChip type={entry.type} />,
    },
    {
      key: "quantity",
      title: "PERUBAHAN STOK",
      minWidth: 140,
      flex: 1,
      align: "right",
      render: quantity,
    },
    {
      key: "detail",
      title: "AKSI",
      width: 60,
      align: "center",
      render: (entry) => (
        <DataTableActionButton
          action="detail"
          label={`Detail mutasi ${entry.item}`}
          onPress={() => onDetail(entry)}
        />
      ),
    },
  ];
  return (
    <>
      <DataTableFilterBar>
        <DataTableFilterGrid>
          <AppInput
            value={query}
            onChangeText={onQueryChange}
            variant="search"
            placeholder="Cari bahan atau catatan"
            accessibilityLabel="Cari riwayat stok"
            leading={
              <AppIcon name="magnify" size={16} color={colors.inkSubtle} />
            }
          />
          <DateRangeButton
            dateRange={dateRange}
            onPress={onOpenDatePicker}
            fullWidth
          />
          <DropdownFilter
            value={type}
            options={[
              { key: "all", label: "Semua transaksi" },
              ...Object.entries(movementLabels).map(([key, label]) => ({
                key: key as HistoryFilter,
                label,
              })),
            ]}
            onChange={onTypeChange}
            accessibilityLabel="Jenis transaksi stok"
            fullWidth
          />
        </DataTableFilterGrid>
      </DataTableFilterBar>
      <DataTable
        rows={movements}
        columns={columns}
        keyExtractor={(entry) => entry.id}
        minWidth={960}
        loading={loading}
        {...dataTableLayout}
        pagination={{
          page,
          pageSize: 10,
          totalItems: total,
          onPageChange,
          itemLabel: "transaksi",
        }}
        emptyState={
          <EmptyState
            icon="history"
            title="Belum ada transaksi"
            description="Coba rentang tanggal atau pencarian lain."
            compact
          />
        }
        renderCompactRow={(entry) => (
          <VStack style={{ width: "100%", gap: spacing.sm }}>
            <HStack
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                gap: spacing.sm,
              }}
            >
              <Text style={[labelStyle, { flex: 1 }]}>{entry.item}</Text>
              <MovementTypeChip type={entry.type} />
              <Text style={mutedStyle}>
                {formatDateKey(entry.dateKey)}, {entry.time}
              </Text>
            </HStack>
            <HStack
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                gap: spacing.sm,
              }}
            >
              <VStack style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text style={mutedStyle}>Keterangan</Text>
                <Text style={mutedStyle} numberOfLines={1}>
                  {entry.note || "—"}
                </Text>
              </VStack>
              {quantity(entry)}
              <DataTableActionButton
                action="detail"
                label={`Detail mutasi ${entry.item}`}
                onPress={() => onDetail(entry)}
              />
            </HStack>
          </VStack>
        )}
      />
    </>
  );
}
