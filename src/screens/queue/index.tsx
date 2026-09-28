import { useIsFocused } from "expo-router/react-navigation";
import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useWindowDimensions } from "react-native";
import { LivePulseDot } from "../../components/indicators/LivePulseDot";
import { AppShell } from "../../components/app-shell";
import { QueueColumn } from "./components/QueueColumn";
import { QueueSummary } from "./components/QueueSummary";
import { LoadingScreen } from "../../components/loading-screen";
import { QueryErrorNotice } from "../../components/query-error-notice";
import { styles } from "./styles";
import { useQueueBoard } from "./hooks/useQueueBoard";

export function QueueScreen() {
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const {
    waiting,
    preparing,
    ready,
    readyCount,
    advanceStatus,
    togglePreparedItem,
    activeCupCount,
    hasData,
    isFetching,
    isMutating,
    errorMessage,
    retry,
  } = useQueueBoard(isFocused);
  const isWide = width >= 1024;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isVeryNarrow = width < 360;

  return (
    <AppShell active="Queue" scrollable={!isWide}>
      <LoadingScreen visible={isFetching || isMutating} />
      <VStack style={[styles.page, isWide && styles.pageFill]}>
        {errorMessage ? (
          <QueryErrorNotice message={errorMessage} onRetry={retry} />
        ) : null}
        {!hasData && errorMessage ? null : (
          <>
            <QueueSummary
              waitingCount={waiting.length}
              preparingCount={preparing.length}
              readyCount={readyCount}
              activeCupCount={activeCupCount}
              isWide={isWide}
              isMobile={isMobile}
              isTablet={isTablet}
            />
            <HStack
              style={[styles.kdsTitle, isVeryNarrow && styles.kdsTitleNarrow]}
            >
              <Text
                style={[
                  styles.kdsHeading,
                  isMobile && styles.kdsHeadingMobile,
                  isTablet && styles.kdsHeadingTablet,
                ]}
              >
                Antrean Pesanan
              </Text>
              <HStack style={styles.livePill}>
                <LivePulseDot active={isFocused} dotSize={7} />
                <Text style={styles.liveText}>Antrean aktif</Text>
              </HStack>
            </HStack>
            <HStack
              style={[
                styles.columns,
                isWide && styles.columnsFill,
                !isWide && styles.columnsStack,
              ]}
            >
              <QueueColumn
                title="Pesanan Baru"
                subtitle={`${waiting.length} order menunggu`}
                tone="waiting"
                orders={waiting}
                emptyText="Tidak ada pesanan baru"
                fillHeight={isWide}
                compactHeight={!isWide}
                isMobile={isMobile}
                isTablet={isTablet}
                onAdvance={advanceStatus}
                onTogglePreparedItem={togglePreparedItem}
              />
              <QueueColumn
                title="Sedang Dibuat"
                subtitle={`${preparing.length} order aktif`}
                tone="preparing"
                orders={preparing}
                emptyText="Bar sedang kosong"
                fillHeight={isWide}
                compactHeight={!isWide}
                isMobile={isMobile}
                isTablet={isTablet}
                onAdvance={advanceStatus}
                onTogglePreparedItem={togglePreparedItem}
              />
              <QueueColumn
                title="Siap Ambil"
                subtitle={`${readyCount} siap dipanggil`}
                tone="ready"
                orders={ready}
                emptyText="Belum ada minuman siap"
                fillHeight={isWide}
                compactHeight={!isWide}
                isMobile={isMobile}
                isTablet={isTablet}
                onAdvance={advanceStatus}
                onTogglePreparedItem={togglePreparedItem}
              />
            </HStack>
          </>
        )}
      </VStack>
    </AppShell>
  );
}
