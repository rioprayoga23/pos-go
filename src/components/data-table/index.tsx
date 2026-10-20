import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { Children, Fragment, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { AppIcon, AppPressable, Panel } from "../ui";
import { colors, radius, spacing, type, typography } from "../../theme";
import { getPaginationState } from "./pagination";

export { DataTableActionButton, DataTableActions } from "./actions";

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
  totalItems?: number;
};

/** Shared density used by management tables so their rows stay visually consistent. */
export const dataTableLayout = {
  headerHeight: 36,
  rowHeight: 48,
  horizontalPadding: spacing.md,
  verticalPadding: spacing.xs,
  columnGap: spacing.sm,
} as const;

export function DataTableSection({
  title,
  description,
  action,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const isCompact = width < 620;
  const hasHeading = Boolean(title || description || action);

  return (
    <VStack style={styles.section}>
      {hasHeading ? (
        <HStack
          style={[
            styles.sectionHeading,
            isCompact && styles.sectionHeadingCompact,
          ]}
        >
          {title || description ? (
            <VStack style={styles.sectionHeadingCopy}>
              {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
              {description ? (
                <Text style={styles.sectionDescription}>{description}</Text>
              ) : null}
            </VStack>
          ) : null}
          {action ? (
            <View
              style={[
                styles.sectionHeadingAction,
                isCompact && styles.sectionHeadingActionCompact,
              ]}
            >
              {action}
            </View>
          ) : null}
        </HStack>
      ) : null}
      <Panel style={styles.sectionPanel} padding={0}>
        <View style={styles.sectionContent}>{children}</View>
      </Panel>
    </VStack>
  );
}

export function DataTableFilterBar({ children }: { children: ReactNode }) {
  return <VStack style={styles.filterBar}>{children}</VStack>;
}

export function DataTableFilterGrid({ children }: { children: ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const availableWidth = containerWidth || screenWidth;
  const columnCount = availableWidth < 360 ? 1 : availableWidth < 780 ? 2 : 4;
  const fields = Children.toArray(children);
  const rows: ReactNode[][] = [];

  for (let index = 0; index < fields.length; index += columnCount) {
    const row: ReactNode[] = fields.slice(index, index + columnCount);
    while (row.length < columnCount) row.push(null);
    rows.push(row);
  }

  return (
    <VStack
      style={styles.filterGrid}
      onLayout={({ nativeEvent }) => {
        const nextWidth = nativeEvent.layout.width;
        setContainerWidth((currentWidth) =>
          currentWidth === nextWidth ? currentWidth : nextWidth,
        );
      }}
    >
      {rows.map((row, rowIndex) => (
        <HStack key={`row-${rowIndex}`} style={styles.filterGridRow}>
          {row.map((field, columnIndex) => (
            <View
              key={`cell-${rowIndex}-${columnIndex}`}
              style={styles.filterGridCell}
            >
              {field}
            </View>
          ))}
        </HStack>
      ))}
    </VStack>
  );
}

export function DataTable<Row>({
  rows,
  columns,
  keyExtractor,
  minWidth,
  width,
  headerHeight = dataTableLayout.headerHeight,
  rowHeight = dataTableLayout.rowHeight,
  horizontalPadding = dataTableLayout.horizontalPadding,
  verticalPadding = dataTableLayout.verticalPadding,
  columnGap = dataTableLayout.columnGap,
  headerStyle,
  rowStyle,
  getRowStyle,
  emptyState,
  pagination,
  loading = false,
  renderCompactRow,
  renderRowDetail,
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
  /** Shows a centered loader inside the table while keeping its shell visible. */
  loading?: boolean;
  /** Stacked row for narrow screens, using the same table shell and pagination. */
  renderCompactRow?: (row: Row) => ReactNode;
  /** Optional content directly below a row in both table and stacked layouts. */
  renderRowDetail?: (row: Row) => ReactNode;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const isCompact = screenWidth < 620;
  const compactRows =
    Boolean(renderCompactRow) && (containerWidth || screenWidth) < minWidth;
  // Keep the table width tied to its viewport from the first render. The
  // minWidth handles narrow screens; using the measured width here causes a
  // visible narrow-to-full-width jump after onLayout.
  const tableWidth: ViewStyle["width"] = width ?? "100%";
  const pageSize = Math.max(1, pagination?.pageSize ?? 1);
  const itemCount = pagination?.totalItems ?? rows.length;
  const serverPaginated = pagination?.totalItems !== undefined;
  const requestedPage = pagination?.page ?? 1;
  const { pageCount, activePage, startIndex, startItem, endItem, pageNumbers } =
    getPaginationState(requestedPage, pageSize, itemCount);
  const onPageChange = pagination?.onPageChange;
  useEffect(() => {
    if (!loading && requestedPage !== activePage) onPageChange?.(activePage);
  }, [activePage, loading, onPageChange, requestedPage]);
  const visibleRows =
    pagination && !serverPaginated
      ? rows.slice(startIndex, startIndex + pageSize)
      : rows;
  const loadingState = (
    <View
      style={[styles.loadingState, compactRows && styles.loadingStateCompact]}
    >
      <ActivityIndicator
        size="small"
        color={colors.primary}
        accessibilityLabel="Memuat data tabel"
      />
      <Text style={styles.loadingText}>Memuat data…</Text>
    </View>
  );

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
      {compactRows && renderCompactRow ? (
        loading ? (
          loadingState
        ) : (
          <View>
            {visibleRows.length
              ? visibleRows.map((row) => (
                  <Fragment key={keyExtractor(row)}>
                    <View
                      style={[
                        styles.row,
                        {
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.xs,
                          alignItems: "stretch",
                        },
                        rowStyle,
                        getRowStyle?.(row),
                      ]}
                    >
                      {renderCompactRow(row)}
                    </View>
                    {renderRowDetail?.(row)}
                  </Fragment>
                ))
              : emptyState}
          </View>
        )
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.viewport}
          contentContainerStyle={styles.viewportContent}
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
            {loading
              ? loadingState
              : visibleRows.length
                ? visibleRows.map((row) => (
                    <Fragment key={keyExtractor(row)}>
                      <HStack
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
                      {renderRowDetail?.(row)}
                    </Fragment>
                  ))
                : emptyState}
          </VStack>
        </ScrollView>
      )}
      {pagination && (!loading || itemCount > 0) ? (
        <HStack
          style={[
            styles.paginationFooter,
            isCompact && styles.paginationFooterCompact,
          ]}
        >
          <HStack style={styles.paginationSummaryGroup}>
            <Text style={styles.pageSizeText}>{pageSize} per halaman</Text>
            <Text style={styles.paginationSummary}>
              Menampilkan {startItem}–{endItem} dari {itemCount}{" "}
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
              hitSlop={4}
              preserveTouchSize
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
                  hitSlop={4}
                  preserveTouchSize
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
              hitSlop={4}
              preserveTouchSize
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
  section: {
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
    gap: spacing.md,
  },
  sectionHeading: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  sectionHeadingCompact: { alignItems: "stretch", flexDirection: "column" },
  sectionHeadingCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
  sectionTitle: { color: colors.ink, ...typography.sectionTitle },
  sectionDescription: { color: colors.inkMuted, ...typography.description },
  sectionHeadingAction: { flexShrink: 0 },
  sectionHeadingActionCompact: { width: "100%" },
  sectionPanel: {
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
    overflow: "hidden",
  },
  sectionContent: { width: "100%", minWidth: 0, alignSelf: "stretch" },
  filterBar: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.white,
  },
  filterGrid: { width: "100%", gap: spacing.sm },
  filterGridRow: { width: "100%", flexDirection: "row", gap: spacing.sm },
  filterGridCell: { flex: 1, minWidth: 0 },
  container: { width: "100%", minWidth: 0, alignSelf: "stretch" },
  viewport: {
    width: "100%" as const,
    minWidth: 0,
    alignSelf: "stretch" as const,
  },
  viewportContent: { flexGrow: 1, alignItems: "stretch" as const },
  table: { flexGrow: 1, alignSelf: "stretch" as const },
  header: {
    alignItems: "center" as const,
    backgroundColor: colors.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineStrong,
  },
  headerText: {
    color: colors.inkMuted,
    fontSize: type.caption,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  headerTextRight: { textAlign: "right" as const },
  headerTextCenter: { textAlign: "center" as const },
  loadingState: {
    width: "100%",
    minHeight: 168,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.white,
  },
  loadingStateCompact: {
    minHeight: 136,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  loadingText: { color: colors.inkMuted, fontSize: type.caption },
  row: {
    alignItems: "center" as const,
    backgroundColor: colors.white,
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
  paginationControls: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  paginationButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  paginationButtonDisabled: { opacity: 0.42 },
  paginationButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  paginationText: {
    color: colors.inkMuted,
    fontSize: type.caption,
    fontWeight: "600",
  },
  paginationTextSelected: { color: colors.white },
  pageSizeText: {
    color: colors.inkMuted,
    fontSize: type.caption,
    fontWeight: "600",
  },
});
