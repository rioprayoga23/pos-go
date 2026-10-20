import { HStack } from "@gluestack-ui/themed";
import { StyleSheet } from "react-native";
import { AppIcon, AppPressable, type IconName } from "../ui";
import { colors, radius, spacing } from "../../theme";

type TableAction = "add" | "edit" | "delete" | "detail";

const actionAppearance: Record<
  TableAction,
  {
    icon: IconName;
    color: string;
    backgroundColor: string;
    borderColor: string;
  }
> = {
  add: {
    icon: "plus",
    color: colors.link,
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.surfaceBlue,
  },
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

export function DataTableActions({ children }: { children: React.ReactNode }) {
  return <HStack style={styles.group}>{children}</HStack>;
}

export function DataTableActionButton({
  action,
  label,
  onPress,
  disabled = false,
}: {
  action: TableAction;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const appearance = actionAppearance[action];

  return (
    <AppPressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: appearance.backgroundColor,
          borderColor: appearance.borderColor,
        },
      ]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <AppIcon name={appearance.icon} size={14} color={appearance.color} />
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  group: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  button: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
