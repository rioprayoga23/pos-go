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
import { colors } from "../../../theme";
import { AppIcon, AppPressable as Pressable } from "../../ui";
import { styles } from "../styles";
import { PrinterStatusPill } from "./PrinterStatusPill";

type Props = {
  isOpen: boolean;
  isMobile: boolean;
  showClockInProfile: boolean;
  clockLabel: string;
  dateLabel: string;
  onOpen: () => void;
  onClose: () => void;
};

export function ProfileMenu({
  isOpen,
  isMobile,
  showClockInProfile,
  clockLabel,
  dateLabel,
  onOpen,
  onClose,
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
          style={styles.avatar}
          accessibilityRole="button"
          accessibilityLabel="Profil kasir"
          accessibilityState={{ expanded: isOpen }}
        >
          <AppIcon name="account" size={19} color={colors.white} />
        </Pressable>
      )}
    >
      <PopoverBackdrop />
      <PopoverContent style={styles.profileDropdown}>
        <PopoverHeader style={styles.profileDropdownHeader}>
          <HStack style={styles.profileDropdownAvatar}>
            <AppIcon name="account" size={16} color={colors.white} />
          </HStack>
          <VStack style={styles.profileDropdownIdentity}>
            <Text style={styles.profileDropdownName}>Kasir</Text>
            <Text style={styles.profileDropdownRole}>Kasir</Text>
          </VStack>
          {showClockInProfile ? (
            <VStack style={styles.profileDropdownClock}>
              <Text style={styles.clock}>{clockLabel}</Text>
              <Text style={styles.date}>{dateLabel}</Text>
            </VStack>
          ) : null}
        </PopoverHeader>
        <PopoverBody style={styles.profileDropdownBody}>
          <VStack style={styles.profileDropdownActions}>
            {isMobile ? <PrinterStatusPill /> : null}
            <Pressable
              onPress={onClose}
              style={styles.logoutButton}
              accessibilityRole="button"
              accessibilityLabel="Tutup menu profil"
            >
              <AppIcon name="close" size={16} color={colors.inkMuted} />
              <Text style={styles.logoutText}>Tutup menu</Text>
            </Pressable>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
