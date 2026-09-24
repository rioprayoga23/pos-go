import {
  ButtonText,
  HStack,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import {
  AppButton as Button,
  AppIcon,
  AppModalCloseButton,
} from "../../../components/ui";
import { colors } from "../../../theme";
import { styles } from "../styles";

export function PaymentSuccessModal({
  visible,
  orderNumber,
  onClose,
  onViewQueue,
}: {
  visible: boolean;
  orderNumber: string;
  onClose: () => void;
  onViewQueue: () => void;
}) {
  return (
    <Modal isOpen={visible} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={styles.successModal}>
        <ModalHeader style={styles.successHeader}>
          <HStack style={styles.successIcon}>
            <AppIcon name="check" size={30} color={colors.white} />
          </HStack>
          <AppModalCloseButton
            onPress={onClose}
            accessibilityLabel="Tutup dialog pembayaran berhasil"
            style={styles.successClose}
          />
        </ModalHeader>
        <ModalBody>
          <VStack style={styles.successBody}>
            <Text style={styles.successTitle}>Pembayaran berhasil</Text>
            <Text style={styles.successDescription}>
              Pesanan {orderNumber} sudah masuk ke antrean barista.
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter style={styles.successFooter}>
          <Button onPress={onViewQueue} style={[styles.primaryButton, styles.successButton]}>
            <ButtonText style={styles.primaryButtonText}>
              Lihat antrean pesanan
            </ButtonText>
            <AppIcon name="arrow-right" size={18} color={colors.white} />
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
