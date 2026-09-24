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

type Props = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function ProfileMenu({ isOpen, onOpen, onClose }: Props) {
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
        </PopoverHeader>
        <PopoverBody style={styles.profileDropdownBody}>
          <Pressable
            onPress={onClose}
            style={styles.logoutButton}
            accessibilityRole="button"
            accessibilityLabel="Logout Sarah"
          >
            <AppIcon name="logout" size={16} color={colors.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
