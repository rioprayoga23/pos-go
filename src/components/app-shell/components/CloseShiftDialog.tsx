import {
  HStack,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useState } from "react";
import { useTransactionStore } from "../../../store/transactionStore";
import { colors } from "../../../theme";
import { formatCurrency } from "../../../utils/format";
import {
  AppIcon,
  AppModalCloseButton,
  AppPressable as Pressable,
} from "../../ui";
import { styles } from "../styles";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (countedCash: number) => void;
};

export function CloseShiftDialog({ isOpen, onClose, onConfirm }: Props) {
  const openingCash = useTransactionStore((state) => state.openingCash);
  const cashSalesInShift = useTransactionStore((state) => state.cashSalesInShift);
  const [countedCash, setCountedCash] = useState("");
  const expectedCash = (openingCash ?? 0) + cashSalesInShift;
  const hasCount = countedCash !== "";
  const actualCash = Number(countedCash) || 0;
  const difference = actualCash - expectedCash;
  const handleClose = () => {
    setCountedCash("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalBackdrop />
      <ModalContent style={styles.closeShiftModal}>
        <ModalHeader style={styles.closeShiftModalHeader}>
          <HStack style={styles.closeShiftModalIcon}>
            <AppIcon name="cash-register" size={21} color={colors.danger} />
          </HStack>
          <VStack style={styles.closeShiftModalHeading}>
            <Text style={styles.closeShiftModalTitle}>Tutup kasir hari ini?</Text>
            <Text style={styles.closeShiftModalSubtitle}>
              Tinjau ringkasan penjualan setelah ditutup.
            </Text>
          </VStack>
          <AppModalCloseButton
            onPress={handleClose}
            accessibilityLabel="Tutup dialog tutup kasir"
          />
        </ModalHeader>
        <ModalBody>
          <Text style={styles.closeShiftModalCopy}>
            Pesanan yang siap diambil akan ditandai selesai. Pastikan transaksi
            hari ini sudah sesuai sebelum melanjutkan.
          </Text>
          <VStack style={styles.closeShiftCashSummary}>
            <HStack style={styles.closeShiftCashRow}>
              <Text style={styles.closeShiftCashLabel}>Uang awal</Text>
              <Text style={styles.closeShiftCashValue}>{formatCurrency(openingCash ?? 0)}</Text>
            </HStack>
            <HStack style={styles.closeShiftCashRow}>
              <Text style={styles.closeShiftCashLabel}>Penjualan tunai</Text>
              <Text style={styles.closeShiftCashValue}>{formatCurrency(cashSalesInShift)}</Text>
            </HStack>
            <HStack style={styles.closeShiftCashRow}>
              <Text style={styles.closeShiftCashTotalLabel}>Perkiraan uang di laci</Text>
              <Text style={styles.closeShiftCashTotal}>{formatCurrency(expectedCash)}</Text>
            </HStack>
          </VStack>
          <Text style={styles.closeShiftCountLabel}>UANG FISIK DI LACI</Text>
          <Input style={styles.closeShiftCountInput}>
            <Text style={styles.closeShiftCountPrefix}>Rp</Text>
            <InputField
              value={countedCash.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              onChangeText={(value) => setCountedCash(value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 12))}
              keyboardType="number-pad"
              placeholder="Hitung uang fisik"
              accessibilityLabel="Uang fisik di laci saat tutup kasir"
              style={styles.closeShiftCountField}
            />
          </Input>
          {hasCount ? (
            <Text style={styles.closeShiftDifference}>
              {difference === 0 ? "Kas sesuai" : difference > 0 ? `Selisih lebih ${formatCurrency(difference)}` : `Selisih kurang ${formatCurrency(Math.abs(difference))}`}
            </Text>
          ) : null}
        </ModalBody>
        <ModalFooter style={styles.closeShiftModalFooter}>
          <Pressable
            onPress={() => {
              onConfirm(actualCash);
              setCountedCash("");
            }}
            disabled={!hasCount}
            style={[styles.closeShiftConfirmButton, !hasCount && styles.closeShiftConfirmDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Konfirmasi tutup kasir"
            accessibilityState={{ disabled: !hasCount }}
          >
            <AppIcon name="check" size={17} color={colors.white} />
            <Text style={styles.closeShiftConfirmText}>Tutup Kasir</Text>
          </Pressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
