import { Text } from "@gluestack-ui/themed";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";
import { AppIcon, AppPressable, type IconName } from "./interactive";

export function ModalFormActions({
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  primaryBusy = false,
  primaryBusyLabel,
  primaryTone = "primary",
  primaryIcon,
  secondaryLabel = "Batal",
  onSecondary,
  secondaryDisabled = false,
  secondaryTone = "quiet",
}: {
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryBusy?: boolean;
  primaryBusyLabel?: string;
  primaryTone?: "primary" | "danger";
  primaryIcon?: IconName;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryDisabled?: boolean;
  secondaryTone?: "quiet" | "danger";
}) {
  const primaryForeground = colors.white;
  const busy = primaryBusy || primaryDisabled;

  return (
    <View style={styles.stack}>
      <AppPressable
        preserveTouchSize
        onPress={onPrimary}
        disabled={busy}
        style={[
          styles.primaryButton,
          primaryTone === "danger" && styles.dangerButton,
          busy && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
        accessibilityState={{ disabled: busy, busy: primaryBusy }}
      >
        {primaryBusy ? (
          <ActivityIndicator size="small" color={primaryForeground} />
        ) : primaryIcon ? (
          <AppIcon name={primaryIcon} size={18} color={primaryForeground} />
        ) : null}
        <Text style={styles.primaryText}>
          {primaryBusy ? (primaryBusyLabel ?? primaryLabel) : primaryLabel}
        </Text>
      </AppPressable>
      {onSecondary ? (
        <AppPressable
          preserveTouchSize
          onPress={onSecondary}
          disabled={secondaryDisabled}
          style={styles.secondaryButton}
          accessibilityRole="button"
          accessibilityLabel={secondaryLabel}
          accessibilityState={{ disabled: secondaryDisabled }}
        >
          <Text
            style={[
              styles.secondaryText,
              secondaryTone === "danger" && styles.secondaryDangerText,
              secondaryDisabled && styles.disabledText,
            ]}
          >
            {secondaryLabel}
          </Text>
        </AppPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    width: "100%",
    alignItems: "stretch",
    gap: spacing.xs,
  },
  primaryButton: {
    width: "100%",
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  dangerButton: { backgroundColor: colors.danger },
  disabled: { opacity: 0.55 },
  primaryText: { color: colors.white, ...typography.button },
  secondaryButton: {
    width: "100%",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: colors.inkMuted, ...typography.button },
  secondaryDangerText: { color: colors.danger },
  disabledText: { opacity: 0.55 },
});
