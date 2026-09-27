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
import type { CashRegister } from "../../../types/cash";
import { colors } from "../../../theme";
import { digitsOnly, formatCurrency, formatThousands, parseWholeNumber } from "../../../utils/format";
import {
  AppIcon,
  AppModalCloseButton,
  AppPressable as Pressable,
} from "../../ui";
import { styles } from "../styles";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (countedCash: number) => Promise<void>;
  register: CashRegister;
  error: string;
  isSubmitting: boolean;
};

export function CloseShiftDialog({
  isOpen,
  onClose,
  onConfirm,
  register,
  error,
  isSubmitting,
}: Props) {
  const [countedCash, setCountedCash] = useState("");
  const expectedCash = register.expectedAmountRupiah;
  const hasCount = countedCash !== "";
  const actualCash = parseWholeNumber(countedCash);
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
            <Text style={styles.closeShiftModalTitle}>
              Tutup kasir hari ini?
            </Text>
            <Text style={styles.closeShiftModalSubtitle}>
              Cocokkan uang fisik dengan perkiraan kas.
            </Text>
          </VStack>
          <AppModalCloseButton
            onPress={handleClose}
            accessibilityLabel="Tutup dialog tutup kasir"
          />
        </ModalHeader>
        <ModalBody>
          <Text style={styles.closeShiftModalCopy}>
            Pastikan tidak ada pembayaran yang sedang diproses. Hitung seluruh
            uang tunai fisik di laci, termasuk uang awal. Jangan masukkan
            pembayaran QRIS atau saldo rekening.
          </Text>
          <VStack style={styles.closeShiftCashSummary}>
            <HStack style={styles.closeShiftCashRow}>
              <Text style={styles.closeShiftCashLabel}>Uang awal</Text>
              <Text style={styles.closeShiftCashValue}>
                {formatCurrency(register.openingAmountRupiah)}
              </Text>
            </HStack>
            <HStack style={styles.closeShiftCashRow}>
              <Text style={styles.closeShiftCashLabel}>Penjualan tunai</Text>
              <Text style={styles.closeShiftCashValue}>
                {formatCurrency(register.cashSalesRupiah)}
              </Text>
            </HStack>
            <HStack style={styles.closeShiftCashRow}>
              <Text style={styles.closeShiftCashLabel}>Pengeluaran kas</Text>
              <Text style={styles.closeShiftCashValue}>
                − {formatCurrency(register.cashOutflowsRupiah)}
              </Text>
            </HStack>
            <HStack style={styles.closeShiftCashRow}>
              <Text style={styles.closeShiftCashTotalLabel}>
                Perkiraan uang di laci
              </Text>
              <Text style={styles.closeShiftCashTotal}>
                {formatCurrency(expectedCash)}
              </Text>
            </HStack>
          </VStack>
          <Text style={styles.closeShiftCountLabel}>
            UANG FISIK HASIL HITUNG
          </Text>
          <Input style={styles.closeShiftCountInput}>
            <Text style={styles.closeShiftCountPrefix}>Rp</Text>
            <InputField
              value={formatThousands(countedCash)}
              onChangeText={(value) => setCountedCash(digitsOnly(value, 12))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.inkSubtle}
              accessibilityLabel="Uang fisik di laci saat tutup kasir"
              style={styles.closeShiftCountField}
            />
          </Input>
          {hasCount ? (
            <Text
              style={[
                styles.closeShiftDifference,
                difference === 0
                  ? styles.closeShiftDifferenceMatch
                  : styles.closeShiftDifferenceMismatch,
              ]}
            >
              {difference === 0
                ? "Kas sesuai"
                : difference > 0
                  ? `Selisih lebih ${formatCurrency(difference)}`
                  : `Selisih kurang ${formatCurrency(Math.abs(difference))}`}
            </Text>
          ) : null}
          {error ? (
            <Text style={styles.closeShiftDifferenceMismatch}>{error}</Text>
          ) : null}
        </ModalBody>
        <ModalFooter style={styles.closeShiftModalFooter}>
          <Pressable
            onPress={() => void onConfirm(actualCash)}
            disabled={!hasCount || isSubmitting}
            style={[
              styles.closeShiftConfirmButton,
              (!hasCount || isSubmitting) && styles.closeShiftConfirmDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Konfirmasi tutup kasir"
            accessibilityState={{ disabled: !hasCount || isSubmitting }}
          >
            <AppIcon name="check" size={17} color={colors.white} />
            <Text style={styles.closeShiftConfirmText}>Tutup Kasir</Text>
          </Pressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
