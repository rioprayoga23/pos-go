import { Text, VStack } from "@gluestack-ui/themed";
import { StyleSheet } from "react-native";
import { colors } from "../../../theme";

export function FinanceStat({
  label,
  value,
  helper,
  color,
}: {
  label: string;
  value: string;
  helper: string;
  color: string;
}) {
  return (
    <VStack style={styles.financeStat}>
      <Text style={styles.microLabel}>{label}</Text>
      <Text style={[styles.financeValue, { color }]}>{value}</Text>
      <Text style={styles.description}>{helper}</Text>
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
  financeValue: { fontSize: 20, fontWeight: "900" },
  description: { color: colors.inkMuted, fontSize: 10, lineHeight: 15 },
});
