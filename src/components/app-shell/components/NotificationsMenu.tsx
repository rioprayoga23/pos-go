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
          <Text style={styles.notificationUnreadCount}>
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
          </Text>
        </PopoverHeader>
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
                <HStack
                  key={notification.id}
                  style={[
                    styles.notificationRow,
                    index > 0 && styles.notificationRowBorder,
                  ]}
                >
                  {notification.unread ? (
                    <Pressable
                      onPress={() => onMarkRead(notification.id)}
                      style={styles.notificationBulletTarget}
                      accessibilityRole="button"
                      accessibilityLabel={`Tandai ${notification.title} sebagai sudah dibaca`}
                    >
                      <View style={styles.notificationUnreadBullet} />
                    </Pressable>
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
                </HStack>
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
