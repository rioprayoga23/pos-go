import { HStack, VStack } from "@gluestack-ui/themed";
import { useIsFocused } from "expo-router/react-navigation";
import { useWindowDimensions } from "react-native";
import { AppShell } from "../../components/app-shell";
import { LoadingScreen } from "../../components/loading-screen";
import { QueryErrorNotice } from "../../components/query-error-notice";
import { SalesSummary } from "./components/SalesSummary";
import { styles } from "./styles";
import { TransactionsPanel } from "./components/TransactionsPanel";
import { useHistoryOrders } from "./hooks/useHistoryOrders";

export function HistoryScreen() {
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const {
    orders,
    query,
    changeQuery,
    dateRange,
    changeDateRange,
    paymentFilter,
    changePaymentFilter,
    total,
    page,
    pageSize,
    pageCount,
    setPage,
    summary,
    isLoading,
    isError,
    refetch,
  } = useHistoryOrders(isFocused);
  const isWide = width >= 1024;
  const isCompact = width < 520;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  return (
    <AppShell active="History" scrollable={!isWide}>
      <VStack style={{ width: "100%", flex: 1, minHeight: 0, gap: 10 }}>
        <LoadingScreen visible={isLoading} />
        {isError ? (
          <QueryErrorNotice
            message="Data riwayat atau ringkasan gagal dimuat."
            onRetry={() => { void refetch(); }}
          />
        ) : null}
        <HStack
          style={[styles.layout, isWide ? styles.layoutFill : styles.layoutStack]}
        >
          <TransactionsPanel
            isWide={isWide}
            isMobile={isMobile}
            isTablet={isTablet}
            orders={orders}
            total={total}
            page={page}
            pageSize={pageSize}
            pageCount={pageCount}
            onPageChange={setPage}
            query={query}
            onQueryChange={changeQuery}
            dateRange={dateRange}
            onDateRangeChange={changeDateRange}
            paymentFilter={paymentFilter}
            onPaymentFilterChange={changePaymentFilter}
          />
          <SalesSummary
            isWide={isWide}
            isCompact={isCompact}
            isMobile={isMobile}
            isTablet={isTablet}
            summary={summary}
            dateRange={dateRange}
          />
        </HStack>
      </VStack>
    </AppShell>
  );
}
