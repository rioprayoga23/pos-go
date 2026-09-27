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
import { ScrollView } from "react-native";
import {
  DropdownSelect,
  type DropdownOption,
} from "../../../components/dropdown-select";
import {
  AppIcon,
  AppInput,
  AppModalCloseButton,
  AppPressable,
} from "../../../components/ui";
import { colors } from "../../../theme";
import {
  digitsOnly,
  formatPreciseCurrency,
  formatThousands,
  parseWholeNumber,
} from "../../../utils/format";
import type { StockItem } from "../../../types/stock";
import type { StockItemDraft } from "../api";
import { stockUnitOptions } from "../data/options";
import { styles } from "../styles";
import {
  getPurchaseUnitPrice,
  getStockUnitsPerPurchaseUnit,
} from "../utils/stock";

export type StockItemFormDraft = StockItemDraft & {
  actualStock: number;
  purchaseUnitPriceRupiah: number;
  note: string;
};

type Props = {
  item: StockItem;
  height: number;
  onClose: () => void;
  onSubmit: (draft: StockItemFormDraft) => Promise<void>;
};

export function StockItemModal({ item, height, onClose, onSubmit }: Props) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [unit, setUnit] = useState(item.unit);
  const purchaseUnit = item.purchaseUnit ?? item.unit;
  const [actualStockInput, setActualStockInput] = useState(String(item.stock));
  const [purchaseUnitPriceInput, setPurchaseUnitPriceInput] = useState(() =>
    String(Math.round(getPurchaseUnitPrice(item))),
  );
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const actualStock = parseWholeNumber(actualStockInput);
  const purchaseUnitPrice = parseWholeNumber(purchaseUnitPriceInput);
  const currentPurchaseUnitPrice = Math.round(getPurchaseUnitPrice(item));
  const stockChanged =
    actualStockInput.trim() !== "" && actualStock !== item.stock;
  const priceChanged =
    purchaseUnitPriceInput.trim() !== "" &&
    purchaseUnitPrice !== currentPurchaseUnitPrice;
  const metadataChanged =
    name.trim() !== item.name ||
    description.trim() !== item.description ||
    unit !== item.unit;
  const correctionDelta = actualStock - item.stock;
  const pricePreview = purchaseUnitPrice / getStockUnitsPerPurchaseUnit(item);
  const unitOptions: DropdownOption<string>[] = stockUnitOptions.map(
    (option) => ({
      value: option.value,
      label: option.label,
    }),
  );
  const canSubmit = Boolean(
    name.trim() &&
    unit &&
    purchaseUnitPriceInput.trim() &&
    (metadataChanged || stockChanged || priceChanged) &&
    (!stockChanged || note.trim()),
  );

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        unit,
        purchaseUnit,
        stockUnitsPerPurchaseUnit: getStockUnitsPerPurchaseUnit(item),
        actualStock: actualStockInput.trim() ? actualStock : item.stock,
        purchaseUnitPriceRupiah: purchaseUnitPrice,
        note: note.trim(),
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Bahan gagal disimpan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent
        style={[styles.modal, { maxHeight: Math.max(500, height - 28) }]}
      >
        <ModalHeader style={styles.modalHeader}>
          <HStack style={styles.modalIcon}>
            <AppIcon name="pencil-outline" size={18} color={colors.primary} />
          </HStack>
          <VStack style={styles.modalHeading}>
            <Text style={styles.modalTitle}>Ubah Bahan</Text>
            <Text style={styles.modalSubtitle}>
              Atur bahan, stok, dan harga modal
            </Text>
          </VStack>
          <AppModalCloseButton
            onPress={onClose}
            accessibilityLabel="Tutup form bahan"
          />
        </ModalHeader>

        <ModalBody style={styles.modalBody}>
          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalForm}
          >
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Nama bahan</Text>
              <AppInput
                value={name}
                onChangeText={setName}
                placeholder="Contoh: Air Minum"
                autoCapitalize="words"
                style={styles.formInput}
                inputStyle={styles.formInputText}
                accessibilityLabel="Nama bahan"
              />
            </VStack>
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Deskripsi</Text>
              <AppInput
                value={description}
                onChangeText={setDescription}
                placeholder="Keterangan bahan (opsional)"
                style={styles.formInput}
                inputStyle={styles.formInputText}
                accessibilityLabel="Deskripsi bahan"
              />
            </VStack>
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Satuan stok</Text>
              <DropdownSelect
                options={unitOptions}
                value={unit}
                onChange={setUnit}
                placeholder="Pilih satuan stok"
                accessibilityLabel="Pilih satuan stok"
              />
            </VStack>
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Stok fisik saat ini</Text>
              <AppInput
                value={formatThousands(actualStockInput)}
                onChangeText={(value) =>
                  setActualStockInput(digitsOnly(value))
                }
                keyboardType="number-pad"
                style={styles.formInput}
                inputStyle={styles.formInputText}
                trailing={<Text style={styles.inputPrefix}>{unit}</Text>}
                accessibilityLabel={`Stok fisik saat ini dalam ${unit}`}
              />
            </VStack>
            {stockChanged ? (
              <>
                <VStack style={styles.summaryBox}>
                  <HStack style={styles.summaryLine}>
                    <Text style={styles.summaryLineLabel}>Selisih stok</Text>
                    <Text
                      style={[
                        styles.summaryLineValue,
                        correctionDelta < 0 && styles.textWarning,
                      ]}
                    >
                      {correctionDelta > 0
                        ? "+"
                        : correctionDelta < 0
                          ? "−"
                          : ""}
                      {formatThousands(Math.abs(correctionDelta))} {unit}
                    </Text>
                  </HStack>
                </VStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Catatan (wajib)</Text>
                  <AppInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Tuliskan alasan perubahan stok"
                    style={styles.formInput}
                    inputStyle={styles.formInputText}
                    accessibilityLabel="Catatan wajib untuk perubahan stok"
                  />
                </VStack>
              </>
            ) : null}
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Harga modal per {purchaseUnit}
              </Text>
              <AppInput
                value={formatThousands(purchaseUnitPriceInput)}
                onChangeText={(value) =>
                  setPurchaseUnitPriceInput(digitsOnly(value))
                }
                placeholder="0"
                keyboardType="number-pad"
                style={styles.formInput}
                inputStyle={styles.formInputText}
                leading={<Text style={styles.inputPrefix}>Rp</Text>}
                accessibilityLabel={`Harga modal per ${purchaseUnit}`}
              />
              <Text style={styles.formHint}>
                Setara {formatPreciseCurrency(pricePreview)} / {unit}
              </Text>
            </VStack>
            {submitError ? (
              <Text style={styles.formError}>{submitError}</Text>
            ) : null}
          </ScrollView>
        </ModalBody>

        <ModalFooter style={styles.modalFooter}>
          <AppPressable
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            style={[
              styles.saveButton,
              (!canSubmit || isSubmitting) && styles.saveButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit || isSubmitting }}
          >
            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
          </AppPressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
