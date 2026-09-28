import { HStack } from "@gluestack-ui/themed";
import { StyleSheet } from "react-native";
import { AppIcon, AppPressable, type IconName } from "../ui";
import { colors, radius, spacing } from "../../theme";

type TableAction = "edit" | "delete" | "detail";

const actionAppearance: Record<
  TableAction,
  { icon: IconName; color: string; backgroundColor: string; borderColor: string }
> = {
  edit: {
    icon: "pencil-outline",
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  delete: {
    icon: "delete-outline",
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerSoft,
  },
  detail: {
    icon: "eye-outline",
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
};

export function DataTableActions({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <HStack style={[styles.group, compact && styles.compactGroup]}>
      {children}
    </HStack>
  );
}

export function DataTableActionButton({
  action,
  label,
  onPress,
  disabled = false,
  compact = false,
}: {
  action: TableAction;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const appearance = actionAppearance[action];

  return (
    <AppPressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        compact && styles.compactButton,
        {
          backgroundColor: appearance.backgroundColor,
          borderColor: appearance.borderColor,
        },
      ]}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <AppIcon name={appearance.icon} size={compact ? 13 : 16} color={appearance.color} />
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  group: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  compactGroup: { gap: 8 },
  button: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  compactButton: { width: 28, height: 28 },
});
