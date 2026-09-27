import { HStack, Switch, Text } from "@gluestack-ui/themed";
import { Panel } from "../../../components/ui";
import { colors, spacing } from "../../../theme";
import { styles } from "../styles";

export function ProductAvailabilityField({
  isActive,
  onChange,
}: {
  isActive: boolean;
  onChange: (isActive: boolean) => void;
}) {
  return (
    <Panel style={styles.availabilityPanel} padding={spacing.md}>
      <HStack style={styles.availabilityRow}>
        <Text style={styles.stockLabel}>Tampilkan di Kasir</Text>
        <Switch
          value={isActive}
          onValueChange={onChange}
          trackColor={{ false: colors.line, true: colors.success }}
          ios_backgroundColor={colors.line}
          accessibilityLabel="Tampilkan menu di kasir"
        />
      </HStack>
    </Panel>
  );
}
