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
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { ApiError } from "../../../services/apiClient";
import { digitsOnly, formatThousands, parseWholeNumber } from "../../../utils/format";
import {
  AppIcon,
  AppInput,
  AppModalCloseButton,
  AppPressable,
} from "../../../components/ui";
import { colors } from "../../../theme";
import type { CashExpenseDraft, CashFundingSource } from "../../../types/cash";
import { styles } from "../styles";

export type OperationalExpenseDraft = CashExpenseDraft;

export function AddExpenseModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: OperationalExpenseDraft) => Promise<void>;
  isSaving: boolean;
}) {
  const { height } = useWindowDimensions();
  const [description, setDescription] = useState("");
  const [detail, setDetail] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [fundingSource, setFundingSource] =
    useState<CashFundingSource>("cash_drawer");
  const [error, setError] = useState("");
  const amountRupiah = parseWholeNumber(amountInput);
  const canSave = Boolean(description.trim() && amountRupiah > 0);

  const handleSave = async () => {
    if (!description.trim()) {
      setError("Masukkan keterangan uang keluar.");
      return;
    }
    if (amountRupiah <= 0) {
      setError("Nominal harus lebih dari Rp 0.");
      return;
    }
    try {
      await onSave({
        description: description.trim(),
        note: detail.trim(),
        amountRupiah,
        fundingSource,
      });
    } catch (saveError) {
      setError(
        saveError instanceof ApiError
          ? saveError.message
          : "Uang keluar gagal disimpan.",
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent
        style={[styles.modal, { maxHeight: Math.max(320, height - 24) }]}
      >
        <ModalHeader style={styles.modalHeader}>
          <HStack style={styles.modalIcon}>
            <AppIcon name="cash-minus" size={18} color={colors.primary} />
          </HStack>
          <VStack style={styles.modalHeading}>
            <Text style={styles.modalTitle}>Catat Uang Keluar</Text>
            <Text style={styles.modalSubtitle}>
              {fundingSource === "cash_drawer"
                ? "Nominal akan mengurangi uang di laci."
                : "Dicatat dari transfer dana luar; saldo laci tidak berubah."}
            </Text>
          </VStack>
          <AppModalCloseButton
            onPress={onClose}
            accessibilityLabel="Tutup form uang keluar"
          />
        </ModalHeader>
        <ModalBody style={styles.modalBody}>
          <VStack style={styles.modalForm}>
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Keterangan</Text>
              <AppInput
                value={description}
                onChangeText={(value) => {
                  setDescription(value);
                  setError("");
                }}
                placeholder="Contoh: Es batu"
                accessibilityLabel="Keterangan uang keluar"
              />
            </VStack>
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Sumber dana</Text>
              <HStack style={styles.fundingRow}>
                {([
                  {
                    value: "cash_drawer",
                    label: "Uang laci",
                    icon: "cash-register",
                  },
                  {
                    value: "external_transfer",
                    label: "Transfer dari dana luar",
                    icon: "bank-transfer",
                  },
                ] as const).map((option) => {
                  const selected = fundingSource === option.value;
                  return (
                    <AppPressable
                      key={option.value}
                      onPress={() => {
                        setFundingSource(option.value);
                        setError("");
                      }}
                      style={[
                        styles.fundingButton,
                        selected && styles.fundingButtonActive,
                      ]}
                      accessibilityRole="radio"
                      accessibilityLabel={option.label}
                      accessibilityState={{ selected }}
                    >
                      <AppIcon
                        name={option.icon}
                        size={16}
                        color={selected ? colors.primary : colors.inkMuted}
                      />
                      <Text
                        style={[
                          styles.fundingText,
                          selected && styles.fundingTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </AppPressable>
                  );
                })}
              </HStack>
            </VStack>
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Nominal</Text>
              <AppInput
                value={formatThousands(amountInput)}
                onChangeText={(value) => {
                  setAmountInput(digitsOnly(value, 12));
                  setError("");
                }}
                keyboardType="number-pad"
                placeholder="0"
                leading={<Text style={styles.inputPrefix}>Rp</Text>}
                accessibilityLabel="Nominal uang keluar"
              />
            </VStack>
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Catatan (opsional)</Text>
              <AppInput
                value={detail}
                onChangeText={setDetail}
                placeholder="Catatan"
                accessibilityLabel="Catatan uang keluar"
              />
            </VStack>
            {error ? <Text style={styles.formError}>{error}</Text> : null}
          </VStack>
        </ModalBody>
        <ModalFooter style={styles.modalFooter}>
          <AppPressable
            onPress={handleSave}
            disabled={!canSave || isSaving}
            style={[
              styles.saveButton,
              (!canSave || isSaving) && styles.saveButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Simpan uang keluar"
            accessibilityState={{ disabled: !canSave || isSaving }}
          >
            <Text style={styles.saveButtonText}>Simpan</Text>
          </AppPressable>
          <AppPressable
            onPress={onClose}
            style={styles.cancelButton}
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </AppPressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
