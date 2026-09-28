import { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, type } from "../../theme";
import { AppIcon, type IconName } from "../ui";
import type { AppToastItem, ToastKind } from "./types";

const toastDurationFallback = 4200;
const enterDuration = 350;
const exitDuration = 400;
const enterEasing = Easing.bezier(0.21, 1.02, 0.73, 1);
const exitEasing = Easing.bezier(0.06, 0.71, 0.55, 1);

const statusStyles: Record<ToastKind, {
  icon: IconName;
  color: string;
  borderColor: string;
}> = {
  success: {
    icon: "check",
    color: colors.success,
    borderColor: "#72C781",
  },
  error: {
    icon: "close",
    color: colors.danger,
    borderColor: "#ED7E8B",
  },
  info: {
    icon: "information-variant",
    color: colors.primary,
    borderColor: "#8B7AE5",
  },
};

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const update = (event?: MediaQueryListEvent) => {
        setReducedMotion(event?.matches ?? mediaQuery.matches);
      };

      update();
      mediaQuery.addEventListener?.("change", update);
      return () => mediaQuery.removeEventListener?.("change", update);
    }

    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );
    return () => subscription.remove();
  }, []);

  return reducedMotion;
}

function ToastCard({
  item,
  duration,
  onDismiss,
}: {
  item: AppToastItem;
  duration: number;
  onDismiss: (id: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));
  const [height, setHeight] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const exiting = useRef(false);

  const dismiss = useCallback(() => {
    if (exiting.current) return;
    exiting.current = true;
    setIsExiting(true);

    Animated.timing(progress, {
      toValue: 0,
      duration: exitDuration,
      easing: exitEasing,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onDismiss(item.id);
    });
  }, [item.id, onDismiss, progress]);

  useEffect(() => {
    if (!height) return;

    Animated.timing(progress, {
      toValue: 1,
      duration: enterDuration,
      easing: enterEasing,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(dismiss, duration || toastDurationFallback);
    return () => clearTimeout(timer);
  }, [dismiss, duration, height, progress]);

  const visual = statusStyles[item.kind];
  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [isExiting ? 0 : reducedMotion ? 0 : 0.5, 1],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [reducedMotion ? 0 : -height * (isExiting ? 1.5 : 2), 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [reducedMotion ? 1 : 0.6, 1],
  });

  return (
    <Animated.View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={item.description ? `${item.title}. ${item.description}` : item.title}
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      style={[
        styles.toast,
        {
          borderColor: visual.borderColor,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: visual.color }]}>
        <AppIcon name={visual.icon} size={14} color={colors.white} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
        {item.description ? (
          <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

export function ToastViewport({
  items,
  onDismiss,
  duration,
}: {
  items: AppToastItem[];
  onDismiss: (id: number) => void;
  duration: number;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const viewportWidth = Math.max(0, Math.min(360, width - 24));

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.viewport,
        {
          top: Math.max(insets.top, Platform.OS === "web" ? 12 : insets.top) + 12,
          right: Math.max(insets.right, Platform.OS === "web" ? 16 : 12),
          width: viewportWidth,
          pointerEvents: "box-none",
        },
      ]}
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} duration={duration} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    position: "absolute",
    zIndex: 10_000,
    elevation: 100,
    alignItems: "stretch",
    gap: spacing.sm,
  },
  toast: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    boxShadow: "0px 8px 22px rgba(26, 26, 26, 0.16)",
    elevation: 7,
    pointerEvents: "none",
  },
  iconBadge: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    marginRight: spacing.md,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  title: {
    color: colors.ink,
    fontFamily: "Inter_600SemiBold",
    fontSize: type.bodySmall,
    lineHeight: 19,
  },
  description: {
    color: colors.inkMuted,
    fontFamily: "Inter_400Regular",
    fontSize: type.label,
    lineHeight: 18,
  },
});
