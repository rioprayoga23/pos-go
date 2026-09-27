import { useIsFocused } from "expo-router/react-navigation";
import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useWindowDimensions } from "react-native";
import { LivePulseDot } from "../../components/indicators/LivePulseDot";
import { AppShell } from "../../components/app-shell";
import { QueueColumn } from "./components/QueueColumn";
import { QueueSummary } from "./components/QueueSummary";
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
  } = useQueueBoard();
  const isWide = width >= 1024;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  return (
    <AppShell active="Queue" scrollable={!isWide}>
      <VStack style={[styles.page, isWide && styles.pageFill]}>
        <QueueSummary
          waitingCount={waiting.length}
          preparingCount={preparing.length}
          readyCount={readyCount}
          activeCupCount={[...waiting, ...preparing, ...ready].reduce(
            (total, order) => total + order.items.reduce((cups, item) => cups + item.quantity, 0),
            0,
          )}
          isWide={isWide}
          isMobile={isMobile}
          isTablet={isTablet}
        />
        <HStack style={styles.kdsTitle}>
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
            <Text style={styles.liveText}>Live Antrean</Text>
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
            compactHeight={isMobile}
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
            compactHeight={isMobile}
            isMobile={isMobile}
            isTablet={isTablet}
            onAdvance={advanceStatus}
            onTogglePreparedItem={togglePreparedItem}
          />
          <QueueColumn
            title="Siap Disajikan"
            subtitle={`${readyCount} siap dipanggil`}
            tone="ready"
            orders={ready}
            emptyText="Belum ada minuman siap"
            fillHeight={isWide}
            compactHeight={isMobile}
            isMobile={isMobile}
            isTablet={isTablet}
            onAdvance={advanceStatus}
            onTogglePreparedItem={togglePreparedItem}
          />
        </HStack>
      </VStack>
    </AppShell>
  );
}
