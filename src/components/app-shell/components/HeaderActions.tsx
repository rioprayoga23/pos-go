import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotificationStore } from "../../../store/notificationStore";
import { colors } from "../../../theme";
import { AppIcon, AppPressable as Pressable } from "../../ui";
import { styles } from "../styles";
import { PrinterStatusPill } from "./PrinterStatusPill";
import { NotificationsMenu } from "./NotificationsMenu";
import { ProfileMenu } from "./ProfileMenu";

type Props = {
  isLarge: boolean;
  isExtraLarge: boolean;
  onRequestCloseShift: () => void;
};

export function HeaderActions({
  isLarge,
  isExtraLarge,
  onRequestCloseShift,
}: Props) {
  const notifications = useNotificationStore((state) => state.notifications);
  const markNotificationRead = useNotificationStore(
    (state) => state.markAsRead,
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const unreadNotificationCount = notifications.reduce(
    (count, notification) => count + Number(notification.unread),
    0,
  );

  return (
      <HStack style={styles.headerRight}>
        {isLarge ? <PrinterStatusPill /> : null}
        {isLarge ? (
          <Pressable
            onPress={onRequestCloseShift}
            style={[styles.printerPill, styles.closeShiftPill]}
            accessibilityRole="button"
            accessibilityLabel="Tutup kasir hari ini"
          >
            <AppIcon name="cash-register" size={15} color={colors.danger} />
            <Text style={styles.closeShiftText} numberOfLines={1}>
              Tutup Kasir Hari Ini
            </Text>
          </Pressable>
        ) : null}
        {isExtraLarge ? (
          <VStack style={styles.clockBlock}>
            <Text style={styles.clock}>14:28:05</Text>
            <Text style={styles.date}>Kamis, 24 Okt</Text>
          </VStack>
        ) : null}
        <NotificationsMenu
          isOpen={showNotifications}
          notifications={notifications}
          unreadCount={unreadNotificationCount}
          width={width}
          height={height}
          topInset={insets.top}
          bottomInset={insets.bottom}
          onOpen={() => {
            setShowProfileMenu(false);
            setShowNotifications(true);
          }}
          onClose={() => setShowNotifications(false)}
          onMarkRead={markNotificationRead}
        />
        <ProfileMenu
          isOpen={showProfileMenu}
          onOpen={() => {
            setShowNotifications(false);
            setShowProfileMenu(true);
          }}
          onClose={() => setShowProfileMenu(false)}
        />
    </HStack>
  );
}
