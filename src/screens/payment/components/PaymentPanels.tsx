import {
  HStack,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import {
  AppIcon,
  AppPressable as Pressable,
  Panel,
} from "../../../components/ui";
import { colors, spacing } from "../../../theme";
import { formatCurrency } from "../../../utils/format";
import { styles } from "../styles";

export function PaymentMethodButton({
  active,
  icon,
  title,
  onPress,
}: {
  active: boolean;
  icon: "payments" | "qrcode-scan";
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.methodButton, active && styles.methodButtonActive]}
    >
      <HStack style={[styles.methodIcon, active && styles.methodIconActive]}>
        <AppIcon
          name={icon === "payments" ? "cash-multiple" : "qrcode-scan"}
          size={21}
          color={active ? colors.white : colors.inkMuted}
        />
      </HStack>
      <Text style={[styles.methodTitle, active && styles.methodTitleActive]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function QrPaymentPanel({
  verified,
  setVerified,
  subtotal,
  bounded,
}: {
  verified: boolean;
  setVerified: (value: boolean) => void;
  subtotal: number;
  bounded: boolean;
}) {
  return (
    <Panel
      style={[styles.qrisPanel, !bounded && styles.qrisPanelStacked]}
      padding={spacing.md}
    >
      <VStack
        style={[styles.verifyBox, !bounded && styles.verifyBoxStacked]}
      >
        <HStack style={styles.verifyIcon}>
          <AppIcon name="check-decagram" size={24} color={colors.warning} />
        </HStack>
        <Text style={styles.verifyTitle}>Verifikasi Pembayaran QRIS</Text>
        <Text style={styles.verifyDescription}>
          Pastikan dana sebesar{" "}
          <Text style={styles.verifyAmount}>{formatCurrency(subtotal)}</Text>{" "}
          sudah berhasil masuk ke notifikasi merchant atau mutasi m-banking
          sebelum mencetak tiket antrean.
        </Text>
        <Pressable
          onPress={() => setVerified(true)}
          style={[styles.verifyButton, verified && styles.verifyButtonDone]}
        >
          <AppIcon
            name={verified ? "check-circle" : "shield-check-outline"}
            size={18}
            color={verified ? colors.success : colors.warning}
          />
          <Text
            style={[
              styles.verifyButtonText,
              verified && { color: colors.success },
            ]}
          >
            {verified ? "Pembayaran Terverifikasi!" : "Verifikasi Pembayaran"}
          </Text>
        </Pressable>
      </VStack>
    </Panel>
  );
}
