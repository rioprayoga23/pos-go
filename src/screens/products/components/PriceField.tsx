import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { AppIcon, AppInput, AppPressable } from "../../../components/ui";
import { productFormStyles } from "../../../components/products/styles/form";
import { colors, radius, spacing } from "../../../theme";
import { formatCurrency, formatPreciseCurrency, formatThousands } from "../../../utils/format";
import type { RecipeCostLine } from "../../../utils/standardRecipe";

export function PriceField({
  value,
  costLines,
  onChange,
}: {
  value: string;
  costLines: RecipeCostLine[] | null;
  onChange: (value: string) => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const price = Number(value.replace(/\D/g, ""));
  const hpp = costLines?.reduce((total, line) => total + line.total, 0) ?? null;
  const grossProfit = hpp !== null && price > 0 ? price - hpp : null;
  const margin = grossProfit !== null ? (grossProfit / price) * 100 : null;
  const marginText = margin === null
    ? "—"
    : `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(margin)}%`;

  return (
    <VStack style={styles.field}>
      <Text style={productFormStyles.fieldLabel}>
        Harga Jual <Text style={productFormStyles.required}>*</Text>
      </Text>
      <AppInput
        value={formatThousands(value)}
        onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
        keyboardType="number-pad"
        placeholder="0"
        leading={<Text style={styles.currency}>Rp</Text>}
        accessibilityLabel="Harga jual menu"
      />
      {costLines?.length ? (
        <VStack style={styles.summaryCard}>
          <HStack style={styles.hppRow}>
            <Text style={styles.hppLabel}>HPP per porsi</Text>
            <Text style={styles.hppValue}>{hpp === null ? "—" : formatCurrency(hpp)}</Text>
          </HStack>
          <HStack style={styles.profitPanel}>
            <Text style={styles.profitLabel}>Estimasi keuntungan</Text>
            <VStack style={styles.profitValues}>
              <Text style={[styles.profitAmount, grossProfit === null ? styles.neutral : grossProfit >= 0 ? styles.positive : styles.negative]}>
                {grossProfit === null ? "—" : formatCurrency(grossProfit)}
              </Text>
              {margin !== null ? (
                <HStack style={styles.marginRow}>
                  <Text style={styles.marginLabel}>Margin</Text>
                  <Text style={[styles.marginValue, margin >= 0 ? styles.positive : styles.negative]}>{marginText}</Text>
                </HStack>
              ) : null}
            </VStack>
          </HStack>
          <VStack style={styles.details}>
            <AppPressable
              onPress={() => setDetailsOpen((open) => !open)}
              style={styles.detailsToggle}
              accessibilityRole="button"
              accessibilityLabel={detailsOpen ? "Tutup rincian harga" : "Lihat rincian harga"}
              accessibilityState={{ expanded: detailsOpen }}
            >
              <Text style={styles.detailsToggleText}>Rincian harga</Text>
              <HStack style={styles.detailsToggleMeta}>
                <Text style={styles.detailCount}>{costLines.length} bahan</Text>
                <AppIcon name={detailsOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
              </HStack>
            </AppPressable>
            {detailsOpen ? (
              <VStack style={styles.detailLines}>
                <HStack style={styles.salePriceLine}>
                  <Text style={styles.salePriceLabel}>Harga jual</Text>
                  <Text style={styles.salePriceValue}>{price > 0 ? formatCurrency(price) : "—"}</Text>
                </HStack>
                {costLines.map((line, index) => (
                  <HStack key={line.itemId} style={[styles.costLine, index < costLines.length - 1 && styles.costLineDivider]}>
                    <VStack style={styles.costCopy}>
                      <Text style={styles.costName} numberOfLines={1}>{line.name}</Text>
                      <Text style={styles.costFormula} numberOfLines={1}>
                        {line.quantity} {line.unit} × {formatPreciseCurrency(line.unitPrice)} / {line.unit}
                      </Text>
                    </VStack>
                    <Text style={styles.costTotal}>{formatCurrency(line.total)}</Text>
                  </HStack>
                ))}
              </VStack>
            ) : null}
          </VStack>
        </VStack>
      ) : (
        <VStack style={styles.emptySummary}>
          <AppIcon name="calculator-variant-outline" size={18} color={colors.inkMuted} />
          <Text style={styles.emptySummaryText}>Pilih bahan untuk melihat HPP</Text>
        </VStack>
      )}
    </VStack>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  currency: { color: colors.inkMuted, fontSize: 14, fontWeight: "800" },
  summaryCard: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.surface, overflow: "hidden" },
  emptySummary: { minHeight: 56, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.surfaceContainerLow, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  emptySummaryText: { color: colors.inkMuted, fontSize: 12, fontWeight: "700" },
  hppRow: { minHeight: 38, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.line },
  hppLabel: { color: colors.inkMuted, fontSize: 12, fontWeight: "700" },
  hppValue: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  profitPanel: { minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  profitLabel: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 12, fontWeight: "800" },
  profitValues: { alignItems: "flex-end", gap: 2 },
  profitAmount: { fontSize: 15, fontWeight: "900" },
  marginRow: { alignItems: "center", gap: spacing.xs },
  marginLabel: { color: colors.inkMuted, fontSize: 11, fontWeight: "600" },
  marginValue: { fontSize: 11, fontWeight: "800" },
  neutral: { color: colors.ink },
  positive: { color: colors.success },
  negative: { color: colors.danger },
  details: { borderTopWidth: 1, borderTopColor: colors.line },
  detailsToggle: { minHeight: 36, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  detailsToggleText: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  detailsToggleMeta: { alignItems: "center", gap: spacing.sm },
  detailCount: { color: colors.inkMuted, fontSize: 11, fontWeight: "700" },
  detailLines: { borderTopWidth: 1, borderTopColor: colors.line },
  salePriceLine: { minHeight: 36, paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "space-between", gap: spacing.md, backgroundColor: colors.surfaceContainerLow },
  salePriceLabel: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  salePriceValue: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  costLine: { minHeight: 36, paddingHorizontal: spacing.md, paddingVertical: 2, alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  costLineDivider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  costCopy: { flex: 1, minWidth: 0, gap: 2 },
  costName: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  costFormula: { color: colors.inkMuted, fontSize: 11 },
  costTotal: { color: colors.ink, fontSize: 12, fontWeight: "800" },
});
