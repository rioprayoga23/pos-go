import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { memo, useMemo } from "react";
import { FlatList, View } from "react-native";
import { AppIcon, EmptyState, Panel } from "../../../components/ui";
import { useTransactionStore } from "../../../store/transactionStore";
import { colors } from "../../../theme";
import { getLocalDateKey } from "../../../utils/date";
import { formatCurrency } from "../../../utils/format";
import type { Order } from "../../../types/pos";
import { styles } from "../styles";

type MenuSales = {
  id: string;
  name: string;
  sub: string;
  qty: number;
  amount: number;
  color: string;
};

const renderSoldMenuRow = ({ item }: { item: MenuSales }) => (
  <MenuSalesRow item={item} />
);
const soldMenuKey = (item: MenuSales) => item.id;

function summarizeOrders(orders: Order[], date: string) {
  const todayOrders = orders.filter((order) => order.createdOn === date);
  const revenue = todayOrders.reduce((total, order) => total + order.total, 0);
  const cash = todayOrders.reduce(
    (total, order) => total + (order.paymentMethod === "Tunai" ? order.total : 0),
    0,
  );
  const qris = todayOrders.reduce(
    (total, order) => total + (order.paymentMethod === "QRIS" ? order.total : 0),
    0,
  );
  const cups = todayOrders.reduce(
    (total, order) => total + order.items.reduce((count, item) => count + item.quantity, 0),
    0,
  );
  const menuById = new Map<string, MenuSales>();

  for (const order of todayOrders) {
    for (const { product, quantity } of order.items) {
      const existing = menuById.get(product.id);
      const amount = quantity * product.price;
      menuById.set(product.id, {
        id: product.id,
        name: product.name,
        sub: product.categoryName,
        qty: (existing?.qty ?? 0) + quantity,
        amount: (existing?.amount ?? 0) + amount,
        color: product.accent,
      });
    }
  }

  const soldMenu = [...menuById.values()].sort(
    (left, right) => right.amount - left.amount,
  );

  return {
    revenue,
    cash,
    qris,
    cups,
    transactionCount: todayOrders.length,
    averageOrder: todayOrders.length ? Math.round(revenue / todayOrders.length) : 0,
    soldMenu,
  };
}

export const SalesSummary = memo(function SalesSummary({
  isWide,
  isMobile,
  isTablet,
}: {
  isWide: boolean;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const orders = useTransactionStore((state) => state.orders);
  const reportDate = orders[0]?.createdOn ?? getLocalDateKey();
  const summary = useMemo(() => summarizeOrders(orders, reportDate), [orders, reportDate]);
  const dateLabel = new Date(`${reportDate}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const qrisPercent = summary.revenue ? Math.round((summary.qris / summary.revenue) * 100) : 0;
  const cashPercent = summary.revenue ? Math.round((summary.cash / summary.revenue) * 100) : 0;
  const responsiveText = isMobile || isTablet;

  return (
    <VStack style={[styles.summaryColumn, isWide && styles.panelFill]}>
      <Panel padding={14}>
        <HStack style={styles.summaryHeader}>
          <HStack style={styles.titleIcon}>
            <AppIcon name="chart-bar" size={19} color={colors.primary} />
          </HStack>
          <Text style={[styles.summaryTitle, isMobile && styles.summaryTitleMobile, isTablet && styles.summaryTitleTablet]}>
            Ringkasan Penjualan
          </Text>
          <Text style={styles.datePill}>{dateLabel}</Text>
        </HStack>
        <View style={styles.rule} />

        <VStack style={styles.revenueCard}>
          <Text style={[styles.microLabel, responsiveText && styles.readableTextAdaptive]}>TOTAL OMZET PENJUALAN</Text>
          <Text style={[styles.revenueValue, isMobile && styles.revenueValueMobile, isTablet && styles.revenueValueTablet]}>
            {formatCurrency(summary.revenue)}
          </Text>
          <View style={styles.rule} />
          <HStack style={styles.paymentCards}>
            <PaymentCard
              icon="qrcode-scan"
              label="QRIS"
              amount={formatCurrency(summary.qris)}
              percent={`${qrisPercent}%`}
              color={colors.primary}
              adaptive={responsiveText}
            />
            <View style={styles.paymentDivider} />
            <PaymentCard
              icon="cash-multiple"
              label="Tunai / Cash"
              amount={formatCurrency(summary.cash)}
              percent={`${cashPercent}%`}
              color={colors.warning}
              adaptive={responsiveText}
            />
          </HStack>
        </VStack>

        <HStack style={styles.metrics}>
          <SmallMetric label="TOTAL TRANSAKSI" value={`${summary.transactionCount} Trx`} adaptive={responsiveText} tablet={isTablet} />
          <View style={styles.metricDivider} />
          <SmallMetric label="MINUMAN TERJUAL" value={`${summary.cups} Cup`} active adaptive={responsiveText} tablet={isTablet} />
          <View style={styles.metricDivider} />
          <SmallMetric label="RATA-RATA (AOV)" value={formatCurrency(summary.averageOrder)} success adaptive={responsiveText} tablet={isTablet} />
        </HStack>
      </Panel>

      <Panel style={[styles.menuPanel, isWide && styles.panelFill]} padding={14}>
        <HStack style={styles.summaryHeader}>
          <HStack style={styles.titleIcon}>
            <AppIcon name="archive-outline" size={19} color={colors.primary} />
          </HStack>
          <VStack style={styles.menuHeading}>
            <Text style={[styles.summaryTitle, isMobile && styles.summaryTitleMobile, isTablet && styles.summaryTitleTablet]}>
              Rincian Menu Terjual
            </Text>
          </VStack>
          <Text style={styles.datePill}>{summary.cups} Cup Total</Text>
        </HStack>
        <View style={styles.rule} />

        <HStack style={styles.menuHead}>
          <Text style={[styles.menuCell, styles.menuName]}>MENU MINUMAN</Text>
          <Text style={[styles.menuCell, styles.menuQty]}>VOLUME</Text>
          <Text style={[styles.menuCell, styles.menuAmount]}>NILAI PENJUALAN</Text>
        </HStack>

        {summary.soldMenu.length === 0 ? (
          <EmptyState
            icon="chart-box-outline"
            title="Belum ada penjualan"
            compact
          />
        ) : isWide ? (
          <FlatList
            data={summary.soldMenu}
            keyExtractor={soldMenuKey}
            renderItem={renderSoldMenuRow}
            style={styles.listScroll}
            contentContainerStyle={styles.menuListContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          />
        ) : (
          <VStack style={styles.menuListContent}>
            {summary.soldMenu.map((item) => (
              <MenuSalesRow key={item.id} item={item} adaptive={responsiveText} />
            ))}
          </VStack>
        )}
      </Panel>
    </VStack>
  );
});

function MenuSalesRow({ item, adaptive = false }: { item: MenuSales; adaptive?: boolean }) {
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
      <Text style={[styles.menuCell, styles.menuQty, styles.volumePill]}>{item.qty} Cup</Text>
      <Text style={[styles.menuCell, styles.menuAmount, styles.menuValue]}>{formatCurrency(item.amount)}</Text>
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
      <Text style={[styles.smallMetricValue, adaptive && styles.smallMetricValueAdaptive, tablet && styles.smallMetricValueTablet, active && styles.activeMetricValue, success && styles.successMetricValue]}>
        {value}
      </Text>
    </VStack>
  );
}
