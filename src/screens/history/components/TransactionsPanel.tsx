import {
  HStack,
  Input,
  InputField,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useState } from "react";
import { FlatList, View, type ListRenderItem } from "react-native";
import { DropdownSelect, type DropdownOption } from "../../../components/dropdown-select";
import { AppIcon, AppPressable as Pressable, EmptyState, Panel } from "../../../components/ui";
import { colors } from "../../../theme";
import type { DateRange, HistoryOrder, PaymentFilter } from "../types";
import { formatDateRangeLabel } from "../utils/dateRange";
import { styles } from "../styles";
import { DateRangePickerModal } from "../../../components/date-range-picker/DateRangePickerModal";
import { TransactionCard } from "./TransactionCard";

type Props = {
  isWide: boolean;
  isMobile: boolean;
  isTablet: boolean;
  orders: HistoryOrder[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  query: string;
  onQueryChange: (query: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  paymentFilter: PaymentFilter;
  onPaymentFilterChange: (filter: PaymentFilter) => void;
};

const keyExtractor = (order: HistoryOrder) => order.id;
const renderTransaction: ListRenderItem<HistoryOrder> = ({ item }) => <TransactionCard order={item} />;
const renderSeparator = () => <View style={styles.transactionSeparator} />;
const renderEmpty = () => (
  <EmptyState
    icon="receipt-text-outline"
    title="Transaksi tidak ditemukan"
    compact
  />
);
const paymentOptions: DropdownOption<PaymentFilter>[] = [
  { value: "Semua metode", label: "Semua metode" },
  { value: "QRIS", label: "QRIS" },
  { value: "Tunai", label: "Tunai" },
];

export function TransactionsPanel({
  isWide,
  isMobile,
  isTablet,
  orders,
  total,
  page,
  pageSize,
  pageCount,
  onPageChange,
  query,
  onQueryChange,
  dateRange,
  onDateRangeChange,
  paymentFilter,
  onPaymentFilterChange,
}: Props) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [filterWidth, setFilterWidth] = useState(0);
  // Keep the three history filters on one line on tablet split layouts too.
  // Below this width, stacked controls remain easier to use on phones.
  const useFilterGrid = filterWidth >= 420;
  const dateButton = (
    <Pressable
      onPress={() => setIsDatePickerOpen(true)}
      style={styles.dateButton}
      accessibilityRole="button"
      accessibilityLabel={`Pilih rentang tanggal, ${formatDateRangeLabel(dateRange)}`}
      accessibilityState={{ expanded: isDatePickerOpen }}
    >
      <AppIcon name="calendar-outline" size={15} color={colors.primary} />
      <Text style={[styles.dateText, (isMobile || isTablet) && styles.readableTextAdaptive]} numberOfLines={1}>
        {formatDateRangeLabel(dateRange)}
      </Text>
      <AppIcon name="chevron-down" size={14} color={colors.inkMuted} />
    </Pressable>
  );

  return (
    <Panel style={[styles.historyPanel, isWide && styles.panelFill]} padding={14}>
      <HStack style={styles.historyHeader}>
        <HStack style={styles.titleIcon}>
          <AppIcon
            name="receipt-text-outline"
            size={18}
            color={colors.primary}
          />
        </HStack>
        <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
      </HStack>

      <HStack
        style={[
          styles.filterRow,
          useFilterGrid ? styles.filterRowThreeColumns : styles.filterRowStacked,
        ]}
        onLayout={({ nativeEvent }) => {
          const nextWidth = nativeEvent.layout.width;
          setFilterWidth((currentWidth) =>
            currentWidth === nextWidth ? currentWidth : nextWidth,
          );
        }}
      >
        <View
          style={[
            styles.filterCell,
            useFilterGrid && styles.filterCellGrid,
          ]}
        >
          <Input style={styles.searchInput}>
            <AppIcon name="magnify" size={17} color={colors.inkMuted} />
            <InputField
              value={query}
              onChangeText={onQueryChange}
              placeholder="Cari transaksi"
              placeholderTextColor={colors.inkSubtle}
              style={[styles.searchText, (isMobile || isTablet) && styles.readableTextAdaptive]}
            />
          </Input>
        </View>
        <View
          style={[
            styles.filterCell,
            useFilterGrid && styles.filterCellGrid,
          ]}
        >
          {dateButton}
        </View>
        <View
          style={[
            styles.filterCell,
            useFilterGrid && styles.filterCellGrid,
          ]}
        >
          <DropdownSelect
            options={paymentOptions}
            value={paymentFilter}
            onChange={onPaymentFilterChange}
            placeholder="Semua metode"
            accessibilityLabel="Filter metode pembayaran"
            fullWidth
            minWidth={156}
            leadingIcon="tune-variant"
          />
        </View>
      </HStack>

      {isWide ? (
        <FlatList
          data={orders}
          keyExtractor={keyExtractor}
          renderItem={renderTransaction}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmpty}
          style={styles.listScroll}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
          nestedScrollEnabled
        />
      ) : (
        <VStack style={styles.transactions}>
          {orders.length ? (
            orders.map((order) => (
              <TransactionCard key={order.id} order={order} density={isMobile ? "mobile" : isTablet ? "tablet" : "desktop"} />
            ))
          ) : (
            renderEmpty()
          )}
        </VStack>
      )}

      <HStack style={styles.historyPaginationFooter}>
        <Text style={styles.historyPaginationSummary}>
          {total === 0
            ? "Tidak ada transaksi"
            : `Menampilkan ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} dari ${total} transaksi`}
        </Text>
        <HStack style={styles.historyPaginationControls}>
          <Pressable
            onPress={() => onPageChange(page - 1)}
            disabled={page <= 1}
            style={[styles.historyPageButton, page <= 1 && styles.historyPageButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Halaman sebelumnya"
          >
            <AppIcon name="chevron-left" size={15} color={colors.inkMuted} />
          </Pressable>
          <Text style={styles.historyPageText}>{page} / {pageCount}</Text>
          <Pressable
            onPress={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            style={[styles.historyPageButton, page >= pageCount && styles.historyPageButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Halaman berikutnya"
          >
            <AppIcon name="chevron-right" size={15} color={colors.inkMuted} />
          </Pressable>
        </HStack>
      </HStack>

      {isDatePickerOpen ? (
        <DateRangePickerModal
          isOpen={isDatePickerOpen}
          initialRange={dateRange}
          onClose={() => setIsDatePickerOpen(false)}
          onApply={onDateRangeChange}
        />
      ) : null}
    </Panel>
  );
}
