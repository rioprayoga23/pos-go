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
  onRequestCloseShift: () => void;
  onOpen: () => void;
  onClose: () => void;
};

export function ProfileMenu({
  isOpen,
  isMobile,
  showClockInProfile,
  onRequestCloseShift,
  onOpen,
  onClose,
}: Props) {
  const closeShift = () => {
    onClose();
    onRequestCloseShift();
  };

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
          accessibilityLabel="Profil kasir Sarah"
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
            <Text style={styles.profileDropdownName}>Sarah</Text>
            <Text style={styles.profileDropdownRole}>Kasir</Text>
          </VStack>
          {showClockInProfile ? (
            <VStack style={styles.profileDropdownClock}>
              <Text style={styles.clock}>14:28:05</Text>
              <Text style={styles.date}>Kamis, 24 Okt</Text>
            </VStack>
          ) : null}
        </PopoverHeader>
        <PopoverBody style={styles.profileDropdownBody}>
          <VStack style={styles.profileDropdownActions}>
            {isMobile ? (
              <>
                <PrinterStatusPill />
                <Pressable
                  onPress={closeShift}
                  style={styles.profileCloseShift}
                  accessibilityRole="button"
                  accessibilityLabel="Tutup kasir hari ini"
                >
                  <AppIcon
                    name="cash-register"
                    size={14}
                    color={colors.danger}
                  />
                  <Text style={styles.profileCloseShiftText} numberOfLines={1}>
                    Tutup kasir hari ini
                  </Text>
                  <AppIcon name="chevron-right" size={14} color={colors.danger} />
                </Pressable>
              </>
            ) : null}
            <Pressable
              onPress={onClose}
              style={styles.logoutButton}
              accessibilityRole="button"
              accessibilityLabel="Logout Sarah"
            >
              <AppIcon name="logout" size={16} color={colors.danger} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
