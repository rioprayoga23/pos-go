import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { memo } from "react";
import { FlatList, View } from "react-native";
import { AppIcon, Panel } from "../../../components/ui";
import { colors } from "../../../theme";
import { formatCurrency } from "../../../utils/format";
import { revenue, soldMenu } from "../data/salesSummary";
import { styles } from "../styles";

const renderSoldMenuRow = ({ item }: { item: (typeof soldMenu)[number] }) => (
  <MenuSalesRow item={item} />
);
const soldMenuKey = (item: (typeof soldMenu)[number]) => item.name;

export const SalesSummary = memo(function SalesSummary({
  isWide,
}: {
  isWide: boolean;
}) {
  return (
    <VStack style={[styles.summaryColumn, isWide && styles.panelFill]}>
      <Panel padding={14}>
        <HStack style={styles.summaryHeader}>
          <HStack style={styles.titleIcon}>
            <AppIcon name="chart-bar" size={19} color={colors.primary} />
          </HStack>
          <Text style={styles.summaryTitle}>Ringkasan Penjualan Hari Ini</Text>
          <Text style={styles.datePill}>Kamis, 24 Okt 2024</Text>
        </HStack>
        <View style={styles.rule} />

        <VStack style={styles.revenueCard}>
          <Text style={styles.microLabel}>TOTAL OMZET PENJUALAN</Text>
          <Text style={styles.revenueValue}>{formatCurrency(revenue)}</Text>
          <View style={styles.rule} />
          <HStack style={styles.paymentCards}>
            <PaymentCard
              icon="qrcode-scan"
              label="QRIS"
              amount="Rp 2.470.000"
              percent="72%"
              color={colors.primary}
            />
            <View style={styles.paymentDivider} />
            <PaymentCard
              icon="cash-multiple"
              label="Tunai / Cash"
              amount="Rp 950.000"
              percent="28%"
              color={colors.warning}
            />
          </HStack>
        </VStack>

        <HStack style={styles.metrics}>
          <SmallMetric label="TOTAL TRANSAKSI" value="58 Trx" />
          <View style={styles.metricDivider} />
          <SmallMetric label="MINUMAN TERJUAL" value="142 Cup" active />
          <View style={styles.metricDivider} />
          <SmallMetric label="RATA-RATA (AOV)" value="Rp 58.965" success />
        </HStack>
      </Panel>

      <Panel
        style={[styles.menuPanel, isWide && styles.panelFill]}
        padding={14}
      >
        <HStack style={styles.summaryHeader}>
          <HStack style={styles.titleIcon}>
            <AppIcon name="archive-outline" size={19} color={colors.primary} />
          </HStack>
          <VStack style={styles.menuHeading}>
            <Text style={styles.summaryTitle}>Rincian Menu Terjual</Text>
            <Text style={styles.description}>
              Kontribusi penjualan 4 menu utama hari ini
            </Text>
          </VStack>
          <Text style={styles.datePill}>142 Cup Total</Text>
        </HStack>
        <View style={styles.rule} />

        <HStack style={styles.menuHead}>
          <Text style={[styles.menuCell, styles.menuName]}>MENU MINUMAN</Text>
          <Text style={[styles.menuCell, styles.menuQty]}>VOLUME</Text>
          <Text style={[styles.menuCell, styles.menuAmount]}>
            NILAI PENJUALAN
          </Text>
        </HStack>

        {isWide ? (
          <FlatList
            data={soldMenu}
            keyExtractor={soldMenuKey}
            renderItem={renderSoldMenuRow}
            style={styles.listScroll}
            contentContainerStyle={styles.menuListContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          />
        ) : (
          <VStack style={styles.menuListContent}>
            {soldMenu.map((item) => (
              <MenuSalesRow key={item.name} item={item} />
            ))}
          </VStack>
        )}
      </Panel>
    </VStack>
  );
});

function MenuSalesRow({ item }: { item: (typeof soldMenu)[number] }) {
  return (
    <HStack style={styles.menuRow}>
      <View style={[styles.menuDot, { backgroundColor: item.color }]} />
      <VStack style={styles.menuDetails}>
        <Text style={styles.menuNameText} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {item.sub}
        </Text>
      </VStack>
      <Text style={[styles.menuCell, styles.menuQty, styles.volumePill]}>
        {item.qty}
      </Text>
      <Text style={[styles.menuCell, styles.menuAmount, styles.menuValue]}>
        {item.amount}
      </Text>
    </HStack>
  );
}

function PaymentCard({
  icon,
  label,
  amount,
  percent,
  color,
}: {
  icon: "qrcode-scan" | "cash-multiple";
  label: string;
  amount: string;
  percent: string;
  color: string;
}) {
  return (
    <VStack style={styles.paymentCard}>
      <HStack style={styles.paymentCardHeader}>
        <AppIcon name={icon} size={15} color={color} />
        <Text style={styles.paymentLabel}>{label}</Text>
        <Text style={[styles.paymentPercent, { color }]}>{percent}</Text>
      </HStack>
      <Text style={styles.paymentAmount}>{amount}</Text>
    </VStack>
  );
}

function SmallMetric({
  label,
  value,
  active,
  success,
}: {
  label: string;
  value: string;
  active?: boolean;
  success?: boolean;
}) {
  return (
    <VStack style={styles.smallMetric}>
      <Text style={[styles.microLabel, active && styles.activeMetricLabel]}>
        {label}
      </Text>
      <Text
        style={[
          styles.smallMetricValue,
          active && styles.activeMetricValue,
          success && styles.successMetricValue,
        ]}
      >
        {value}
      </Text>
    </VStack>
  );
}
