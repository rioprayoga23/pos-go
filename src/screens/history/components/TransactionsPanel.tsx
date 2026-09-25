import {
  HStack,
  Input,
  InputField,
  Popover,
  PopoverBackdrop,
  PopoverBody,
  PopoverContent,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useState } from "react";
import { FlatList, View, type ListRenderItem } from "react-native";
import { AppIcon, AppPressable as Pressable, Panel } from "../../../components/ui";
import { colors } from "../../../theme";
import { Order } from "../../../types/pos";
import type { DateRange, PaymentFilter } from "../types";
import { formatDateRangeLabel } from "../utils/dateRange";
import { styles } from "../styles";
import { DateRangePickerModal } from "../../../components/date-range-picker/DateRangePickerModal";
import { TransactionCard } from "./TransactionCard";

type Props = {
  isWide: boolean;
  isCompact: boolean;
  isMobile: boolean;
  isTablet: boolean;
  orders: Order[];
  query: string;
  onQueryChange: (query: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  paymentFilter: PaymentFilter;
  onPaymentFilterChange: (filter: PaymentFilter) => void;
};

const keyExtractor = (order: Order) => order.id;
const renderTransaction: ListRenderItem<Order> = ({ item }) => <TransactionCard order={item} />;
const renderSeparator = () => <View style={styles.transactionSeparator} />;
const renderEmpty = () => (
  <Text style={styles.emptyText}>Transaksi tidak ditemukan.</Text>
);
const paymentOptions: PaymentFilter[] = ["Semua Bayar", "QRIS", "Tunai"];

export function TransactionsPanel({
  isWide,
  isCompact,
  isMobile,
  isTablet,
  orders,
  query,
  onQueryChange,
  dateRange,
  onDateRangeChange,
  paymentFilter,
  onPaymentFilterChange,
}: Props) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPaymentMenuOpen, setIsPaymentMenuOpen] = useState(false);
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
      <HStack style={[styles.historyHeader, isCompact && styles.historyHeaderCompact]}>
        <HStack style={styles.titleIcon}>
          <AppIcon
            name="receipt-text-outline"
            size={18}
            color={colors.primary}
          />
        </HStack>
        <Text style={[styles.pageTitle, isTablet && styles.pageTitleTablet]}>Riwayat Transaksi</Text>
        {!isCompact ? dateButton : null}
      </HStack>
      {isCompact ? <HStack style={styles.compactDateRow}>{dateButton}</HStack> : null}

      <HStack style={styles.filterRow}>
        <Input style={styles.searchInput}>
          <AppIcon name="magnify" size={17} color={colors.inkMuted} />
          <InputField
            value={query}
            onChangeText={onQueryChange}
            placeholder="Cari ID Bill (#B-042), antrean, atau menu..."
            placeholderTextColor={colors.inkSubtle}
            style={[styles.searchText, (isMobile || isTablet) && styles.readableTextAdaptive]}
          />
        </Input>
        <Popover
          placement="bottom right"
          offset={6}
          isOpen={isPaymentMenuOpen}
          onOpen={() => setIsPaymentMenuOpen(true)}
          onClose={() => setIsPaymentMenuOpen(false)}
          trigger={(triggerProps) => (
            <Pressable
              {...triggerProps}
              style={styles.filterButton}
              accessibilityRole="button"
              accessibilityLabel={`Filter metode pembayaran, ${paymentFilter}`}
              accessibilityState={{ expanded: isPaymentMenuOpen }}
            >
              <AppIcon name="tune-variant" size={16} color={colors.primary} />
              <Text style={[styles.filterText, (isMobile || isTablet) && styles.readableTextAdaptive]}>{paymentFilter}</Text>
            </Pressable>
          )}
        >
          <PopoverBackdrop />
          <PopoverContent style={styles.filterPopover}>
            <PopoverBody style={styles.filterPopoverBody}>
              {paymentOptions.map((option) => {
                const isActive = option === paymentFilter;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      onPaymentFilterChange(option);
                      setIsPaymentMenuOpen(false);
                    }}
                    style={[
                      styles.filterOption,
                      isActive && styles.filterOptionActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                      <Text
                        style={[
                          styles.filterOptionText,
                          (isMobile || isTablet) && styles.readableTextAdaptive,
                          isActive && styles.filterOptionTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                    {isActive ? (
                      <AppIcon name="check" size={15} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </PopoverBody>
          </PopoverContent>
        </Popover>
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
