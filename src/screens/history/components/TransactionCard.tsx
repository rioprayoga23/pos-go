import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { memo, useState } from "react";
import { View } from "react-native";
import { ReceiptPrintModal } from "../../../components/receipt/ReceiptPrintModal";
import type { ReceiptData } from "../../../components/receipt/types";
import { AppIcon, AppPressable as Pressable } from "../../../components/ui";
import { colors } from "../../../theme";
import type { Order } from "../../../types/pos";
import { formatCurrency } from "../../../utils/format";
import { getHistoryTransactionDisplay } from "../data/transactions";
import { createHistoryReceiptData } from "../utils/receiptData";
import { styles } from "../styles";

export const TransactionCard = memo(function TransactionCard({
  order,
}: {
  order: Order;
}) {
  const { billNumber: bill, queueNumber: queue, time, paymentMethod, amount, cupCount: cups, details } =
    getHistoryTransactionDisplay(order);
  const isQris = paymentMethod === "QRIS";
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  return (
    <VStack style={styles.transactionCard}>
      <HStack style={styles.transactionTop}>
        <Text style={styles.transactionNumber}>{bill}</Text>
        <Text style={styles.transactionTime}>{time} WIB</Text>
        <HStack style={styles.transactionTopActions}>
          <HStack style={styles.donePill}>
            <View style={styles.greenDot} />
            <Text style={styles.doneText}>Selesai</Text>
          </HStack>
          <Pressable
            onPress={() =>
              setReceiptData(
                createHistoryReceiptData(order, {
                  billNumber: bill,
                  queueNumber: queue,
                  time,
                }),
              )
            }
            style={styles.smallAction}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Lihat dan cetak ulang struk ${bill}`}
          >
            <AppIcon name="printer-outline" size={13} color={colors.ink} />
            <Text style={styles.smallActionText}>Struk</Text>
          </Pressable>
        </HStack>
      </HStack>
      <HStack style={styles.transactionMiddle}>
        <HStack style={styles.cupIcon}>
          <AppIcon name="cup-outline" size={18} color={colors.primary} />
        </HStack>
        <VStack style={styles.transactionDetails}>
          <Text style={styles.cupTitle}>Pesanan ({cups} Cup)</Text>
          <Text style={styles.transactionCustomer} numberOfLines={1}>
            {details}
          </Text>
        </VStack>
        <VStack style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>{formatCurrency(amount)}</Text>
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
