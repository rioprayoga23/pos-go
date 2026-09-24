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
}: {
  financials: ProductEditorModel["financials"];
  onOpen: () => void;
}) {
  const { hppTotal, salePrice, estimatedProfit, estimatedMargin } = financials;

  return (
    <Panel style={styles.financePanel} padding={spacing.md}>
      <HStack style={styles.financeHeader}>
        <VStack style={{ flex: 1, gap: 3 }}>
          <Text style={productFormStyles.fieldLabel}>
            Overview Finansial Produk: HPP Modal, Harga Jual &amp; Margin
          </Text>
          <Text style={productFormStyles.description}>
            Ringkasan kalkulasi margin keuntungan &amp; struktur harga kasir
          </Text>
        </VStack>
        <ActionPill
          icon="tune-variant"
          label="Atur Harga & HPP"
          onPress={onOpen}
        />
      </HStack>
      <HStack style={styles.financeStats}>
        <FinanceStat
          label="HARGA JUAL"
          value={formatCurrency(salePrice)}
          helper="Harga jual ke pelanggan"
          color={colors.success}
        />
        <FinanceStat
          label="MODAL POKOK (HPP)"
          value={formatCurrency(hppTotal)}
          helper="Biaya bahan & kemasan"
          color={colors.ink}
        />
        <FinanceStat
          label="ESTIMASI MARGIN"
          value={formatCurrency(estimatedProfit)}
          helper={`Laba bersih per cup • ${estimatedMargin >= 0 ? "+" : ""}${estimatedMargin}% margin`}
          color={estimatedProfit >= 0 ? colors.success : colors.danger}
        />
      </HStack>
    </Panel>
  );
}
