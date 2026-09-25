import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { AppShell } from "../../components/app-shell";
import { DateRangePickerModal } from "../../components/date-range-picker/DateRangePickerModal";
import { DatePeriodFilter } from "../../components/date-period-filter";
import { AppIcon, AppModalCloseButton, AppPressable } from "../../components/ui";
import { useCashLedgerStore } from "../../store/cashLedgerStore";
import { colors } from "../../theme";
import type { RootStackParamList } from "../../navigation/types";
import type { CashTransaction } from "../../types/cash";
import { AddExpenseModal, type OperationalExpenseDraft } from "./components/AddExpenseModal";
import { CashLedgerPanel } from "./components/CashLedgerPanel";
import { CashSummary } from "./components/CashSummary";
import { CashTransactionDetailModal } from "./components/CashTransactionDetailModal";
import { useCashLedger } from "./hooks/useCashLedger";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Cash">;

export function CashScreen(_props: Props) {
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

  const saveExpense = (expense: OperationalExpenseDraft) => {
    useCashLedgerStore.getState().addOperationalExpense(expense);
    setExpenseModalOpen(false);
    setSavedNotice("Pengeluaran tersimpan di riwayat transaksi.");
  };

  return (
    <AppShell active="Cash" scrollable>
      <VStack style={styles.page}>
        <HStack
          style={[styles.pageHeader, isCompact && styles.pageHeaderCompact]}
        >
          <VStack style={styles.pageHeading}>
            <Text style={styles.pageTitle}>Kas &amp; Pengeluaran</Text>
            <Text style={styles.pageDescription}>
              Pantau pengeluaran outlet dan arus kas keluar secara transparan.
            </Text>
          </VStack>
          <HStack
            style={[
              styles.pageActions,
              isCompact && styles.pageActionsCompact,
              isPhone && styles.pageActionsPhone,
            ]}
          >
            <DatePeriodFilter
              period={ledger.period}
              dateRange={ledger.dateRange}
              onSelectPreset={ledger.selectPeriod}
              onOpenDatePicker={() => setDatePickerOpen(true)}
            />
            <AppPressable
              onPress={() => setExpenseModalOpen(true)}
              style={[
                styles.primaryButton,
                isPhone && styles.primaryButtonFull,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Catat pengeluaran baru"
            >
              <AppIcon name="plus" size={17} color={colors.white} />
              <Text style={styles.primaryButtonText}>Catat Pengeluaran</Text>
            </AppPressable>
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
