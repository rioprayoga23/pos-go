import {
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
import { useWindowDimensions } from "react-native";
import {
  AppIcon,
  AppModalCloseButton,
  AppPressable,
} from "../../../components/ui";
import { colors } from "../../../theme";
import type { CashTransaction } from "../../../types/cash";
import { formatCurrency } from "../../../utils/format";
import { getCashDateTimeLabel } from "../utils/transactionDisplay";
import { styles } from "../styles";

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <HStack style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </HStack>
  );
}

export function CashTransactionDetailModal({
  transaction,
  onClose,
}: {
  transaction: CashTransaction | null;
  onClose: () => void;
}) {
  const { height } = useWindowDimensions();
  if (!transaction) return null;
  const isStock = transaction.categoryKind === "stock_purchase";

  return (
    <Modal isOpen onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent
        style={[styles.modal, { maxHeight: Math.max(300, height - 24) }]}
      >
        <ModalHeader style={styles.modalHeader}>
          <HStack style={styles.modalIcon}>
            <AppIcon
              name={isStock ? "archive-outline" : "cash-minus"}
              size={18}
              color={colors.primary}
            />
          </HStack>
          <VStack style={styles.modalHeading}>
            <Text style={styles.modalTitle}>Detail Transaksi</Text>
            <Text style={styles.modalSubtitle}>Rincian arus kas keluar outlet.</Text>
          </VStack>
          <AppModalCloseButton
            onPress={onClose}
            accessibilityLabel="Tutup detail transaksi"
          />
        </ModalHeader>
        <ModalBody>
          <VStack style={styles.detailRows}>
            <Text style={styles.transactionDescription}>
              {transaction.description}
            </Text>
            <Text style={styles.detailAmount}>
              {formatCurrency(transaction.amount)}
            </Text>
            <ViewDivider />
            <DetailLine
              label="Tanggal & waktu"
              value={getCashDateTimeLabel(transaction.dateKey, transaction.time)}
            />
            <DetailLine label="Kategori" value={transaction.category} />
            {transaction.categoryKind === "operational" ? (
              <DetailLine
                label="Sumber dana"
                value={
                  transaction.fundingSource === "external_transfer"
                    ? "Transfer dari dana luar"
                    : "Uang laci"
                }
              />
            ) : null}
            <DetailLine
              label="Keterangan"
              value={transaction.detail || "Tidak ada catatan tambahan"}
            />
          </VStack>
        </ModalBody>
        <ModalFooter style={styles.modalFooter}>
          <AppPressable
            onPress={onClose}
            style={styles.saveButton}
            accessibilityRole="button"
          >
            <Text style={styles.saveButtonText}>Tutup</Text>
          </AppPressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ViewDivider() {
  return <HStack style={styles.detailDivider} />;
}
