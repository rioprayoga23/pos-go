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
  isMobile,
  isTablet,
}: {
  isWide: boolean;
  isMobile: boolean;
  isTablet: boolean;
}) {
  return (
    <VStack style={[styles.summaryColumn, isWide && styles.panelFill]}>
      <Panel padding={14}>
        <HStack style={styles.summaryHeader}>
          <HStack style={styles.titleIcon}>
            <AppIcon name="chart-bar" size={19} color={colors.primary} />
          </HStack>
          <Text style={[styles.summaryTitle, isMobile && styles.summaryTitleMobile, isTablet && styles.summaryTitleTablet]}>Ringkasan Penjualan Hari Ini</Text>
          <Text style={styles.datePill}>Kamis, 24 Okt 2024</Text>
        </HStack>
        <View style={styles.rule} />

        <VStack style={styles.revenueCard}>
          <Text style={[styles.microLabel, (isMobile || isTablet) && styles.readableTextAdaptive]}>TOTAL OMZET PENJUALAN</Text>
          <Text style={[styles.revenueValue, isMobile && styles.revenueValueMobile, isTablet && styles.revenueValueTablet]}>{formatCurrency(revenue)}</Text>
          <View style={styles.rule} />
          <HStack style={styles.paymentCards}>
            <PaymentCard
              icon="qrcode-scan"
              label="QRIS"
              amount="Rp 2.470.000"
              percent="72%"
              color={colors.primary}
              adaptive={isMobile || isTablet}
            />
            <View style={styles.paymentDivider} />
            <PaymentCard
              icon="cash-multiple"
              label="Tunai / Cash"
              amount="Rp 950.000"
              percent="28%"
              color={colors.warning}
              adaptive={isMobile || isTablet}
            />
          </HStack>
        </VStack>

        <HStack style={styles.metrics}>
          <SmallMetric label="TOTAL TRANSAKSI" value="58 Trx" adaptive={isMobile || isTablet} tablet={isTablet} />
          <View style={styles.metricDivider} />
          <SmallMetric label="MINUMAN TERJUAL" value="142 Cup" active adaptive={isMobile || isTablet} tablet={isTablet} />
          <View style={styles.metricDivider} />
          <SmallMetric label="RATA-RATA (AOV)" value="Rp 58.965" success adaptive={isMobile || isTablet} tablet={isTablet} />
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
          <Text style={[styles.summaryTitle, isMobile && styles.summaryTitleMobile, isTablet && styles.summaryTitleTablet]}>Rincian Menu Terjual</Text>
            <Text style={[styles.description, (isMobile || isTablet) && styles.readableTextAdaptive]}>
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
              <MenuSalesRow key={item.name} item={item} adaptive={isMobile || isTablet} />
            ))}
          </VStack>
        )}
      </Panel>
    </VStack>
  );
});

function MenuSalesRow({ item, adaptive = false }: { item: (typeof soldMenu)[number]; adaptive?: boolean }) {
  return (
    <HStack style={styles.menuRow}>
      <View style={[styles.menuDot, { backgroundColor: item.color }]} />
      <VStack style={styles.menuDetails}>
        <Text style={[styles.menuNameText, adaptive && styles.readableTextAdaptive]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.description, adaptive && styles.readableTextAdaptive]} numberOfLines={1}>
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
  adaptive,
}: {
  icon: "qrcode-scan" | "cash-multiple";
  label: string;
  amount: string;
  percent: string;
  color: string;
  adaptive: boolean;
}) {
  return (
    <VStack style={styles.paymentCard}>
      <HStack style={styles.paymentCardHeader}>
        <AppIcon name={icon} size={15} color={color} />
        <Text style={[styles.paymentLabel, adaptive && styles.readableTextAdaptive]}>{label}</Text>
        <Text style={[styles.paymentPercent, adaptive && styles.readableTextAdaptive, { color }]}>{percent}</Text>
      </HStack>
      <Text style={[styles.paymentAmount, adaptive && styles.paymentAmountAdaptive]}>{amount}</Text>
    </VStack>
  );
}

function SmallMetric({
  label,
  value,
  active,
  success,
  adaptive,
  tablet,
}: {
  label: string;
  value: string;
  active?: boolean;
  success?: boolean;
  adaptive: boolean;
  tablet: boolean;
}) {
  return (
    <VStack style={styles.smallMetric}>
      <Text style={[styles.microLabel, adaptive && styles.readableTextAdaptive, active && styles.activeMetricLabel]}>
        {label}
      </Text>
      <Text
        style={[
          styles.smallMetricValue,
          adaptive && styles.smallMetricValueAdaptive,
          tablet && styles.smallMetricValueTablet,
          active && styles.activeMetricValue,
          success && styles.successMetricValue,
        ]}
      >
        {value}
      </Text>
    </VStack>
  );
}
