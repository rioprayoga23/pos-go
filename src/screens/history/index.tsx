import { HStack } from "@gluestack-ui/themed";
import { useWindowDimensions } from "react-native";
import { AppShell } from "../../components/app-shell";
import { SalesSummary } from "./components/SalesSummary";
import { styles } from "./styles";
import { TransactionsPanel } from "./components/TransactionsPanel";
import { useHistoryOrders } from "./hooks/useHistoryOrders";

export function HistoryScreen() {
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
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  return (
    <AppShell active="History" scrollable={!isWide}>
      <HStack
        style={[styles.layout, isWide ? styles.layoutFill : styles.layoutStack]}
      >
        <TransactionsPanel
          isWide={isWide}
          isCompact={isCompact}
          isMobile={isMobile}
          isTablet={isTablet}
          orders={filteredOrders}
          query={query}
          onQueryChange={setQuery}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
        />
        <SalesSummary isWide={isWide} isMobile={isMobile} isTablet={isTablet} />
      </HStack>
    </AppShell>
  );
}
