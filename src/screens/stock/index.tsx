import { Text, HStack, VStack } from "@gluestack-ui/themed";
import { useEffect, useRef, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { useIsFocused } from "expo-router/react-navigation";
import { AppShell } from "../../components/app-shell";
import { Tabs } from "../../components/tabs";
import { DataTableSection } from "../../components/data-table";
import {
  ActionButton,
  SectionState,
  SummaryRow,
  ui,
} from "../../components/management";
import { DateRangePickerModal } from "../../components/date-range-picker/DateRangePickerModal";
import { useAppToast } from "../../components/toast/useAppToast";
import { spacing } from "../../theme";
import type { DateRange } from "../../types/dateRange";
import { formatCurrency, formatQuantity } from "../../utils/format";
import {
  formatDateKey,
  getLocalDateKey,
  getPresetDateRange,
} from "../../utils/date";
import { StockItemModal } from "./components/StockItemModal";
import { StockPurchaseModal } from "./components/StockPurchaseModal";
import {
  StockInventoryTable,
  StockHistoryTable,
  movementLabels,
} from "./components/StockTables";
import {
  useStockItems,
  useStockMovements,
  useStockMutations,
} from "./hooks/useStockApi";
import type { HistoryFilter, StockItem, StockMovement } from "./types";
const pageSize = 10;
type StockDialog =
  | { kind: "new" }
  | { kind: "purchase"; item: StockItem }
  | { kind: "edit"; item: StockItem };
function useDebounced(value: string) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), 250);
    return () => clearTimeout(timer);
  }, [value]);
  return debounced;
}
export function StockScreen() {
  const focused = useIsFocused();
  const compact = useWindowDimensions().width < 768;
  const [tab, setTab] = useState("items");
  const [search, setSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const query = useDebounced(search);
  const historyQuery = useDebounced(historySearch);
  const [page, setPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyType, setHistoryType] = useState<HistoryFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getPresetDateRange(getLocalDateKey(), "month"),
  );
  const [datePicker, setDatePicker] = useState(false);
  const [dialog, setDialog] = useState<StockDialog | null>(null);
  const [movement, setMovement] = useState<StockMovement | null>(null);
  const scroll = useRef<ScrollView>(null);
  const scrollPositions = useRef<Record<string, number>>({
    items: 0,
    history: 0,
  });
  const itemsQuery = useStockItems(
    { search: query, page, limit: pageSize },
    focused && tab === "items",
  );
  const movements = useStockMovements(
    {
      search: historyQuery,
      type: historyType,
      from: dateRange.startDate,
      to: dateRange.endDate,
      page: historyPage,
      limit: pageSize,
    },
    focused && tab === "history",
  );
  const mutations = useStockMutations();
  const toast = useAppToast();
  const close = () => setDialog(null);
  const done = (title: string) => {
    close();
    toast.success(title);
  };
  const changeTab = (value: string) => {
    setTab(value);
    requestAnimationFrame(() =>
      scroll.current?.scrollTo({
        y: scrollPositions.current[value] ?? 0,
        animated: false,
      }),
    );
  };
  const items = itemsQuery.data?.data ?? [];

  return (
    <AppShell active="Stock" scrollable={false}>
      <VStack style={{ flex: 1, gap: spacing.lg }}>
        <HStack
          style={[
            ui.header,
            compact && { alignItems: "stretch", flexDirection: "column" },
          ]}
        >
          <VStack style={{ gap: spacing.xs, flex: 1 }}>
            <Text style={ui.title}>Kelola Stok</Text>
            <Text style={ui.muted}>
              Lihat persediaan bahan dan catat stok yang masuk.
            </Text>
          </VStack>
          <ActionButton
            label="Bahan Baru"
            icon="plus"
            tone="primary"
            onPress={() => setDialog({ kind: "new" })}
          />
        </HStack>
        <Tabs.Root value={tab} onValueChange={changeTab}>
          <Tabs.List label="Kelola stok">
            <Tabs.Trigger value="items">Bahan</Tabs.Trigger>
            <Tabs.Trigger value="history">Riwayat</Tabs.Trigger>
          </Tabs.List>
          <ScrollView
            ref={scroll}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={100}
            onScroll={(event) => {
              scrollPositions.current[tab] = event.nativeEvent.contentOffset.y;
            }}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
          >
            <Tabs.Content value="items">
              <DataTableSection
                title="Daftar Bahan"
                description="Jumlah tersedia dan harga modal per satuan stok."
              >
                <SectionState
                  error={
                    itemsQuery.isError ? "Daftar stok gagal dimuat." : undefined
                  }
                  onRetry={() => void itemsQuery.refetch()}
                >
                  <StockInventoryTable
                    items={items}
                    loading={itemsQuery.isFetching}
                    query={search}
                    onQueryChange={(value) => {
                      setSearch(value);
                      setPage(1);
                    }}
                    page={page}
                    total={itemsQuery.data?.total ?? 0}
                    onPageChange={setPage}
                    onDelete={async (item) => {
                      await mutations.deleteItem.mutateAsync(item.id);
                      toast.success("Bahan dihapus");
                    }}
                    onPurchase={(item) => setDialog({ kind: "purchase", item })}
                    onDetail={(item) => setDialog({ kind: "edit", item })}
                  />
                </SectionState>
              </DataTableSection>
            </Tabs.Content>
            <Tabs.Content value="history">
              <DataTableSection
                title="Riwayat Stok"
                description="Pembelian, pemakaian menu, dan koreksi yang tercatat."
              >
                <SectionState
                  error={
                    movements.isError ? "Riwayat gagal dimuat." : undefined
                  }
                  onRetry={() => void movements.refetch()}
                >
                  <StockHistoryTable
                    movements={movements.data?.data ?? []}
                    loading={movements.isFetching}
                    query={historySearch}
                    onQueryChange={(value) => {
                      setHistorySearch(value);
                      setHistoryPage(1);
                    }}
                    type={historyType}
                    onTypeChange={(value) => {
                      setHistoryType(value);
                      setHistoryPage(1);
                    }}
                    dateRange={dateRange}
                    onOpenDatePicker={() => setDatePicker(true)}
                    page={historyPage}
                    total={movements.data?.total ?? 0}
                    onPageChange={setHistoryPage}
                    onDetail={(entry) => {
                      setMovement(entry);
                      requestAnimationFrame(() =>
                        scroll.current?.scrollToEnd({ animated: true }),
                      );
                    }}
                  />
                </SectionState>
              </DataTableSection>
              {movement ? (
                <VStack style={{ gap: spacing.md, paddingTop: spacing.lg }}>
                  <HStack style={ui.header}>
                    <Text style={ui.heading}>Detail Mutasi Stok</Text>
                    <ActionButton
                      label="Tutup detail"
                      tone="quiet"
                      onPress={() => setMovement(null)}
                    />
                  </HStack>
                  <Text style={ui.heading}>{movement.item}</Text>
                  <SummaryRow
                    label="Jenis"
                    value={movementLabels[movement.type]}
                  />
                  <SummaryRow
                    label="Waktu"
                    value={`${formatDateKey(movement.dateKey)}, ${movement.time}`}
                  />
                  <SummaryRow
                    label="Perubahan stok"
                    value={`${movement.quantity > 0 ? "+" : ""}${formatQuantity(movement.quantity)} ${movement.unit}`}
                  />
                  {movement.purchase ? (
                    <>
                      <SummaryRow
                        label="Jumlah pembelian"
                        value={`${formatQuantity(movement.purchase.quantity)} ${movement.purchase.unit}`}
                      />
                      <SummaryRow
                        label="Total biaya"
                        value={formatCurrency(
                          movement.purchase.totalCostRupiah,
                        )}
                      />
                    </>
                  ) : null}
                  <Text style={ui.muted}>
                    {movement.note || "Tidak ada catatan."}
                  </Text>
                </VStack>
              ) : null}
            </Tabs.Content>
          </ScrollView>
        </Tabs.Root>
      </VStack>
      {dialog?.kind === "new" || dialog?.kind === "edit" ? (
        <StockItemModal
          key={dialog.kind === "edit" ? dialog.item.id : "new"}
          item={dialog.kind === "edit" ? dialog.item : undefined}
          onClose={close}
          onSubmit={async (draft, opening) => {
            if (dialog.kind === "edit")
              await mutations.updateItem.mutateAsync({
                id: dialog.item.id,
                draft,
              });
            else if (opening)
              await mutations.purchase.mutateAsync({
                newItem: draft,
                quantity: opening.quantity,
                totalCostRupiah: opening.totalCost,
              });
            else await mutations.createItem.mutateAsync(draft);
            done("Bahan disimpan");
          }}
        />
      ) : null}
      {dialog?.kind === "purchase" ? (
        <StockPurchaseModal
          item={dialog.item}
          onClose={close}
          onSubmit={async (draft) => {
            await mutations.purchase.mutateAsync(draft);
            done("Stok ditambahkan");
          }}
        />
      ) : null}
      {datePicker ? (
        <DateRangePickerModal
          isOpen
          initialRange={dateRange}
          onClose={() => setDatePicker(false)}
          onApply={(range) => {
            setDateRange(range);
            setHistoryPage(1);
            setDatePicker(false);
          }}
        />
      ) : null}
    </AppShell>
  );
}
