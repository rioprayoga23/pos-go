import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { memo, useState } from "react";
import { ReceiptPrintModal } from "../../../components/receipt/ReceiptPrintModal";
import type { ReceiptData } from "../../../components/receipt/types";
import { AppIcon, AppPressable as Pressable, StatusBadge } from "../../../components/ui";
import { colors } from "../../../theme";
import type { Order } from "../../../types/pos";
import { formatCurrency } from "../../../utils/format";
import { getHistoryTransactionDisplay } from "../data/transactions";
import { createHistoryReceiptData } from "../utils/receiptData";
import { styles } from "../styles";

export const TransactionCard = memo(function TransactionCard({
  order,
  density = "desktop",
}: {
  order: Order;
  density?: "mobile" | "tablet" | "desktop";
}) {
  const compact = density !== "desktop";
  const tablet = density === "tablet";
  const { orderNumber, time, paymentMethod, amount, cupCount: cups, details } =
    getHistoryTransactionDisplay(order);
  const isQris = paymentMethod === "QRIS";
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  return (
    <VStack style={styles.transactionCard}>
      <HStack style={styles.transactionTop}>
        <HStack style={styles.transactionMeta}>
          <Text style={styles.transactionNumber}>{orderNumber}</Text>
          <Text
            style={[
              styles.transactionTime,
              compact && styles.readableTextAdaptive,
            ]}
          >
            {time} WIB
          </Text>
        </HStack>
        <HStack style={styles.transactionTopActions}>
          <StatusBadge status={order.status} />
          <Pressable
            onPress={() =>
              setReceiptData(
                createHistoryReceiptData(order),
              )
            }
            style={styles.smallAction}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Lihat dan cetak ulang struk ${orderNumber}`}
          >
            <AppIcon name="printer-outline" size={13} color={colors.ink} />
            <Text style={[styles.smallActionText, compact && styles.readableTextAdaptive]}>Struk</Text>
          </Pressable>
        </HStack>
      </HStack>
      <HStack style={styles.transactionMiddle}>
        <HStack style={styles.cupIcon}>
          <AppIcon name="cup-outline" size={17} color={colors.primary} />
        </HStack>
        <VStack style={styles.transactionDetails}>
          <Text style={[styles.cupTitle, compact && styles.cupTitleAdaptive]} numberOfLines={1}>
            {`Pesanan (${cups} Cup)`}
          </Text>
          <Text
            style={[
              styles.transactionCustomer,
              compact && styles.readableTextAdaptive,
            ]}
            numberOfLines={1}
          >
            {details}
          </Text>
        </VStack>
        <VStack style={styles.transactionRight}>
          <Text
            style={[styles.transactionAmount, tablet && styles.transactionAmountTablet]}
            numberOfLines={1}
          >
            {formatCurrency(amount)}
          </Text>
          <HStack
            style={[
              styles.methodPill,
              { backgroundColor: isQris ? colors.surfaceTint : "#FFFBEB" },
            ]}
          >
            <AppIcon
              name={isQris ? "qrcode-scan" : "cash-multiple"}
              size={12}
              color={isQris ? colors.primary : colors.warning}
            />
            <Text
              style={[
                styles.methodText,
                compact && styles.readableTextAdaptive,
                { color: isQris ? colors.primary : colors.warning },
              ]}
            >
              {isQris ? "QRIS" : "Tunai"}
            </Text>
          </HStack>
        </VStack>
      </HStack>
      {receiptData ? (
        <ReceiptPrintModal
          data={receiptData}
          onClose={() => setReceiptData(null)}
        />
      ) : null}
    </VStack>
  );
});
