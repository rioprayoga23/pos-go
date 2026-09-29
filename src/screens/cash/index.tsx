import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { useIsFocused } from "expo-router/react-navigation";
import { useWindowDimensions } from "react-native";
import { AppShell } from "../../components/app-shell";
import { useAppToast } from "../../components/toast/useAppToast";
import { DateRangePickerModal } from "../../components/date-range-picker/DateRangePickerModal";
import { LoadingScreen } from "../../components/loading-screen";
import { QueryErrorNotice } from "../../components/query-error-notice";
import {
  AppIcon,
  AppPressable,
  Panel,
} from "../../components/ui";
import { colors } from "../../theme";
import type {
  CashExpenseDraft,
  CashRegister,
  CashTransaction,
} from "../../types/cash";
import { formatCurrency } from "../../utils/format";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { CashLedgerPanel } from "./components/CashLedgerPanel";
import { CashSummary } from "./components/CashSummary";
import { CashTransactionDetailModal } from "./components/CashTransactionDetailModal";
import { useCashLedger } from "./hooks/useCashLedger";
import { useCashMutations, useCashRegister } from "./hooks/useCashApi";
import { styles } from "./styles";

function CashRegisterSummary({ register }: { register: CashRegister }) {
  const isOpen = register.status === "open";
  const isClosed = register.status === "closed";
  const statusColor = isOpen
    ? colors.success
    : isClosed
      ? colors.inkMuted
      : colors.primary;
  const title = isOpen
    ? "Kasir sedang buka"
    : isClosed
      ? "Sesi kasir terakhir ditutup"
      : "Kasir belum dibuka";
  const message = isOpen
    ? "Perkiraan uang tunai di laci saat ini."
    : isClosed
      ? "Sesi baru dapat dibuka pada hari yang sama."
      : "Buka kasir dari tombol di header sebelum menerima pembayaran.";

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
              {formatCurrency(register.expectedAmountRupiah)}
            </Text>
          </VStack>
        ) : null}
      </HStack>
      {isOpen ? (
        <HStack style={styles.registerBreakdown}>
          <VStack style={styles.registerBreakdownItem}>
            <Text style={styles.registerBreakdownLabel}>Uang awal</Text>
            <Text style={styles.registerBreakdownValue}>
              {formatCurrency(register.openingAmountRupiah)}
            </Text>
          </VStack>
          <VStack style={styles.registerBreakdownItem}>
            <Text style={styles.registerBreakdownLabel}>Penjualan tunai</Text>
            <Text style={styles.registerBreakdownValue}>
              + {formatCurrency(register.cashSalesRupiah)}
            </Text>
          </VStack>
          <VStack style={styles.registerBreakdownItem}>
            <Text style={styles.registerBreakdownLabel}>Uang keluar</Text>
            <Text style={styles.registerBreakdownValue}>
              − {formatCurrency(register.cashOutflowsRupiah)}
            </Text>
          </VStack>
        </HStack>
      ) : null}
      {!isOpen && isClosed && register.differenceRupiah !== undefined ? (
        <HStack style={styles.closedRegisterReport}>
          <Text style={styles.registerBreakdownLabel}>Selisih tutup kasir</Text>
          <Text
            style={[
              styles.registerBreakdownValue,
              register.differenceRupiah === 0 && styles.registerBalanced,
              register.differenceRupiah !== 0 && styles.registerMismatch,
            ]}
          >
            {register.differenceRupiah === 0
              ? "Sesuai"
              : `${register.differenceRupiah > 0 ? "Lebih " : "Kurang "}${formatCurrency(Math.abs(register.differenceRupiah))}`}
          </Text>
        </HStack>
      ) : null}
    </Panel>
  );
}

export function CashScreen() {
  const isFocused = useIsFocused();
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<CashTransaction | null>(null);
  const toast = useAppToast();
  const ledger = useCashLedger(isFocused);
  const registerQuery = useCashRegister({ alwaysRefresh: true, enabled: isFocused });
  const mutations = useCashMutations();
  const register = registerQuery.data?.data;
  const cashRegisterOpen = register?.status === "open";
  const isMutating = Object.values(mutations).some(
    (mutation) => mutation.isPending,
  );
  const isLoading = registerQuery.isFetching || ledger.isFetching || isMutating;
  const { width } = useWindowDimensions();
  const isCompact = width < 1180;
  const isPhone = width < 620;
  const showSummarySideBySide = width >= 960;

  const saveExpense = async (expense: CashExpenseDraft) => {
    await mutations.createExpense.mutateAsync(expense);
    setExpenseModalOpen(false);
    toast.success("Uang keluar dicatat", "Transaksi sudah masuk ke riwayat kas.");
  };

  return (
    <AppShell active="Cash" scrollable>
      <LoadingScreen visible={isLoading} />
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
                accessibilityLabel="Catat uang keluar"
              >
                <AppIcon name="plus" size={17} color={colors.white} />
                <Text style={styles.primaryButtonText}>Catat Uang Keluar</Text>
              </AppPressable>
            ) : null}
          </HStack>
        </HStack>

        {registerQuery.isError || ledger.isError ? (
          <QueryErrorNotice
            onRetry={() => {
              void ledger.refetch();
              void registerQuery.refetch();
            }}
          />
        ) : null}

        {register && register.status !== "not_opened" ? (
          <CashRegisterSummary register={register} />
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
          summary={ledger.summary}
          total={ledger.total}
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
          isSaving={mutations.createExpense.isPending}
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
