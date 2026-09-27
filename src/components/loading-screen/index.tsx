import { Text } from "@gluestack-ui/themed";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

export function LoadingScreen({ visible }: { visible: boolean }) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => undefined}
    >
      <View style={styles.backdrop} accessibilityViewIsModal>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.label} accessibilityLabel="Sedang memproses">
            Sedang memproses…
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(25, 26, 35, 0.24)",
  },
  card: {
    minWidth: 190,
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  label: { color: colors.ink, ...typography.label },
});
