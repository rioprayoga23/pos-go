import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Button as GluestackButton,
  Pressable as GluestackPressable,
  Text,
} from "@gluestack-ui/themed";
import { type ComponentProps, useState } from "react";
import {
  Platform,
  type PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors, radius } from "../../theme";

export type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

const touchRipple: NonNullable<PressableProps["android_ripple"]> = {
  color: "rgba(21, 101, 233, 0.18)",
  foreground: true,
};

type PressHandlers = Pick<
  PressableProps,
  "onPress" | "onLongPress" | "onPressIn" | "onPressOut" | "onPressMove"
>;

function hasPressHandler(props: PressHandlers) {
  return Boolean(
    props.onPress ||
      props.onLongPress ||
      props.onPressIn ||
      props.onPressOut ||
      props.onPressMove,
  );
}

function withPressedOpacity(style: PressableProps["style"], pressed: boolean) {
  const baseStyle = typeof style === "function" ? style({ pressed }) : style;
  return [
    StyleSheet.flatten(baseStyle),
    pressed ? styles.touchPressed : undefined,
  ];
}

function getAndroidRipple(
  ripple: PressableProps["android_ripple"],
  enabled: boolean,
) {
  if (Platform.OS !== "android" || !enabled) return ripple;
  return ripple ?? touchRipple;
}

export function AppPressable({
  style,
  android_ripple,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ComponentProps<typeof GluestackPressable>) {
  const [pressed, setPressed] = useState(false);
  const feedbackEnabled =
    hasPressHandler({ ...props, onPressIn, onPressOut }) && !disabled;

  const handlePressIn: NonNullable<PressableProps["onPressIn"]> = (event) => {
    setPressed(true);
    onPressIn?.(event);
  };
  const handlePressOut: NonNullable<PressableProps["onPressOut"]> = (event) => {
    setPressed(false);
    onPressOut?.(event);
  };

  return (
    <GluestackPressable
      {...props}
      disabled={disabled}
      onPressIn={feedbackEnabled ? handlePressIn : onPressIn}
      onPressOut={feedbackEnabled ? handlePressOut : onPressOut}
      android_ripple={getAndroidRipple(android_ripple, feedbackEnabled)}
      style={feedbackEnabled ? withPressedOpacity(style, pressed) : style}
    />
  );
}

export function AppButton({
  style,
  android_ripple,
  disabled,
  isDisabled,
  onPressIn,
  onPressOut,
  ...props
}: ComponentProps<typeof GluestackButton>) {
  const [pressed, setPressed] = useState(false);
  const feedbackEnabled =
    hasPressHandler({ ...props, onPressIn, onPressOut }) &&
    !disabled &&
    !isDisabled;

  const handlePressIn: NonNullable<PressableProps["onPressIn"]> = (event) => {
    setPressed(true);
    onPressIn?.(event);
  };
  const handlePressOut: NonNullable<PressableProps["onPressOut"]> = (event) => {
    setPressed(false);
    onPressOut?.(event);
  };

  return (
    <GluestackButton
      {...props}
      disabled={disabled}
      isDisabled={isDisabled}
      onPressIn={feedbackEnabled ? handlePressIn : onPressIn}
      onPressOut={feedbackEnabled ? handlePressOut : onPressOut}
      android_ripple={getAndroidRipple(android_ripple, feedbackEnabled)}
      style={
        feedbackEnabled
          ? withPressedOpacity(style as PressableProps["style"], pressed)
          : style
      }
    />
  );
}

export function AppIcon({
  name,
  size = 20,
  color = colors.inkMuted,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

export function AppModalCloseButton({
  onPress,
  accessibilityLabel,
  style,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <AppPressable
      onPress={onPress}
      style={[styles.appModalCloseButton, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <AppIcon name="close" size={19} color={colors.inkMuted} />
    </AppPressable>
  );
}

export function ActionPill({
  icon,
  label,
  onPress,
  accessibilityLabel,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <AppPressable
      onPress={onPress}
      style={styles.actionPill}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <AppIcon name={icon} size={16} color={colors.primary} />
      <Text style={styles.actionPillText}>{label}</Text>
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  touchPressed: { opacity: 0.78 },
  actionPill: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTint,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  actionPillText: { color: colors.primary, fontSize: 10, fontWeight: "900" },
  appModalCloseButton: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
});
