import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { memo, useState } from "react";
import { FlatList, Image, View } from "react-native";
import { AppIcon, EmptyState, Panel } from "../../../components/ui";
import { colors } from "../../../theme";
import type { DateRange } from "../../../types/dateRange";
import { formatCurrency } from "../../../utils/format";
import type { HistorySalesSummary } from "../types";
import { formatDateRangeLabel } from "../utils/dateRange";
import { styles } from "../styles";

type MenuSales = {
  id: string;
  name: string;
  sub: string;
  qty: number;
  amount: number;
  image?: string;
};

const renderSoldMenuRow = ({ item }: { item: MenuSales }) => (
  <MenuSalesRow item={item} />
);
const soldMenuKey = (item: MenuSales) => item.id;

export const SalesSummary = memo(function SalesSummary({
  isWide,
  isCompact,
  isMobile,
  isTablet,
  summary,
  dateRange,
}: {
  isWide: boolean;
  isCompact: boolean;
  isMobile: boolean;
  isTablet: boolean;
  summary?: HistorySalesSummary;
  dateRange: DateRange;
}) {
  const revenue = summary?.revenueRupiah ?? 0;
  const cash = summary?.cashRupiah ?? 0;
  const qris = summary?.qrisRupiah ?? 0;
  const cups = summary?.itemCount ?? 0;
  const grossProfit = summary?.grossProfitRupiah ?? null;
  const soldMenu: MenuSales[] = (summary?.soldMenu ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    sub: item.categoryName,
    qty: item.quantity,
    amount: item.amountRupiah,
    image: item.photoUrl,
  }));
  const dateLabel = formatDateRangeLabel(dateRange);
  const qrisPercent = revenue ? Math.round((qris / revenue) * 100) : 0;
  const cashPercent = revenue ? Math.round((cash / revenue) * 100) : 0;
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
              {summary ? formatCurrency(revenue) : "—"}
            </Text>
          </HStack>
          <View style={styles.rule} />
          <HStack style={styles.paymentCards}>
            <PaymentCard
              icon="qrcode-scan"
              label="QRIS"
              amount={summary ? formatCurrency(qris) : "—"}
              percent={summary ? `${qrisPercent}%` : "—"}
              color={colors.primary}
              adaptive={responsiveText}
            />
            <View style={styles.paymentDivider} />
            <PaymentCard
              icon="cash-multiple"
              label="Tunai"
              amount={summary ? formatCurrency(cash) : "—"}
              percent={summary ? `${cashPercent}%` : "—"}
              color={colors.warning}
              adaptive={responsiveText}
            />
          </HStack>
        </VStack>

        <HStack style={styles.metrics}>
          <SmallMetric
            label={isCompact ? "TRANSAKSI" : "TOTAL TRANSAKSI"}
            value={summary ? `${summary.transactionCount} Trx` : "—"}
            adaptive={responsiveText}
            tablet={isTablet}
            compact={isCompact}
          />
          <View style={styles.metricDivider} />
          <SmallMetric
            label={isCompact ? "CUP TERJUAL" : "MINUMAN TERJUAL"}
            value={summary ? `${cups} Cup` : "—"}
            active
            adaptive={responsiveText}
            tablet={isTablet}
            compact={isCompact}
          />
          <View style={styles.metricDivider} />
          <SmallMetric
            label="LABA KOTOR"
            value={
              !summary || grossProfit === null
                ? "—"
                : formatCurrency(grossProfit)
            }
            success={summary !== undefined && grossProfit !== null && grossProfit >= 0}
            negative={summary !== undefined && grossProfit !== null && grossProfit < 0}
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
            <Text style={styles.datePill}>{summary ? `${cups} Cup Total` : "Ringkasan —"}</Text>
          ) : null}
        </HStack>
        {isCompact ? (
          <HStack style={styles.compactHeaderMeta}>
            <Text style={styles.datePill}>{summary ? `${cups} Cup Total` : "Ringkasan —"}</Text>
          </HStack>
        ) : null}
        <View style={styles.rule} />

        {soldMenu.length > 0 && !isCompact ? (
          <HStack style={styles.menuHead}>
            <Text style={[styles.menuCell, styles.menuName]}>MENU MINUMAN</Text>
            <Text style={[styles.menuCell, styles.menuQty]}>VOLUME</Text>
            <Text style={[styles.menuCell, styles.menuAmount]}>
              TOTAL HARGA
            </Text>
          </HStack>
        ) : null}

        {soldMenu.length === 0 ? (
          <EmptyState
            icon="chart-box-outline"
            title={summary ? "Belum ada penjualan" : "Ringkasan tidak tersedia"}
            compact
          />
        ) : isWide ? (
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
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <HStack style={[styles.menuRow, compact && styles.menuRowCompact]}>
      <View style={[styles.menuThumb, compact && styles.menuThumbCompact]}>
        {item.image && !imageFailed ? (
          <Image
            source={{ uri: item.image }}
            style={styles.menuImage}
            resizeMode="cover"
            accessibilityLabel={`Foto ${item.name}`}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <AppIcon name="cup-outline" size={18} color={colors.primary} />
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
