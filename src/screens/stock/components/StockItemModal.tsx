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
  decimalOnly,
  formatDecimalInput,
  formatPreciseCurrency,
  formatQuantity,
  formatThousands,
  isValidQuantity,
  parseDecimal,
  parseWholeNumber,
} from "../../../utils/format";
import type { StockItem } from "../../../types/stock";
import type { StockItemDraft } from "../api";
import { styles } from "../styles";
import {
  getPurchaseUnitPrice,
  getStockUnitsPerPurchaseUnit,
} from "../utils/stock";
import {
  calculateStockUnitsPerPurchaseUnit,
  getPurchaseUnitOptions,
} from "../utils/unitConversion";

export type StockItemFormDraft = StockItemDraft & {
  actualStock: number;
  purchaseUnitPriceRupiah: number;
  purchaseUnitPriceEdited: boolean;
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
  const unit = item.unit;
  const [purchaseUnit, setPurchaseUnit] = useState(item.purchaseUnit ?? item.unit);
  const [actualStockInput, setActualStockInput] = useState(String(item.stock));
  const [purchaseUnitPriceInput, setPurchaseUnitPriceInput] = useState(() =>
    String(Math.round(getPurchaseUnitPrice(item))),
  );
  const [purchaseUnitPriceEdited, setPurchaseUnitPriceEdited] = useState(false);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const actualStock = parseDecimal(actualStockInput);
  const purchaseUnitPrice = parseWholeNumber(purchaseUnitPriceInput);
  const currentPurchaseUnitPrice = Math.round(getPurchaseUnitPrice(item));
  const stockUnitsPerPurchaseUnit = calculateStockUnitsPerPurchaseUnit(purchaseUnit, unit) ?? 0;
  const stockChanged =
    actualStockInput.trim() !== "" && actualStock !== item.stock;
  const priceChanged =
    purchaseUnitPriceInput.trim() !== "" &&
    purchaseUnitPrice !== currentPurchaseUnitPrice;
  const metadataChanged =
    name.trim() !== item.name ||
    description.trim() !== item.description ||
    unit !== item.unit ||
    purchaseUnit !== (item.purchaseUnit ?? item.unit) ||
    stockUnitsPerPurchaseUnit !== getStockUnitsPerPurchaseUnit(item);
  const correctionDelta = Math.round((actualStock - item.stock) * 1_000_000_000) / 1_000_000_000;
  const pricePreview = stockUnitsPerPurchaseUnit > 0
    ? purchaseUnitPrice / stockUnitsPerPurchaseUnit
    : 0;
  const purchaseUnitOptions: DropdownOption<string>[] = getPurchaseUnitOptions(unit).map((option) => ({
    value: option.value,
    label: option.label,
  }));
  const canSubmit = Boolean(
    name.trim() &&
    unit &&
    purchaseUnit &&
    stockUnitsPerPurchaseUnit > 0 &&
    purchaseUnitPriceInput.trim() &&
    (metadataChanged || stockChanged || priceChanged) &&
    isValidQuantity(actualStock) &&
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
        stockUnitsPerPurchaseUnit,
        actualStock: actualStockInput.trim() ? actualStock : item.stock,
        purchaseUnitPriceRupiah: purchaseUnitPrice,
        purchaseUnitPriceEdited,
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
              <AppInput
                value={unit}
                onChangeText={() => undefined}
                editable={false}
                accessibilityLabel="Satuan stok"
              />
              <Text style={styles.formHint}>
                Takaran resep mengikuti satuan pembelian dan dikonversi otomatis ke satuan stok ini.
              </Text>
            </VStack>
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Satuan pembelian</Text>
              <DropdownSelect
                options={purchaseUnitOptions}
                value={purchaseUnit}
                onChange={(nextPurchaseUnit) => {
                  const currentFactor = calculateStockUnitsPerPurchaseUnit(purchaseUnit, unit);
                  const nextFactor = calculateStockUnitsPerPurchaseUnit(nextPurchaseUnit, unit);
                  const enteredPrice = parseWholeNumber(purchaseUnitPriceInput);
                  if (currentFactor && nextFactor && enteredPrice > 0) {
                    setPurchaseUnitPriceInput(
                      String(Math.round((enteredPrice / currentFactor) * nextFactor)),
                    );
                  }
                  setPurchaseUnit(nextPurchaseUnit);
                }}
                placeholder="Pilih satuan pembelian"
                accessibilityLabel="Pilih satuan pembelian"
              />
              {stockUnitsPerPurchaseUnit > 0 ? (
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Konversi otomatis</Text>
                  <AppInput
                    value={`1 ${purchaseUnit} = ${formatQuantity(stockUnitsPerPurchaseUnit)} ${unit}`}
                    onChangeText={() => undefined}
                    editable={false}
                    accessibilityLabel="Konversi satuan otomatis"
                  />
                </VStack>
              ) : null}
            </VStack>
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Stok fisik saat ini</Text>
              <AppInput
                value={formatDecimalInput(actualStockInput)}
                onChangeText={(value) =>
                  setActualStockInput(decimalOnly(value))
                }
                keyboardType="decimal-pad"
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
                      {formatQuantity(Math.abs(correctionDelta))} {unit}
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
                onChangeText={(value) => {
                  setPurchaseUnitPriceInput(digitsOnly(value));
                  setPurchaseUnitPriceEdited(true);
                }}
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
