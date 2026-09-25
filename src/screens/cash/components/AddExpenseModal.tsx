import {
  HStack,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { DateRangePickerModal } from "../../../components/date-range-picker/DateRangePickerModal";
import {
  AppIcon,
  AppInput,
  AppModalCloseButton,
  AppPressable,
} from "../../../components/ui";
import { colors } from "../../../theme";
import type { DateRange } from "../../../types/dateRange";
import { formatDateKey } from "../../../utils/date";
import { formatCurrency } from "../../../utils/format";
import { getCashDateTimeLabel } from "../utils/transactionDisplay";
import { styles } from "../styles";

const categoryOptions = [
  "Iuran & Lingkungan",
  "Listrik & Air",
  "Kebersihan & Sanitasi",
  "Maintenance & Perbaikan",
  "Transportasi & Kurir",
  "Operasional Lainnya",
];

const initialDate = "2024-10-24";

function formatAmountInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
  onSave: (expense: OperationalExpenseDraft) => void;
}) {
  const { height } = useWindowDimensions();
  const [description, setDescription] = useState("");
  const [detail, setDetail] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [dateKey, setDateKey] = useState(initialDate);
  const [time, setTime] = useState("14:00");
  const [source, setSource] = useState<"cash" | "transfer">("cash");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [error, setError] = useState("");
  const amount = Number(amountInput.replace(/\D/g, ""));
  const validTime = /^([01]?\d|2[0-3]):[0-5]\d$/.test(time.trim());
  const canSave = Boolean(description.trim() && amount > 0);

  const applyDate = (range: DateRange) => {
    setDateKey(range.startDate);
    setDatePickerOpen(false);
  };

  const handleSave = () => {
    if (!description.trim()) {
      setError("Masukkan nama pengeluaran.");
      return;
    }
    if (amount <= 0) {
      setError("Nominal harus lebih dari Rp 0.");
      return;
    }
    if (!validTime) {
      setError("Gunakan format waktu 24 jam, misalnya 14:00.");
      return;
    }
    onSave({
      dateKey,
      time: time.trim(),
      description: description.trim(),
      detail: detail.trim(),
      category: `Operasional (${category})`,
      source,
      amount,
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalBackdrop />
        <ModalContent
          style={[styles.modal, { maxHeight: Math.max(320, height - 24) }]}
        >
          <ModalHeader style={styles.modalHeader}>
            <HStack style={styles.modalIcon}>
              <AppIcon name="plus" size={18} color={colors.primary} />
            </HStack>
            <VStack style={styles.modalHeading}>
              <Text style={styles.modalTitle}>Catat Pengeluaran</Text>
              <Text style={styles.modalSubtitle}>
                Catat biaya operasional outlet dengan rinci.
              </Text>
            </VStack>
            <AppModalCloseButton
              onPress={onClose}
              accessibilityLabel="Tutup form pengeluaran"
            />
          </ModalHeader>

          <ModalBody style={styles.modalBody}>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalForm}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <VStack style={styles.formGroup}>
                <Text style={styles.formLabel}>Nama Pengeluaran</Text>
                <AppInput
                  value={description}
                  onChangeText={(value) => {
                    setDescription(value);
                    setError("");
                  }}
                  placeholder="Contoh: Iuran keamanan ruko"
                  style={styles.formInput}
                  accessibilityLabel="Nama pengeluaran"
                />
              </VStack>

              <VStack style={styles.formGroup}>
                <Text style={styles.formLabel}>Kategori</Text>
                <AppPressable
                  onPress={() => setCategoryOpen((open) => !open)}
                  style={styles.selectControl}
                  accessibilityRole="button"
                  accessibilityLabel={`Kategori pengeluaran, ${category}`}
                  accessibilityState={{ expanded: categoryOpen }}
                >
                  <Text style={styles.selectText}>{category}</Text>
                  <AppIcon
                    name={categoryOpen ? "chevron-up" : "chevron-down"}
                    size={17}
                    color={colors.inkMuted}
                  />
                </AppPressable>
                {categoryOpen ? (
                  <VStack style={styles.categoryOptions}>
                    {categoryOptions.map((option) => {
                      const active = option === category;
                      return (
                        <AppPressable
                          key={option}
                          onPress={() => {
                            setCategory(option);
                            setCategoryOpen(false);
                          }}
                          style={[
                            styles.categoryOption,
                            active && styles.categoryOptionActive,
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                        >
                          <Text
                            style={[
                              styles.categoryOptionText,
                              active && styles.categoryOptionTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </AppPressable>
                      );
                    })}
                  </VStack>
                ) : null}
              </VStack>

              <VStack style={styles.formGroup}>
                <Text style={styles.formLabel}>Nominal</Text>
                <AppInput
                  value={amountInput}
                  onChangeText={(value) => {
                    setAmountInput(formatAmountInput(value));
                    setError("");
                  }}
                  keyboardType="number-pad"
                  placeholder="0"
                  style={styles.formInput}
                  inputStyle={styles.amountInput}
                  leading={<Text style={styles.inputPrefix}>Rp</Text>}
                  accessibilityLabel="Nominal pengeluaran dalam rupiah"
                />
                {amount > 0 ? (
                  <Text style={styles.formHint}>{formatCurrency(amount)}</Text>
                ) : null}
              </VStack>

              <VStack style={styles.formGroup}>
                <Text style={styles.formLabel}>Tanggal &amp; Waktu Transaksi</Text>
                <HStack style={styles.dateTimeRow}>
                  <AppPressable
                    onPress={() => setDatePickerOpen(true)}
                    style={styles.dateButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Pilih tanggal transaksi, ${getCashDateTimeLabel(dateKey, time)}`}
                  >
                    <AppIcon
                      name="calendar-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.dateButtonText} numberOfLines={1}>
                      {formatDateKey(dateKey)}
                    </Text>
                  </AppPressable>
                  <AppInput
                    value={time}
                    onChangeText={(value) => {
                      setTime(value);
                      setError("");
                    }}
                    keyboardType="numbers-and-punctuation"
                    placeholder="14:00"
                    style={styles.timeInput}
                    accessibilityLabel="Waktu transaksi, format jam dan menit"
                  />
                </HStack>
              </VStack>

              <VStack style={styles.formGroup}>
                <Text style={styles.formLabel}>Sumber Dana</Text>
                <HStack style={styles.fundingRow}>
                  <AppPressable
                    onPress={() => setSource("cash")}
                    style={[
                      styles.fundingButton,
                      source === "cash" && styles.fundingButtonActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: source === "cash" }}
                  >
                    <AppIcon
                      name="cash"
                      size={16}
                      color={source === "cash" ? colors.primary : colors.inkMuted}
                    />
                    <Text
                      style={[
                        styles.fundingText,
                        source === "cash" && styles.fundingTextActive,
                      ]}
                    >
                      Kas Laci
                    </Text>
                  </AppPressable>
                  <AppPressable
                    onPress={() => setSource("transfer")}
                    style={[
                      styles.fundingButton,
                      source === "transfer" && styles.fundingButtonActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: source === "transfer" }}
                  >
                    <AppIcon
                      name="bank-transfer"
                      size={16}
                      color={source === "transfer" ? colors.primary : colors.inkMuted}
                    />
                    <Text
                      style={[
                        styles.fundingText,
                        source === "transfer" && styles.fundingTextActive,
                      ]}
                    >
                      Rekening Usaha
                    </Text>
                  </AppPressable>
                </HStack>
              </VStack>

              <VStack style={styles.formGroup}>
                <Text style={styles.formLabel}>Catatan Tambahan (Opsional)</Text>
                <AppInput
                  value={detail}
                  onChangeText={setDetail}
                  placeholder="Contoh: Dibayar ke pengelola ruko"
                  style={styles.formInput}
                  accessibilityLabel="Catatan tambahan"
                />
              </VStack>

              {error ? <Text style={styles.formError}>{error}</Text> : null}
              <Text style={styles.formHint}>
                Transaksi tersimpan di riwayat pengeluaran outlet.
              </Text>
            </ScrollView>
          </ModalBody>

          <ModalFooter style={styles.modalFooter}>
            <AppPressable
              onPress={handleSave}
              disabled={!canSave}
              style={[
                styles.saveButton,
                !canSave && styles.saveButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Simpan transaksi pengeluaran"
            >
              <Text style={styles.saveButtonText}>Simpan Pengeluaran</Text>
            </AppPressable>
            <AppPressable
              onPress={onClose}
              style={styles.cancelButton}
              accessibilityRole="button"
              accessibilityLabel="Batal mencatat pengeluaran"
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </AppPressable>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {datePickerOpen ? (
        <DateRangePickerModal
          key={dateKey}
          isOpen
          initialRange={{ startDate: dateKey, endDate: dateKey }}
          onClose={() => setDatePickerOpen(false)}
          onApply={applyDate}
        />
      ) : null}
    </>
  );
}
