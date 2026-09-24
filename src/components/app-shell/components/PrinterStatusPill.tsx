import { HStack, Text } from "@gluestack-ui/themed";
import { colors } from "../../../theme";
import { AppIcon } from "../../ui";
import { styles } from "../styles";

export function PrinterStatusPill() {
  return (
    <HStack style={styles.printerPill}>
      <AppIcon name="printer-outline" size={15} color={colors.success} />
      <Text style={styles.printerText}>Printer Termal: Terhubung</Text>
    </HStack>
  );
}
