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
  onViewQueue: () => void;
  onConfirm: (countedCash: number) => Promise<void>;
  register: CashRegister;
  error: string;
  hasActiveQueue: boolean;
  isSubmitting: boolean;
};

export function CloseShiftDialog({
  isOpen,
  onClose,
  onViewQueue,
  onConfirm,
  register,
  error,
  hasActiveQueue,
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
              Tutup sesi kasir?
            </Text>
          </VStack>
          <AppModalCloseButton
            onPress={handleClose}
            style={styles.closeShiftDismissButton}
            accessibilityLabel="Tutup dialog tutup kasir"
          />
        </ModalHeader>
        <ModalBody>
          <Text style={styles.closeShiftModalCopy}>
            Hitung tunai dan uang awal; QRIS tidak termasuk.
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
          {error ? (
            <HStack style={[styles.closeShiftQueueNotice, hasActiveQueue && styles.closeShiftQueueNoticeActive]}>
              <AppIcon name="alert-circle-outline" size={18} color={colors.danger} />
              <Text style={styles.closeShiftQueueNoticeText}>
                {hasActiveQueue ? "Selesaikan antrean." : error}
              </Text>
              {hasActiveQueue ? (
                <Pressable
                  onPress={onViewQueue}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Buka Antrean"
                  accessibilityState={{ disabled: isSubmitting }}
                  style={styles.closeShiftQueueLink}
                >
                  <Text style={styles.closeShiftQueueLinkText}>Buka Antrean</Text>
                  <AppIcon name="arrow-right" size={15} color={colors.danger} />
                </Pressable>
              ) : null}
            </HStack>
          ) : null}
          <HStack style={styles.closeShiftCountHeading}>
            <Text style={styles.closeShiftCountLabel}>Uang fisik di laci</Text>
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
                    ? `Lebih ${formatCurrency(difference)}`
                    : `Kurang ${formatCurrency(Math.abs(difference))}`}
              </Text>
            ) : null}
          </HStack>
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
        </ModalBody>
        <ModalFooter style={styles.closeShiftModalFooter}>
          <Pressable
            onPress={() => void onConfirm(actualCash)}
            disabled={!hasCount || hasActiveQueue || isSubmitting}
            style={[
              styles.closeShiftConfirmButton,
              (!hasCount || hasActiveQueue || isSubmitting) && styles.closeShiftConfirmDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Konfirmasi tutup kasir"
            accessibilityState={{ disabled: !hasCount || hasActiveQueue || isSubmitting }}
          >
            <AppIcon
              name="lock-outline"
              size={17}
              color={!hasCount || hasActiveQueue || isSubmitting ? colors.inkMuted : colors.white}
            />
            <Text
              style={[
                styles.closeShiftConfirmText,
                (!hasCount || hasActiveQueue || isSubmitting) && styles.closeShiftConfirmDisabledText,
              ]}
            >
              Tutup Kasir
            </Text>
          </Pressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
