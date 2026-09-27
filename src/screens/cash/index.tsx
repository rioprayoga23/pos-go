import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { AppShell } from "../../components/app-shell";
import { DateRangePickerModal } from "../../components/date-range-picker/DateRangePickerModal";
import {
  AppIcon,
  AppModalCloseButton,
  AppPressable,
  Panel,
} from "../../components/ui";
import { useCashLedgerStore } from "../../store/cashLedgerStore";
import { useTransactionStore } from "../../store/transactionStore";
import { colors } from "../../theme";
import type { CashTransaction } from "../../types/cash";
import { formatCurrency } from "../../utils/format";
import {
  AddExpenseModal,
  type OperationalExpenseDraft,
} from "./components/AddExpenseModal";
import { CashLedgerPanel } from "./components/CashLedgerPanel";
import { CashSummary } from "./components/CashSummary";
import { CashTransactionDetailModal } from "./components/CashTransactionDetailModal";
import { useCashLedger } from "./hooks/useCashLedger";
import { styles } from "./styles";

function CashRegisterSummary({
  isOpen,
  isClosedToday,
  openingCash,
  cashSales,
  cashOutflows,
  lastShiftReport,
}: {
  isOpen: boolean;
  isClosedToday: boolean;
  openingCash: number | null;
  cashSales: number;
  cashOutflows: number;
  lastShiftReport: ReturnType<
    typeof useTransactionStore.getState
  >["lastShiftReport"];
}) {
  const statusColor = isOpen
    ? colors.success
    : isClosedToday
      ? colors.inkMuted
      : colors.primary;
  const title = isOpen
    ? "Kasir sedang buka"
    : isClosedToday
      ? "Kasir ditutup hari ini"
      : "Kasir belum dibuka";
  const message = isOpen
    ? "Perkiraan uang tunai di laci saat ini."
    : isClosedToday
      ? "Transaksi berikutnya dimulai pada hari operasional berikutnya."
      : "Buka kasir dari tombol di header sebelum menerima pembayaran.";
  const expectedCash = (openingCash ?? 0) + cashSales - cashOutflows;

  return (
    <Panel style={styles.registerSummary} padding={16}>
      <HStack style={styles.registerSummaryHeader}>
        <VStack style={styles.registerSummaryCopy}>
          <HStack style={styles.registerStatusLine}>
            <HStack
              style={[
                styles.registerStatusDot,
                { backgroundColor: statusColor },
              ]}
            />
            <Text style={styles.registerSummaryTitle}>{title}</Text>
          </HStack>
          <Text style={styles.registerSummaryDescription}>{message}</Text>
        </VStack>
        {isOpen ? (
          <VStack style={styles.registerExpected}>
            <Text style={styles.registerExpectedLabel}>PERKIRAAN DI LACI</Text>
            <Text style={styles.registerExpectedValue}>
              {formatCurrency(expectedCash)}
            </Text>
          </VStack>
        ) : null}
      </HStack>
      {isOpen ? (
        <HStack style={styles.registerBreakdown}>
          <VStack style={styles.registerBreakdownItem}>
            <Text style={styles.registerBreakdownLabel}>Uang awal</Text>
            <Text style={styles.registerBreakdownValue}>
              {formatCurrency(openingCash ?? 0)}
            </Text>
          </VStack>
          <VStack style={styles.registerBreakdownItem}>
            <Text style={styles.registerBreakdownLabel}>Penjualan tunai</Text>
            <Text style={styles.registerBreakdownValue}>
              + {formatCurrency(cashSales)}
            </Text>
          </VStack>
          <VStack style={styles.registerBreakdownItem}>
            <Text style={styles.registerBreakdownLabel}>Uang keluar</Text>
            <Text style={styles.registerBreakdownValue}>
              − {formatCurrency(cashOutflows)}
            </Text>
          </VStack>
        </HStack>
      ) : null}
      {!isOpen && isClosedToday && lastShiftReport ? (
        <HStack style={styles.closedRegisterReport}>
          <Text style={styles.registerBreakdownLabel}>Selisih tutup kasir</Text>
          <Text
            style={[
              styles.registerBreakdownValue,
              lastShiftReport.difference === 0 && styles.registerBalanced,
              lastShiftReport.difference !== 0 && styles.registerMismatch,
            ]}
          >
            {lastShiftReport.difference === 0
              ? "Sesuai"
              : `${lastShiftReport.difference > 0 ? "Lebih " : "Kurang "}${formatCurrency(Math.abs(lastShiftReport.difference))}`}
          </Text>
        </HStack>
      ) : null}
    </Panel>
  );
}

export function CashScreen() {
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<CashTransaction | null>(null);
  const [savedNotice, setSavedNotice] = useState("");
  const ledger = useCashLedger();
  const { width } = useWindowDimensions();
  const isCompact = width < 1180;
  const isPhone = width < 620;
  const showSummarySideBySide = width >= 960;

  const cashRegisterOpen = useTransactionStore((state) =>
    state.isCashRegisterOpen(),
  );
  const cashRegisterClosedToday = useTransactionStore((state) =>
    state.isCashRegisterClosedToday(),
  );
  const openingCash = useTransactionStore((state) => state.openingCash);
  const cashSales = useTransactionStore((state) => state.cashSalesInShift);
  const cashOutflows = useTransactionStore(
    (state) => state.cashOutflowsInShift,
  );
  const lastShiftReport = useTransactionStore((state) => state.lastShiftReport);
  const recordCashOutflow = useTransactionStore(
    (state) => state.recordCashOutflow,
  );

  const saveExpense = (expense: OperationalExpenseDraft) => {
    if (!cashRegisterOpen) return false;
    if (!recordCashOutflow(expense.amount)) {
      return false;
    }
    useCashLedgerStore.getState().addOperationalExpense(expense);
    setExpenseModalOpen(false);
    setSavedNotice("Uang keluar tercatat di kas hari ini.");
    return true;
  };

  return (
    <AppShell active="Cash" scrollable>
      <VStack style={styles.page}>
        <HStack
          style={[styles.pageHeader, isCompact && styles.pageHeaderCompact]}
        >
          <VStack style={styles.pageHeading}>
            <Text style={styles.pageTitle}>Kelola Kas</Text>
            <Text style={styles.pageDescription}>
              Pantau pengeluaran outlet dan cocokkan saldo laci saat tutup
              kasir.
            </Text>
          </VStack>
          <HStack
            style={[
              styles.pageActions,
              isCompact && styles.pageActionsCompact,
              isPhone && styles.pageActionsPhone,
            ]}
          >
            {cashRegisterOpen ? (
              <AppPressable
                onPress={() => setExpenseModalOpen(true)}
                style={[
                  styles.primaryButton,
                  isPhone && styles.primaryButtonFull,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Catat uang keluar dari laci"
              >
                <AppIcon name="plus" size={17} color={colors.white} />
                <Text style={styles.primaryButtonText}>Catat Uang Keluar</Text>
              </AppPressable>
            ) : null}
          </HStack>
        </HStack>

        {savedNotice ? (
          <HStack style={styles.successNotice}>
            <AppIcon
              name="check-circle-outline"
              size={16}
              color={colors.success}
            />
            <Text style={styles.successNoticeText}>{savedNotice}</Text>
            <AppModalCloseButton
              onPress={() => setSavedNotice("")}
              accessibilityLabel="Tutup notifikasi"
            />
          </HStack>
        ) : null}

        {cashRegisterOpen || cashRegisterClosedToday ? (
          <CashRegisterSummary
            isOpen={cashRegisterOpen}
            isClosedToday={cashRegisterClosedToday}
            openingCash={openingCash}
            cashSales={cashSales}
            cashOutflows={cashOutflows}
            lastShiftReport={lastShiftReport}
          />
        ) : null}

        <CashSummary
          sideBySide={showSummarySideBySide}
          stockAmount={ledger.summary.stockAmount}
          stockCount={ledger.summary.stockCount}
          operationalAmount={ledger.summary.operationalAmount}
          operationalCount={ledger.summary.operationalCount}
        />

        <CashLedgerPanel
          transactions={ledger.transactions}
          rangedTransactions={ledger.rangedTransactions}
          period={ledger.period}
          dateRange={ledger.dateRange}
          filter={ledger.filter}
          query={ledger.query}
          page={ledger.page}
          pageSize={ledger.pageSize}
          onFilterChange={ledger.selectFilter}
          onQueryChange={ledger.changeQuery}
          onPageChange={ledger.setPage}
          onOpenTransaction={setSelectedTransaction}
          onOpenDatePicker={() => setDatePickerOpen(true)}
        />
      </VStack>

      {isExpenseModalOpen ? (
        <AddExpenseModal
          isOpen
          onClose={() => setExpenseModalOpen(false)}
          onSave={saveExpense}
        />
      ) : null}
      {isDatePickerOpen ? (
        <DateRangePickerModal
          isOpen
          initialRange={ledger.dateRange}
          onClose={() => setDatePickerOpen(false)}
          onApply={(range) => {
            ledger.applyDateRange(range);
            setDatePickerOpen(false);
          }}
        />
      ) : null}
      <CashTransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </AppShell>
  );
}
