import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { ActionPill, Panel } from "../../../components/ui";
import { FinanceStat } from "../../../components/products/components/FinanceStat";
import { productFormStyles } from "../../../components/products/styles/form";
import { colors, spacing } from "../../../theme";
import { formatCurrency } from "../../../utils/format";
import { ProductEditorModel } from "../types";
import { styles } from "../styles";

export function FinanceOverview({
  financials,
  onOpen,
  isMobile,
  isTablet,
}: {
  financials: ProductEditorModel["financials"];
  onOpen: () => void;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const { hppTotal, salePrice, estimatedProfit, estimatedMargin } = financials;
  const title = (
    <VStack style={{ flex: 1, gap: 3 }}>
      <Text style={[productFormStyles.fieldLabel, isMobile && productFormStyles.fieldLabelMobile, isTablet && productFormStyles.fieldLabelTablet]}>Ringkasan Harga &amp; HPP</Text>
      <Text style={[productFormStyles.description, isMobile && productFormStyles.descriptionMobile, isTablet && productFormStyles.descriptionTablet]}>
        Harga jual, modal, dan margin per cup.
      </Text>
    </VStack>
  );
  const mobileStat = (
    label: string,
    value: string,
    helper: string,
    color: string,
    isLast = false,
  ) => (
    <HStack
      key={label}
      style={[styles.financeStatRowMobile, isLast && styles.financeStatLastRowMobile]}
    >
      <VStack style={styles.financeStatCopyMobile}>
        <Text style={styles.financeStatLabelMobile}>{label}</Text>
        <Text style={styles.financeStatHelperMobile}>{helper}</Text>
      </VStack>
      <Text style={[styles.financeStatValueMobile, { color }]}>{value}</Text>
    </HStack>
  );

  return (
    <Panel style={styles.financePanel} padding={spacing.md}>
      {isMobile ? (
        <VStack style={styles.financeHeaderMobile}>
          {title}
          <ActionPill
            icon="tune-variant"
            label="Atur Harga & HPP"
            onPress={onOpen}
          />
        </VStack>
      ) : (
        <HStack style={styles.financeHeader}>
          {title}
          <ActionPill
            icon="tune-variant"
            label="Atur Harga & HPP"
            onPress={onOpen}
          />
        </HStack>
      )}
      {isMobile ? (
        <VStack style={styles.financeStatsMobile}>
          {mobileStat(
            "HARGA JUAL",
            formatCurrency(salePrice),
            "Harga jual ke pelanggan",
            colors.success,
          )}
          {mobileStat(
            "MODAL POKOK (HPP)",
            formatCurrency(hppTotal),
            "Biaya bahan & kemasan",
            colors.ink,
          )}
          {mobileStat(
            "ESTIMASI MARGIN",
            formatCurrency(estimatedProfit),
            `Laba bersih per cup • ${estimatedMargin >= 0 ? "+" : ""}${estimatedMargin}% margin`,
            estimatedProfit >= 0 ? colors.success : colors.danger,
            true,
          )}
        </VStack>
      ) : (
        <HStack style={styles.financeStats}>
          <FinanceStat
            label="HARGA JUAL"
            value={formatCurrency(salePrice)}
            helper="Harga jual ke pelanggan"
            color={colors.success}
            isTablet={isTablet}
          />
          <FinanceStat
            label="MODAL POKOK (HPP)"
            value={formatCurrency(hppTotal)}
            helper="Biaya bahan & kemasan"
            color={colors.ink}
            isTablet={isTablet}
          />
          <FinanceStat
            label="ESTIMASI MARGIN"
            value={formatCurrency(estimatedProfit)}
            helper={`Laba bersih per cup • ${estimatedMargin >= 0 ? "+" : ""}${estimatedMargin}% margin`}
            color={estimatedProfit >= 0 ? colors.success : colors.danger}
            isTablet={isTablet}
          />
        </HStack>
      )}
    </Panel>
  );
}
