import {
  HStack,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import {
  AppIcon,
  AppInput,
  AppPressable,
  EmptyState,
} from "../../../components/ui";
import {
  DataTable,
  DataTableFilterBar,
  DataTableFilterGrid,
  DataTableSection,
  type DataTableColumn,
} from "../../../components/data-table";
import { DateRangeButton } from "../../../components/date-period-filter";
import { DropdownFilter } from "../../../components/dropdown-filter";
import { colors, spacing } from "../../../theme";
import type { CashTransaction } from "../../../types/cash";
import type { DatePeriod, DateRange } from "../../../types/dateRange";
import { formatCurrency } from "../../../utils/format";
import type { CashTransactionFilter } from "../hooks/useCashLedger";
import { getCashDateLabel, getCashSourceLabel } from "../utils/transactionDisplay";
import { styles } from "../styles";

const filterOptions: { key: CashTransactionFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "stock_purchase", label: "Pembelian Stok" },
  { key: "operational", label: "Operasional" },
];

function CashCategoryBadge({ transaction }: { transaction: CashTransaction }) {
  const isOperational = transaction.categoryKind === "operational";
  return (
    <HStack
      style={[
        styles.categoryBadge,
        isOperational && styles.categoryBadgeOperational,
      ]}
    >
      <Text
        style={[
          styles.categoryText,
          isOperational && styles.categoryTextOperational,
        ]}
        numberOfLines={1}
      >
        {transaction.category}
      </Text>
    </HStack>
  );
}

function CashSourceBadge({ transaction }: { transaction: CashTransaction }) {
  const isTransfer = transaction.source === "transfer";
  return (
    <HStack
      style={[styles.sourceBadge, isTransfer && styles.sourceBadgeTransfer]}
    >
      <Text
        style={[styles.sourceText, isTransfer && styles.sourceTextTransfer]}
        numberOfLines={1}
      >
        {getCashSourceLabel(transaction.source)}
      </Text>
    </HStack>
  );
}

function createCashColumns(
  onOpenTransaction: (transaction: CashTransaction) => void,
): DataTableColumn<CashTransaction>[] {
  return [
    {
      key: "date",
      title: "TANGGAL & WAKTU",
      width: 166,
      render: (transaction) => (
        <Text style={styles.tableDate}>
          {getCashDateLabel(transaction.dateKey, transaction.time)}
        </Text>
      ),
    },
    {
      key: "description",
      title: "KETERANGAN",
      flex: 2.4,
      minWidth: 260,
      render: (transaction) => (
        <VStack>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text style={styles.transactionDetail} numberOfLines={1}>
            {transaction.detail}
          </Text>
        </VStack>
      ),
    },
    {
      key: "category",
      title: "KATEGORI",
      flex: 1.5,
      minWidth: 175,
      render: (transaction) => (
        <CashCategoryBadge transaction={transaction} />
      ),
    },
    {
      key: "source",
      title: "SUMBER DANA",
      flex: 1.7,
      minWidth: 205,
      render: (transaction) => <CashSourceBadge transaction={transaction} />,
    },
    {
      key: "amount",
      title: "NOMINAL",
      width: 140,
      align: "right",
      render: (transaction) => (
        <Text style={[styles.amountText, { textAlign: "right" }]}>
          {formatCurrency(transaction.amount)}
        </Text>
      ),
    },
    {
      key: "action",
      title: "AKSI",
      width: 60,
      align: "center",
      render: (transaction) => (
        <AppPressable
          onPress={() => onOpenTransaction(transaction)}
          style={styles.detailButton}
          accessibilityRole="button"
          accessibilityLabel={`Detail transaksi ${transaction.description}`}
        >
          <Text style={styles.detailButtonText}>Detail</Text>
        </AppPressable>
      ),
    },
  ];
}

export function CashLedgerPanel({
  transactions,
  rangedTransactions,
  period,
  dateRange,
  filter,
  query,
  page,
  pageSize,
  onFilterChange,
  onQueryChange,
  onPageChange,
  onOpenTransaction,
  onOpenDatePicker,
}: {
  transactions: CashTransaction[];
  rangedTransactions: CashTransaction[];
  period: DatePeriod;
  dateRange: DateRange;
  filter: CashTransactionFilter;
  query: string;
  page: number;
  pageSize: number;
  onFilterChange: (filter: CashTransactionFilter) => void;
  onQueryChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onOpenTransaction: (transaction: CashTransaction) => void;
  onOpenDatePicker: () => void;
}) {
  const columns = createCashColumns(onOpenTransaction);
  const stockCount = rangedTransactions.filter(
    (transaction) => transaction.categoryKind === "stock_purchase",
  ).length;
  const operationalCount = rangedTransactions.length - stockCount;
  const filters = filterOptions.map((option) => {
    const count =
      option.key === "all"
        ? rangedTransactions.length
        : option.key === "stock_purchase"
          ? stockCount
          : operationalCount;
    return { ...option, count };
  });
  return (
    <DataTableSection
      title="Riwayat Transaksi"
      description="Pengeluaran stok dan operasional yang tercatat pada outlet."
    >
      <VStack>
        <DataTableFilterBar>
          <DataTableFilterGrid>
            <AppInput
              value={query}
              onChangeText={onQueryChange}
              placeholder="Cari transaksi"
              variant="search"
              style={styles.searchInputFilter}
              inputStyle={styles.searchText}
              leading={
                <AppIcon name="magnify" size={16} color={colors.inkSubtle} />
              }
              accessibilityLabel="Cari transaksi kas"
            />
            <DateRangeButton
              dateRange={dateRange}
              onPress={onOpenDatePicker}
              selected={period === "custom"}
              fullWidth
            />
            <DropdownFilter
              options={filters}
              value={filter}
              onChange={onFilterChange}
              accessibilityLabel="Filter transaksi"
              fullWidth
            />
          </DataTableFilterGrid>
        </DataTableFilterBar>
        <DataTable
          rows={transactions}
          columns={columns}
          keyExtractor={(transaction) => transaction.id}
          minWidth={1080}
          headerHeight={40}
          rowHeight={55}
          horizontalPadding={spacing.md}
          verticalPadding={spacing.xs}
          columnGap={spacing.sm}
          pagination={{
            page,
            pageSize,
            onPageChange,
            itemLabel: "transaksi",
          }}
          emptyState={
            <EmptyState
              icon="cash-register"
              title="Transaksi tidak ditemukan"
              compact
            />
          }
        />
      </VStack>
    </DataTableSection>
  );
}
