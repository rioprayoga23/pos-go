import {
  HStack,
  Popover,
  PopoverBackdrop,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { View } from "react-native";
import type { PosNotification } from "../../../store/notificationStore";
import { colors } from "../../../theme";
import { AppIcon, AppPressable as Pressable } from "../../ui";
import { styles } from "../styles";

type Props = {
  isOpen: boolean;
  notifications: PosNotification[];
  unreadCount: number;
  width: number;
  height: number;
  topInset: number;
  bottomInset: number;
  onOpen: () => void;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

export function NotificationsMenu({
  isOpen,
  notifications,
  unreadCount,
  width,
  height,
  topInset,
  bottomInset,
  onOpen,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: Props) {
  return (
    <Popover
      placement="bottom right"
      offset={8}
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      trigger={(triggerProps) => (
        <Pressable
          {...triggerProps}
          style={styles.headerIcon}
          accessibilityRole="button"
          accessibilityLabel={
            unreadCount > 0
              ? `Notifikasi, ${unreadCount} belum dibaca`
              : "Notifikasi, semua sudah dibaca"
          }
          accessibilityState={{ expanded: isOpen }}
        >
          <AppIcon name="bell-outline" size={21} color={colors.inkMuted} />
          {unreadCount > 0 ? (
            <View style={styles.notificationCountBadge}>
              <Text style={styles.notificationCountText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      )}
    >
      <PopoverBackdrop />
      <PopoverContent
        style={[styles.notificationDropdown, { width: Math.min(320, width - 24) }]}
      >
        <PopoverHeader style={styles.notificationHeader}>
          <Text style={styles.notificationHeading}>Notifikasi</Text>
        </PopoverHeader>
        <HStack style={styles.notificationMetaRow}>
          <Text style={styles.notificationUnreadCount}>
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
          </Text>
          {unreadCount > 0 ? (
            <Pressable
              onPress={onMarkAllRead}
              style={styles.notificationMarkAllButton}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Tandai semua notifikasi sebagai sudah dibaca"
            >
              <Text style={styles.notificationMarkAllText}>Tandai baca semua</Text>
            </Pressable>
          ) : null}
        </HStack>
        <PopoverBody
          style={[
            styles.notificationBody,
            {
              maxHeight: Math.max(
                120,
                Math.min(360, height - topInset - bottomInset - 104),
              ),
            },
          ]}
        >
          {notifications.length > 0 ? (
            <VStack style={styles.notificationList}>
              {notifications.map((notification, index) => (
                <Pressable
                  key={notification.id}
                  onPress={() => onMarkRead(notification.id)}
                  disabled={!notification.unread}
                  style={[
                    styles.notificationRow,
                    index > 0 && styles.notificationRowBorder,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    notification.unread
                      ? `Tandai ${notification.title} sebagai sudah dibaca`
                      : `${notification.title}, sudah dibaca`
                  }
                  accessibilityState={{ disabled: !notification.unread }}
                >
                  {notification.unread ? (
                    <View style={styles.notificationBulletTarget}>
                      <View style={styles.notificationUnreadBullet} />
                    </View>
                  ) : (
                    <View style={styles.notificationBulletSpace} />
                  )}
                  <VStack style={styles.notificationCopy}>
                    <Text style={styles.notificationTitle} numberOfLines={1}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </VStack>
                </Pressable>
              ))}
            </VStack>
          ) : (
            <Text style={styles.notificationEmpty}>Belum ada notifikasi.</Text>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
