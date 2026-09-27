import { HStack, Text } from "@gluestack-ui/themed";
import { StyleSheet } from "react-native";
import { AppIcon, AppPressable, type IconName } from "../ui";
import { colors, radius, spacing, type } from "../../theme";

export type SegmentedFilterOption<Value extends string> = {
  key: Value;
  label: string;
  icon?: IconName;
  accessibilityLabel?: string;
};

export function SegmentedFilterGroup<Value extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  backgroundColor,
  color,
  height,
  minHeight = 32,
  fullWidth = false,
}: {
  options: readonly SegmentedFilterOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  accessibilityLabel: string;
  backgroundColor?: string;
  color?: string;
  height?: number;
  minHeight?: number;
  fullWidth?: boolean;
}) {
  return (
    <HStack
      style={[
        styles.group,
        backgroundColor !== undefined && styles.groupOutlined,
        fullWidth && styles.groupFullWidth,
        backgroundColor !== undefined && { backgroundColor },
        height !== undefined && { height },
      ]}
    >
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <AppPressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[
              styles.tab,
              { minHeight },
              selected && styles.tabSelected,
              fullWidth && styles.tabFullWidth,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={
              option.accessibilityLabel ?? accessibilityLabel + " " + option.label
            }
          >
            {option.icon ? (
              <AppIcon
                name={option.icon}
                size={15}
                color={selected ? colors.primary : color ?? colors.inkSubtle}
              />
            ) : null}
            <Text
              style={[
                styles.label,
                color !== undefined && { color },
                selected && styles.labelSelected,
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </AppPressable>
        );
      })}
    </HStack>
  );
}

const styles = StyleSheet.create({
  group: {
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    gap: spacing.xs,
  },
  groupOutlined: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  groupFullWidth: {
    width: "100%",
    justifyContent: "space-between",
  },
  tab: {
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  tabFullWidth: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.xs,
  },
  tabSelected: {
    backgroundColor: colors.white,
    borderColor: colors.line,
  },
  label: {
    color: colors.inkMuted,
    fontSize: type.micro,
    fontWeight: "600",
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
});
