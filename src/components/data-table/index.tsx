import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { AppIcon, AppPressable } from "../ui";
import { colors, radius, spacing, type } from "../../theme";

export type DataTableColumn<Row> = {
  key: string;
  title: string;
  width?: number;
  flex?: number;
  minWidth?: number;
  align?: "left" | "center" | "right";
  render: (row: Row) => ReactNode;
};

export type DataTablePagination = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
};

export function DataTable<Row>({
  rows,
  columns,
  keyExtractor,
  minWidth,
  width,
  headerHeight = 40,
  rowHeight = 55,
  horizontalPadding = spacing.md,
  verticalPadding = spacing.xs,
  columnGap = spacing.sm,
  headerStyle,
  rowStyle,
  getRowStyle,
  emptyState,
  pagination,
}: {
  rows: Row[];
  columns: DataTableColumn<Row>[];
  keyExtractor: (row: Row) => string;
  minWidth: number;
  width?: number;
  headerHeight?: number;
  rowHeight?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
  columnGap?: number;
  headerStyle?: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  getRowStyle?: (row: Row) => StyleProp<ViewStyle>;
  emptyState?: ReactNode;
  pagination?: DataTablePagination;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const isCompact = screenWidth < 620;
  const tableWidth = Math.max(minWidth, width ?? containerWidth);
  const pageSize = Math.max(1, pagination?.pageSize ?? 1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const activePage = Math.min(Math.max(1, pagination?.page ?? 1), pageCount);
  const startIndex = (activePage - 1) * pageSize;
  const visibleRows = pagination
    ? rows.slice(startIndex, startIndex + pageSize)
    : rows;
  const startItem = rows.length ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + pageSize, rows.length);
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1)
    .filter(
      (number) =>
        number === 1 ||
        number === pageCount ||
        Math.abs(number - activePage) <= 1,
    )
    .slice(0, 5);

  return (
    <VStack
      style={styles.container}
      onLayout={({ nativeEvent }) => {
        const nextWidth = nativeEvent.layout.width;
        setContainerWidth((currentWidth) =>
          currentWidth === nextWidth ? currentWidth : nextWidth,
        );
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.viewport}
      >
        <VStack style={[styles.table, { minWidth, width: tableWidth }]}>
          <HStack
            style={[
              styles.header,
              {
                minHeight: headerHeight,
                paddingHorizontal: horizontalPadding,
                columnGap,
              },
              headerStyle,
            ]}
          >
            {columns.map((column) => (
              <Text
                key={column.key}
                numberOfLines={1}
                style={[
                  styles.headerText,
                  getColumnLayout(column),
                  column.align === "right" && styles.headerTextRight,
                  column.align === "center" && styles.headerTextCenter,
                ]}
              >
                {column.title}
              </Text>
            ))}
          </HStack>
          {visibleRows.length ? (
            visibleRows.map((row) => (
              <HStack
                key={keyExtractor(row)}
                style={[
                  styles.row,
                  {
                    minHeight: rowHeight,
                    paddingHorizontal: horizontalPadding,
                    paddingVertical: verticalPadding,
                    columnGap,
                  },
                  rowStyle,
                  getRowStyle?.(row),
                ]}
              >
                {columns.map((column) => (
                  <View
                    key={column.key}
                    style={[
                      styles.cell,
                      getColumnLayout(column),
                      column.align === "center" && styles.cellCenter,
                      column.align === "right" && styles.cellRight,
                    ]}
                  >
                    {column.render(row)}
                  </View>
                ))}
              </HStack>
            ))
          ) : (
            emptyState
          )}
        </VStack>
      </ScrollView>
      {pagination ? (
        <HStack
          style={[
            styles.paginationFooter,
            isCompact && styles.paginationFooterCompact,
          ]}
        >
          <HStack style={styles.paginationSummaryGroup}>
            <Text style={styles.pageSizeText}>{pageSize} per halaman</Text>
            <Text style={styles.paginationSummary}>
              Menampilkan {startItem}–{endItem} dari {rows.length}{" "}
              {pagination.itemLabel ?? "baris"}
            </Text>
          </HStack>
          <HStack style={styles.paginationControls}>
            <AppPressable
              onPress={() => pagination.onPageChange(activePage - 1)}
              disabled={activePage <= 1}
              style={[
                styles.paginationButton,
                activePage <= 1 && styles.paginationButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Halaman sebelumnya"
            >
              <AppIcon name="chevron-left" size={16} color={colors.inkMuted} />
            </AppPressable>
            {pageNumbers.map((number) => {
              const selected = number === activePage;
              return (
                <AppPressable
                  key={number}
                  onPress={() => pagination.onPageChange(number)}
                  style={[
                    styles.paginationButton,
                    selected && styles.paginationButtonSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Halaman ${number}`}
                >
                  <Text
                    style={[
                      styles.paginationText,
                      selected && styles.paginationTextSelected,
                    ]}
                  >
                    {number}
                  </Text>
                </AppPressable>
              );
            })}
            <AppPressable
              onPress={() => pagination.onPageChange(activePage + 1)}
              disabled={activePage >= pageCount}
              style={[
                styles.paginationButton,
                activePage >= pageCount && styles.paginationButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Halaman berikutnya"
            >
              <AppIcon name="chevron-right" size={16} color={colors.inkMuted} />
            </AppPressable>
          </HStack>
        </HStack>
      ) : null}
    </VStack>
  );
}

function getColumnLayout<Row>(column: DataTableColumn<Row>): ViewStyle {
  if (column.width !== undefined) {
    return {
      width: column.width,
      minWidth: column.minWidth,
      flexShrink: 0,
    };
  }
  return {
    flex: column.flex ?? 1,
    minWidth: column.minWidth,
  };
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  viewport: { width: "100%" as const },
  table: { flexGrow: 1 },
  header: {
    alignItems: "center" as const,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerText: {
    color: colors.inkSubtle,
    fontSize: type.micro,
    fontWeight: "800" as const,
    letterSpacing: 0.4,
  },
  headerTextRight: { textAlign: "right" as const },
  headerTextCenter: { textAlign: "center" as const },
  row: {
    alignItems: "center" as const,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  cell: {
    minWidth: 0,
    alignSelf: "stretch" as const,
    justifyContent: "center" as const,
  },
  cellCenter: { alignItems: "center" as const },
  cellRight: { alignItems: "flex-end" as const },
  paginationFooter: {
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  paginationFooterCompact: {
    alignItems: "stretch",
    flexDirection: "column",
    gap: spacing.sm,
  },
  paginationSummaryGroup: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  paginationSummary: { color: colors.inkMuted, fontSize: type.caption },
  paginationControls: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  paginationButton: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  paginationButtonDisabled: { opacity: 0.42 },
  paginationButtonSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  paginationText: { color: colors.inkMuted, fontSize: type.caption, fontWeight: "800" },
  paginationTextSelected: { color: colors.white },
  pageSizeText: { color: colors.inkMuted, fontSize: type.caption, fontWeight: "700" },
});
