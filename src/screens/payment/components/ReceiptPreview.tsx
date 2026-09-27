import { HStack, Text } from "@gluestack-ui/themed";
import { ScrollView, View } from "react-native";
import { ReceiptPaper } from "../../../components/receipt/ReceiptPaper";
import type { ReceiptData } from "../../../components/receipt/types";
import { AppIcon } from "../../../components/ui";
import { colors } from "../../../theme";
import { styles } from "../styles";

export function ReceiptPreview({
  data,
  bounded,
}: {
  data: ReceiptData;
  bounded: boolean;
}) {
  return (
    <View style={[styles.receiptStage, bounded && styles.receiptStageBounded]}>
      <HStack style={styles.receiptStageHeader}>
        <HStack style={{ alignItems: "center", gap: 6 }}>
          <AppIcon name="printer-outline" size={17} color={colors.primary} />
          <Text style={styles.receiptStageTitle}>PREVIEW KERTAS TERMAL 80MM</Text>
        </HStack>
        <Text style={styles.readyPrint}>Pratinjau struk</Text>
      </HStack>
      {bounded ? (
        <ScrollView
          style={styles.receiptScroll}
          contentContainerStyle={styles.receiptScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ReceiptPaper data={data} />
        </ScrollView>
      ) : (
        <ReceiptPaper data={data} />
      )}
    </View>
  );
}
