import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { Panel } from "../../../components/ui";
import { formatCurrency } from "../../../utils/format";
import { styles } from "../styles";

type SummaryCardProps = {
  label: string;
  count: number;
  amount: number;
  hint: string;
  operational?: boolean;
};

function SummaryCard({
  label,
  count,
  amount,
  hint,
  operational = false,
}: SummaryCardProps) {
  return (
    <Panel style={styles.summaryCard} padding={20}>
      <HStack style={styles.summaryTop}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text
          style={[
            styles.summaryCount,
            operational && styles.summaryCountOperational,
          ]}
        >
          {count} transaksi
        </Text>
      </HStack>
      <VStack style={{ gap: 4 }}>
        <Text style={styles.summaryAmount}>{formatCurrency(amount)}</Text>
        <Text style={styles.summaryHint}>{hint}</Text>
      </VStack>
    </Panel>
  );
}

export function CashSummary({
  sideBySide,
  stockAmount,
  stockCount,
  operationalAmount,
  operationalCount,
}: {
  sideBySide: boolean;
  stockAmount: number;
  stockCount: number;
  operationalAmount: number;
  operationalCount: number;
}) {
  return (
    <HStack style={[styles.summaryRow, !sideBySide && styles.summaryColumn]}>
      <SummaryCard
        label="Pembelian Stok"
        count={stockCount}
        amount={stockAmount}
        hint="Sinkron dari inventaris bahan baku & kemasan"
      />
      <SummaryCard
        label="Pengeluaran Operasional"
        count={operationalCount}
        amount={operationalAmount}
        hint="Beban rutin outlet seperti listrik, iuran, dan kebersihan"
        operational
      />
    </HStack>
  );
}
