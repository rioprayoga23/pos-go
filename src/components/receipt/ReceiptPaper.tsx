import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { AppIcon, Divider } from "../ui";
import { colors } from "../../theme";
import { formatCurrency } from "../../utils/format";
import type { ReceiptData } from "./types";
import { receiptPaperStyles as styles } from "./styles";

export function ReceiptPaper({ data }: { data: ReceiptData }) {
  return (
    <VStack style={styles.receiptPaper}>
      <VStack style={styles.receiptBrand}>
        <HStack style={styles.receiptCup}>
          <AppIcon name="coffee" size={17} color={colors.ink} />
        </HStack>
        <Text style={styles.receiptBrandName}>KOPI &amp; BOBA CO.</Text>
        <Text style={styles.receiptSmall}>Outlet Kemang • POS-01</Text>
        <Text style={styles.receiptTiny}>Jl. Kemang Raya No. 18, Jaksel</Text>
      </VStack>
      <Divider />
      <HStack style={styles.receiptMeta}>
        <VStack>
          <Text style={styles.receiptTiny}>
            No: <Text style={styles.receiptBold}>{data.orderNumber}</Text>
          </Text>
          <Text style={styles.receiptTiny}>Kasir: {data.cashier}</Text>
          <Text style={styles.receiptTiny}>Pelanggan: {data.customer}</Text>
        </VStack>
        <VStack style={styles.receiptMetaRight}>
          <Text style={styles.receiptTiny}>{data.date}</Text>
          <Text style={styles.receiptTiny}>{data.time} WIB</Text>
        </VStack>
      </HStack>
      <Divider />
      <VStack style={styles.queueReceipt}>
        <Text style={styles.receiptTiny}>NOMOR ANTREAN</Text>
        <Text style={styles.queueNumber}>{data.orderNumber}</Text>
        <Text style={styles.receiptSmall}>
          {data.itemCount} Minuman • {data.orderType}
        </Text>
      </VStack>
      <Divider />
      <VStack style={styles.receiptItems}>
        {data.items.map((item) => (
          <HStack key={item.id} style={styles.receiptLine}>
            <Text style={styles.receiptLineName}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.receiptBold}>{formatCurrency(item.amount)}</Text>
          </HStack>
        ))}
      </VStack>
      <Divider />
      <VStack style={styles.receiptTotals}>
        <HStack style={styles.receiptLine}>
          <Text style={styles.receiptSmall}>Subtotal</Text>
          <Text style={styles.receiptBold}>{formatCurrency(data.subtotal)}</Text>
        </HStack>
        <HStack style={styles.receiptLine}>
          <Text style={styles.receiptSmall}>Pembayaran</Text>
          <Text style={styles.receiptBold}>{data.paymentMethod}</Text>
        </HStack>
      </VStack>
      <Divider />
      <VStack style={styles.receiptFooter}>
        <Text style={styles.receiptTiny}>
          Simpan tiket ini untuk pengambilan pesanan.
        </Text>
        <Text style={styles.receiptTiny}>Terima Kasih atas Kunjungan Anda</Text>
      </VStack>
    </VStack>
  );
}
