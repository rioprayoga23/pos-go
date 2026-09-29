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
  username: string;
  role: "owner" | "pegawai";
  isOpen: boolean;
  isMobile: boolean;
  showClockInProfile: boolean;
  clockLabel: string;
  dateLabel: string;
  onOpen: () => void;
  onClose: () => void;
  onLogout: () => void;
};

export function ProfileMenu({
  username,
  role,
  isOpen,
  isMobile,
  showClockInProfile,
  clockLabel,
  dateLabel,
  onOpen,
  onClose,
  onLogout,
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
            <Text style={styles.profileDropdownName}>{username}</Text>
            <Text style={styles.profileDropdownRole}>{role === "owner" ? "Owner" : "Pegawai"}</Text>
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
              onPress={onLogout}
              style={styles.logoutButton}
              accessibilityRole="button"
              accessibilityLabel="Logout dari akun kasir"
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
