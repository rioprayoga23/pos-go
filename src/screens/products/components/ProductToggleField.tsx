import { HStack, Switch, Text } from "@gluestack-ui/themed";
import { Panel } from "../../../components/ui";
import { colors, spacing } from "../../../theme";
import { styles } from "../styles";

export function ProductToggleField({
  label,
  isActive,
  onChange,
  accessibilityLabel,
}: {
  label: string;
  isActive: boolean;
  onChange: (isActive: boolean) => void;
  accessibilityLabel: string;
}) {
  return (
    <Panel style={styles.availabilityPanel} padding={spacing.md}>
      <HStack style={styles.availabilityRow}>
        <Text style={styles.stockLabel}>{label}</Text>
        <Switch
          value={isActive}
          onValueChange={onChange}
          trackColor={{ false: colors.line, true: colors.primary }}
          ios_backgroundColor={colors.line}
          accessibilityLabel={accessibilityLabel}
        />
      </HStack>
    </Panel>
  );
}
