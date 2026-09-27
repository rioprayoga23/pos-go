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
import { AppIcon, AppInput, AppModalCloseButton, AppPressable } from "../../../components/ui";
import { colors } from "../../../theme";
import { getLocalDateKey } from "../../../utils/date";
import { styles } from "../styles";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "").slice(0, 12);
}

function formatAmountInput(value: string) {
  return digitsOnly(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export type OperationalExpenseDraft = {
  dateKey: string;
  time: string;
  description: string;
  detail: string;
  category: string;
  source: "cash" | "transfer";
  amount: number;
};

export function AddExpenseModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: OperationalExpenseDraft) => boolean;
}) {
  const { height } = useWindowDimensions();
  const [description, setDescription] = useState("");
  const [detail, setDetail] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [error, setError] = useState("");
  const amount = Number(digitsOnly(amountInput));
  const canSave = Boolean(description.trim() && amount > 0);

  const handleSave = () => {
    if (!description.trim()) {
      setError("Masukkan keterangan uang keluar.");
      return;
    }
    if (amount <= 0) {
      setError("Nominal harus lebih dari Rp 0.");
      return;
    }
    const saved = onSave({
      dateKey: getLocalDateKey(),
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      description: description.trim(),
      detail: detail.trim(),
      category: "Pengeluaran dari laci",
      source: "cash",
      amount,
    });
    if (!saved) setError("Nominal melebihi uang tunai yang tersedia di laci.");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={[styles.modal, { maxHeight: Math.max(320, height - 24) }]}>
        <ModalHeader style={styles.modalHeader}>
          <HStack style={styles.modalIcon}>
            <AppIcon name="cash-minus" size={18} color={colors.primary} />
          </HStack>
          <VStack style={styles.modalHeading}>
            <Text style={styles.modalTitle}>Catat Uang Keluar</Text>
            <Text style={styles.modalSubtitle}>Nominal akan mengurangi uang di laci.</Text>
          </VStack>
          <AppModalCloseButton onPress={onClose} accessibilityLabel="Tutup form uang keluar" />
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
              <Text style={styles.formLabel}>Nominal</Text>
              <AppInput
                value={formatAmountInput(amountInput)}
                onChangeText={(value) => {
                  setAmountInput(digitsOnly(value));
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
            disabled={!canSave}
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Simpan uang keluar"
            accessibilityState={{ disabled: !canSave }}
          >
            <Text style={styles.saveButtonText}>Simpan</Text>
          </AppPressable>
          <AppPressable onPress={onClose} style={styles.cancelButton} accessibilityRole="button">
            <Text style={styles.cancelButtonText}>Batal</Text>
          </AppPressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
