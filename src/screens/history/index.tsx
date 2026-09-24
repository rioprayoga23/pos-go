import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HStack } from "@gluestack-ui/themed";
import { useWindowDimensions } from "react-native";
import { AppShell } from "../../components/app-shell";
import type { RootStackParamList } from "../../navigation/types";
import { SalesSummary } from "./components/SalesSummary";
import { styles } from "./styles";
import { TransactionsPanel } from "./components/TransactionsPanel";
import { useHistoryOrders } from "./hooks/useHistoryOrders";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export function HistoryScreen(_props: Props) {
  const { width } = useWindowDimensions();
  const {
    filteredOrders,
    query,
    setQuery,
    dateRange,
    setDateRange,
    paymentFilter,
    setPaymentFilter,
  } = useHistoryOrders();
  const isWide = width >= 1024;
  const isCompact = width < 520;

  return (
    <AppShell active="History" scrollable={!isWide}>
      <HStack
        style={[styles.layout, isWide ? styles.layoutFill : styles.layoutStack]}
      >
        <TransactionsPanel
          isWide={isWide}
          isCompact={isCompact}
          orders={filteredOrders}
          query={query}
          onQueryChange={setQuery}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
        />
        <SalesSummary isWide={isWide} />
      </HStack>
    </AppShell>
  );
}
