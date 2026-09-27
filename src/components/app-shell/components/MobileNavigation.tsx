import { HStack, Text } from "@gluestack-ui/themed";
import { View } from "react-native";
import { colors, spacing } from "../../../theme";
import { AppIcon, AppPressable as Pressable } from "../../ui";
import type { PrimaryNavigationRoute } from "../navigationItems";
import { primaryNavigationItems } from "../navigationItems";
import { styles } from "../styles";

type Props = {
  active: PrimaryNavigationRoute;
  bottomInset: number;
  queueCount: number;
  onNavigate: (route: PrimaryNavigationRoute) => void;
};

export function MobileBottomNavigation({
  active,
  bottomInset,
  queueCount,
  onNavigate,
}: Props) {
  return (
    <HStack
      style={[
        styles.mobileNav,
        { paddingBottom: Math.max(bottomInset, spacing.xs) },
      ]}
    >
      {primaryNavigationItems.map((item) => {
        const isActive = item.route === active;

        return (
          <Pressable
            key={item.route}
            onPress={() => onNavigate(item.route)}
            style={styles.mobileNavItem}
            accessibilityRole="button"
            accessibilityLabel={`Buka ${item.label}`}
            accessibilityState={{ selected: isActive }}
          >
            <View
              style={[
                styles.mobileNavIconWrap,
                isActive && styles.mobileNavIconWrapActive,
              ]}
            >
              <AppIcon
                name={item.icon}
                size={19}
                color={isActive ? colors.primary : colors.inkMuted}
              />
              {item.route === "Queue" && queueCount > 0 ? (
                <View style={styles.mobileQueueBadge}>
                  <Text style={styles.queueBadgeText}>{queueCount > 99 ? "99+" : queueCount}</Text>
                </View>
              ) : null}
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.mobileNavLabel,
                isActive && styles.mobileNavLabelActive,
              ]}
            >
              {item.mobileLabel}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}
