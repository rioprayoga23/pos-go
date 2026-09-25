import { Text, VStack } from "@gluestack-ui/themed";
import { StyleSheet } from "react-native";
import { colors } from "../../../theme";

export function FinanceStat({
  label,
  value,
  helper,
  color,
  isTablet = false,
}: {
  label: string;
  value: string;
  helper: string;
  color: string;
  isTablet?: boolean;
}) {
  return (
    <VStack style={styles.financeStat}>
      <Text style={[styles.microLabel, isTablet && styles.microLabelTablet]}>{label}</Text>
      <Text style={[styles.financeValue, isTablet && styles.financeValueTablet, { color }]}>{value}</Text>
      <Text style={[styles.description, isTablet && styles.descriptionTablet]}>{helper}</Text>
    </VStack>
  );
}

const styles = StyleSheet.create({
  financeStat: { flex: 1, gap: 3 },
  microLabel: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  microLabelTablet: { fontSize: 11 },
  financeValue: { fontSize: 20, fontWeight: "900" },
  financeValueTablet: { fontSize: 21 },
  description: { color: colors.inkMuted, fontSize: 10, lineHeight: 15 },
  descriptionTablet: { fontSize: 12, lineHeight: 17 },
});
