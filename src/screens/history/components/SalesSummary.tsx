import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { memo, useMemo } from "react";
import { FlatList, Image, View } from "react-native";
import { AppIcon, EmptyState, Panel } from "../../../components/ui";
import { useStockStore } from "../../../store/stockStore";
import { useTransactionStore } from "../../../store/transactionStore";
import { colors } from "../../../theme";
import { getLocalDateKey } from "../../../utils/date";
import { formatCurrency } from "../../../utils/format";
import { getRecipeHpp } from "../../../utils/standardRecipe";
import type { Recipe, StockItem } from "../../../types/stock";
import type { Order, Product } from "../../../types/pos";
import { styles } from "../styles";

type MenuSales = {
  id: string;
  name: string;
  sub: string;
  qty: number;
  amount: number;
  color: string;
  icon: string;
  image?: Product["image"];
};

const renderSoldMenuRow = ({ item }: { item: MenuSales }) => (
  <MenuSalesRow item={item} />
);
const soldMenuKey = (item: MenuSales) => item.id;

function summarizeOrders(
  orders: Order[],
  date: string,
  inventoryItems: StockItem[],
  recipes: Recipe[],
) {
  const todayOrders = orders.filter((order) => order.createdOn === date);
  const revenue = todayOrders.reduce((total, order) => total + order.total, 0);
  const cash = todayOrders.reduce(
    (total, order) =>
      total + (order.paymentMethod === "Tunai" ? order.total : 0),
    0,
  );
  const qris = todayOrders.reduce(
    (total, order) =>
      total + (order.paymentMethod === "QRIS" ? order.total : 0),
    0,
  );
  const cups = todayOrders.reduce(
    (total, order) =>
      total + order.items.reduce((count, item) => count + item.quantity, 0),
    0,
  );
  const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  let costOfGoods = 0;
  let hasCompleteHpp = true;
  const menuById = new Map<string, MenuSales>();

  for (const order of todayOrders) {
    for (const { product, quantity, hppPerPortion } of order.items) {
      const hpp =
        hppPerPortion === undefined
          ? getRecipeHpp(
              inventoryItems,
              recipesById.get(product.recipeId),
              recipes,
            )
          : hppPerPortion;
      if (hpp === null) {
        hasCompleteHpp = false;
      } else {
        costOfGoods += hpp * quantity;
      }

      const existing = menuById.get(product.id);
      const amount = quantity * product.price;
      menuById.set(product.id, {
        id: product.id,
        name: product.name,
        sub: product.categoryName,
        qty: (existing?.qty ?? 0) + quantity,
        amount: (existing?.amount ?? 0) + amount,
        color: product.accent,
        icon: product.icon,
        image: product.image,
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
    grossProfit: hasCompleteHpp ? Math.round(revenue - costOfGoods) : null,
    soldMenu,
  };
}

export const SalesSummary = memo(function SalesSummary({
  isWide,
  isCompact,
  isMobile,
  isTablet,
}: {
  isWide: boolean;
  isCompact: boolean;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const orders = useTransactionStore((state) => state.orders);
  const inventoryItems = useStockStore((state) => state.items);
  const recipes = useStockStore((state) => state.recipes);
  const reportDate = useMemo(() => {
    let latestDate = "";
    for (const order of orders) {
      if (order.createdOn && order.createdOn > latestDate) {
        latestDate = order.createdOn;
      }
    }
    return latestDate || getLocalDateKey();
  }, [orders]);
  const summary = useMemo(
    () => summarizeOrders(orders, reportDate, inventoryItems, recipes),
    [orders, reportDate, inventoryItems, recipes],
  );
  const dateLabel = new Date(`${reportDate}T00:00:00`).toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
  const qrisPercent = summary.revenue
    ? Math.round((summary.qris / summary.revenue) * 100)
    : 0;
  const cashPercent = summary.revenue
    ? Math.round((summary.cash / summary.revenue) * 100)
    : 0;
  const responsiveText = isMobile || isTablet;

  return (
    <VStack style={[styles.summaryColumn, isWide && styles.panelFill]}>
      <Panel padding={14}>
        <HStack
          style={[
            styles.summaryHeader,
            isCompact && styles.summaryHeaderCompact,
          ]}
        >
          <HStack style={styles.titleIcon}>
            <AppIcon name="chart-bar" size={19} color={colors.primary} />
          </HStack>
          <Text
            style={[
              styles.summaryTitle,
              isMobile && styles.summaryTitleMobile,
              isTablet && styles.summaryTitleTablet,
            ]}
            numberOfLines={isCompact ? 1 : undefined}
          >
            Ringkasan Penjualan
          </Text>
          {!isCompact ? <Text style={styles.datePill}>{dateLabel}</Text> : null}
        </HStack>
        {isCompact ? (
          <HStack style={styles.compactHeaderMeta}>
            <Text style={styles.datePill}>{dateLabel}</Text>
          </HStack>
        ) : null}
        <View style={styles.rule} />

        <VStack style={styles.revenueCard}>
          <HStack style={styles.revenueHeader}>
            <Text style={styles.microLabel}>TOTAL OMZET PENJUALAN</Text>
            <Text
              style={[
                styles.revenueValue,
                isMobile && styles.revenueValueMobile,
                isTablet && styles.revenueValueTablet,
              ]}
            >
              {formatCurrency(summary.revenue)}
            </Text>
          </HStack>
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
              label="Tunai"
              amount={formatCurrency(summary.cash)}
              percent={`${cashPercent}%`}
              color={colors.warning}
              adaptive={responsiveText}
            />
          </HStack>
        </VStack>

        <HStack style={styles.metrics}>
          <SmallMetric
            label={isCompact ? "TRANSAKSI" : "TOTAL TRANSAKSI"}
            value={`${summary.transactionCount} Trx`}
            adaptive={responsiveText}
            tablet={isTablet}
            compact={isCompact}
          />
          <View style={styles.metricDivider} />
          <SmallMetric
            label={isCompact ? "CUP TERJUAL" : "MINUMAN TERJUAL"}
            value={`${summary.cups} Cup`}
            active
            adaptive={responsiveText}
            tablet={isTablet}
            compact={isCompact}
          />
          <View style={styles.metricDivider} />
          <SmallMetric
            label="LABA KOTOR"
            value={
              summary.grossProfit === null
                ? "—"
                : formatCurrency(summary.grossProfit)
            }
            success={summary.grossProfit !== null && summary.grossProfit >= 0}
            negative={summary.grossProfit !== null && summary.grossProfit < 0}
            adaptive={responsiveText}
            tablet={isTablet}
            compact={isCompact}
          />
        </HStack>
      </Panel>

      <Panel
        style={[styles.menuPanel, isWide && styles.panelFill]}
        padding={14}
      >
        <HStack
          style={[
            styles.summaryHeader,
            isCompact && styles.summaryHeaderCompact,
          ]}
        >
          <HStack style={styles.titleIcon}>
            <AppIcon name="archive-outline" size={19} color={colors.primary} />
          </HStack>
          <VStack style={styles.menuHeading}>
            <Text
              style={[
                styles.summaryTitle,
                isMobile && styles.summaryTitleMobile,
                isTablet && styles.summaryTitleTablet,
              ]}
              numberOfLines={isCompact ? 1 : undefined}
            >
              Rincian Menu Terjual
            </Text>
          </VStack>
          {!isCompact ? (
            <Text style={styles.datePill}>{summary.cups} Cup Total</Text>
          ) : null}
        </HStack>
        {isCompact ? (
          <HStack style={styles.compactHeaderMeta}>
            <Text style={styles.datePill}>{summary.cups} Cup Total</Text>
          </HStack>
        ) : null}
        <View style={styles.rule} />

        {summary.soldMenu.length > 0 && !isCompact ? (
          <HStack style={styles.menuHead}>
            <Text style={[styles.menuCell, styles.menuName]}>MENU MINUMAN</Text>
            <Text style={[styles.menuCell, styles.menuQty]}>VOLUME</Text>
            <Text style={[styles.menuCell, styles.menuAmount]}>
              TOTAL HARGA
            </Text>
          </HStack>
        ) : null}

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
              <MenuSalesRow
                key={item.id}
                item={item}
                adaptive={responsiveText}
                compact={isCompact}
              />
            ))}
          </VStack>
        )}
      </Panel>
    </VStack>
  );
});

function MenuSalesRow({
  item,
  adaptive = false,
  compact = false,
}: {
  item: MenuSales;
  adaptive?: boolean;
  compact?: boolean;
}) {
  return (
    <HStack style={[styles.menuRow, compact && styles.menuRowCompact]}>
      <View style={[styles.menuThumb, compact && styles.menuThumbCompact]}>
        {item.image ? (
          <Image
            source={item.image}
            style={styles.menuImage}
            resizeMode="cover"
            accessibilityLabel={`Foto ${item.name}`}
          />
        ) : (
          <AppIcon name={item.icon as never} size={18} color={item.color} />
        )}
      </View>
      <VStack style={styles.menuDetails}>
        <Text
          style={[styles.menuNameText, adaptive && styles.readableTextAdaptive]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={styles.menuCategory} numberOfLines={1}>
          {item.sub}
        </Text>
      </VStack>
      {compact ? (
        <VStack style={styles.menuSalesCompact}>
          <Text style={styles.volumePillCompact} numberOfLines={1}>
            {item.qty} Cup
          </Text>
          <Text style={styles.menuValueCompact} numberOfLines={1}>
            {formatCurrency(item.amount)}
          </Text>
        </VStack>
      ) : (
        <>
          <Text style={[styles.menuCell, styles.menuQty, styles.volumePill]}>
            {item.qty} Cup
          </Text>
          <Text style={[styles.menuCell, styles.menuAmount, styles.menuValue]}>
            {formatCurrency(item.amount)}
          </Text>
        </>
      )}
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
        <Text
          style={[styles.paymentLabel, adaptive && styles.readableTextAdaptive]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.paymentPercent,
            adaptive && styles.readableTextAdaptive,
            { color },
          ]}
        >
          {percent}
        </Text>
      </HStack>
      <Text
        style={[styles.paymentAmount, adaptive && styles.paymentAmountAdaptive]}
      >
        {amount}
      </Text>
    </VStack>
  );
}

function SmallMetric({
  label,
  value,
  active,
  success,
  negative,
  adaptive,
  tablet,
  compact,
}: {
  label: string;
  value: string;
  active?: boolean;
  success?: boolean;
  negative?: boolean;
  adaptive: boolean;
  tablet: boolean;
  compact: boolean;
}) {
  return (
    <VStack style={[styles.smallMetric, compact && styles.smallMetricCompact]}>
      <Text
        style={[
          styles.microLabel,
          compact && styles.microLabelCompact,
          active && styles.activeMetricLabel,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.smallMetricValue,
          adaptive && styles.smallMetricValueAdaptive,
          tablet && styles.smallMetricValueTablet,
          active && styles.activeMetricValue,
          success && styles.successMetricValue,
          negative && styles.negativeMetricValue,
        ]}
      >
        {value}
      </Text>
    </VStack>
  );
}
