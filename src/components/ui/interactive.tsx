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
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import { colors, radius, typography } from "../../theme";

const mobileBreakpoint = 768;
const mobileButtonHeight = 44;

export type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

const touchRipple: NonNullable<PressableProps["android_ripple"]> = {
  color: "rgba(86, 69, 212, 0.16)",
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

function compactMobileTouchStyle(
  style: StyleProp<ViewStyle>,
  width: number,
): StyleProp<ViewStyle> {
  if (width >= mobileBreakpoint) return style;

  const flattenedStyle = StyleSheet.flatten(style);
  if (!flattenedStyle) return style;

  const hasOversizedHeight =
    (typeof flattenedStyle.height === "number" &&
      flattenedStyle.height > mobileButtonHeight) ||
    (typeof flattenedStyle.minHeight === "number" &&
      flattenedStyle.minHeight > mobileButtonHeight);

  return hasOversizedHeight
    ? {
        ...flattenedStyle,
        height: mobileButtonHeight,
        minHeight: mobileButtonHeight,
      }
    : style;
}

function hasOversizedMobileTouchStyle(
  style: StyleProp<ViewStyle>,
  width: number,
) {
  if (width >= mobileBreakpoint) return false;

  const flattenedStyle = StyleSheet.flatten(style);
  return Boolean(
    flattenedStyle &&
      ((typeof flattenedStyle.height === "number" &&
        flattenedStyle.height > mobileButtonHeight) ||
        (typeof flattenedStyle.minHeight === "number" &&
          flattenedStyle.minHeight > mobileButtonHeight)),
  );
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
  const { width } = useWindowDimensions();
  const [pressed, setPressed] = useState(false);
  const resolvedStyle = typeof style === "function" ? style({ pressed }) : style;
  const compactedForMobile = hasOversizedMobileTouchStyle(
    resolvedStyle,
    width,
  );
  const touchStyle = compactMobileTouchStyle(resolvedStyle, width);
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
      hitSlop={compactedForMobile ? (props.hitSlop ?? 2) : props.hitSlop}
      onPressIn={feedbackEnabled ? handlePressIn : onPressIn}
      onPressOut={feedbackEnabled ? handlePressOut : onPressOut}
      android_ripple={getAndroidRipple(android_ripple, feedbackEnabled)}
      style={feedbackEnabled ? withPressedOpacity(touchStyle, pressed) : touchStyle}
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
  const { width } = useWindowDimensions();
  const [pressed, setPressed] = useState(false);
  const compactedForMobile = hasOversizedMobileTouchStyle(
    style as StyleProp<ViewStyle>,
    width,
  );
  const touchStyle = compactMobileTouchStyle(
    style as StyleProp<ViewStyle>,
    width,
  );
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
      hitSlop={compactedForMobile ? (props.hitSlop ?? 2) : props.hitSlop}
      onPressIn={feedbackEnabled ? handlePressIn : onPressIn}
      onPressOut={feedbackEnabled ? handlePressOut : onPressOut}
      android_ripple={getAndroidRipple(android_ripple, feedbackEnabled)}
      style={
        feedbackEnabled
          ? withPressedOpacity(touchStyle as PressableProps["style"], pressed)
          : touchStyle
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
  const { width } = useWindowDimensions();
  return (
    <AppPressable
      onPress={onPress}
      style={styles.actionPill}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <AppIcon name={icon} size={16} color={colors.primary} />
      <Text style={[styles.actionPillText, width < 768 && styles.actionPillTextMobile, width >= 768 && width < 1024 && styles.actionPillTextTablet]}>{label}</Text>
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  touchPressed: { opacity: 0.78 },
  actionPill: {
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTint,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  actionPillText: { color: colors.primaryDark, ...typography.compactButton },
  actionPillTextMobile: { fontSize: typography.compactButton.fontSize, lineHeight: 17 },
  actionPillTextTablet: { fontSize: typography.compactButton.fontSize, lineHeight: 17 },
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
