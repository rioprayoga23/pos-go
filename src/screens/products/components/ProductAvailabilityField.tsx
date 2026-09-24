import { HStack, Switch, Text, VStack } from "@gluestack-ui/themed";
import { Panel } from "../../../components/ui";
import { productFormStyles } from "../../../components/products/styles/form";
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
        <VStack style={styles.availabilityCopy}>
          <Text style={styles.stockLabel}>Status Aktif</Text>
          <Text style={productFormStyles.description}>
            Tampilkan menu ini di kasir.
          </Text>
        </VStack>
        <HStack style={styles.availabilityControl}>
          <Text
            style={
              isActive
                ? styles.availabilityActiveText
                : styles.availabilityInactiveText
            }
          >
            {isActive ? "Aktif" : "Nonaktif"}
          </Text>
          <Switch
            value={isActive}
            onValueChange={onChange}
            trackColor={{ false: colors.line, true: colors.success }}
            ios_backgroundColor={colors.line}
            accessibilityLabel="Status menu aktif"
            accessibilityHint="Menentukan apakah menu ditampilkan di kasir"
          />
        </HStack>
      </HStack>
    </Panel>
  );
}
