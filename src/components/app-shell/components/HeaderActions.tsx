import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotificationStore } from "../../../store/notificationStore";
import { colors } from "../../../theme";
import { AppIcon, AppPressable } from "../../ui";
import { styles } from "../styles";
import { NotificationsMenu } from "./NotificationsMenu";
import { ProfileMenu } from "./ProfileMenu";
import { PrinterStatusPill } from "./PrinterStatusPill";

type Props = {
  username: string;
  role: "owner" | "pegawai";
  showClockInHeader: boolean;
  isMobile: boolean;
  cashRegisterOpen: boolean;
  cashRegisterClosed: boolean;
  onRequestCashAction: () => void;
  onLogout: () => void;
};

export function HeaderActions({
  username,
  role,
  showClockInHeader,
  isMobile,
  cashRegisterOpen,
  cashRegisterClosed,
  onRequestCashAction,
  onLogout,
}: Props) {
  const notifications = useNotificationStore((state) => state.notifications);
  const markNotificationRead = useNotificationStore(
    (state) => state.markAsRead,
  );
  const markAllNotificationsRead = useNotificationStore(
    (state) => state.markAllAsRead,
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const showCashActionLabel = !isMobile || width >= 380;
  const unreadNotificationCount = notifications.reduce(
    (count, notification) => count + Number(notification.unread),
    0,
  );
  const cashActionLabel = cashRegisterOpen
    ? "Tutup Kasir"
    : cashRegisterClosed
      ? "Buka Kasir Lagi"
      : "Buka Kasir";
  const cashActionIcon = cashRegisterOpen ? "lock-outline" : "cash-register";
  const clockLabel = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateLabel = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <HStack style={styles.headerRight}>
      {showClockInHeader ? (
        <VStack style={styles.clockBlock}>
          <Text style={styles.clock}>{clockLabel}</Text>
          <Text style={styles.date}>{dateLabel}</Text>
        </VStack>
      ) : null}
      <AppPressable
        onPress={onRequestCashAction}
        style={[
          showCashActionLabel
            ? isMobile
              ? styles.headerCashActionMobileLabeled
              : styles.headerCashAction
            : styles.headerCashActionCompact,
          cashRegisterOpen && styles.headerCashActionClose,
        ]}
        accessibilityRole="button"
        accessibilityLabel={cashActionLabel}
      >
        <AppIcon
          name={cashActionIcon}
          size={16}
          color={cashRegisterOpen ? colors.danger : colors.primary}
        />
        {showCashActionLabel ? (
          <Text
            style={[
              styles.headerCashActionText,
              cashRegisterOpen && styles.headerCashActionCloseText,
            ]}
          >
            {cashActionLabel}
          </Text>
        ) : null}
      </AppPressable>
      {!isMobile ? <PrinterStatusPill /> : null}
      {role === "owner" ? <NotificationsMenu
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
        onMarkAllRead={markAllNotificationsRead}
      /> : null}
      <ProfileMenu
        username={username}
        role={role}
        isOpen={showProfileMenu}
        isMobile={isMobile}
        showClockInProfile={!showClockInHeader}
        clockLabel={clockLabel}
        dateLabel={dateLabel}
        onOpen={() => {
          setShowNotifications(false);
          setShowProfileMenu(true);
        }}
        onClose={() => setShowProfileMenu(false)}
        onLogout={() => {
          setShowProfileMenu(false);
          onLogout();
        }}
      />
    </HStack>
  );
}
