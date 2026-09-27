import { HStack, Text } from "@gluestack-ui/themed";
import { AppPressable } from "../ui";
import { colors, spacing } from "../../theme";

export function QueryErrorNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <HStack
      style={{
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.dangerSoft,
      }}
    >
      <Text style={{ color: colors.danger, flex: 1 }}>
        Data gagal diperbarui.
      </Text>
      <AppPressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Coba muat ulang"
      >
        <Text style={{ color: colors.danger, fontWeight: "600" }}>
          Coba lagi
        </Text>
      </AppPressable>
    </HStack>
  );
}
