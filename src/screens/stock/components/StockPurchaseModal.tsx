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
import { DropdownSelect, type DropdownOption } from "../../../components/dropdown-select";
import {
  AppIcon,
  AppInput,
  AppModalCloseButton,
  AppPressable,
} from "../../../components/ui";
import { colors } from "../../../theme";
import { formatCurrency, formatThousands } from "../../../utils/format";
import type { StockItem } from "../../../types/stock";
import { customItemOptionId, stockUnitOptions } from "../data/options";
import type { PurchaseDraft } from "../types";
import { getPurchaseUnit, getStockUnitsPerPurchaseUnit } from "../utils/stock";
import { styles } from "../styles";

function parseWholeNumber(value: string) {
  return Math.max(0, Number(value.replace(/\D/g, "")) || 0);
}

export function StockPurchaseModal({
  items,
  initialItemId,
  height,
  itemsError,
  onRetryItems,
  onClose,
  onSubmit,
}: {
  items: StockItem[];
  initialItemId?: string;
  height: number;
  itemsError: boolean;
  onRetryItems: () => void;
  onClose: () => void;
  onSubmit: (draft: PurchaseDraft) => Promise<void>;
}) {
  const [itemId, setItemId] = useState(
    initialItemId ?? items[0]?.id ?? customItemOptionId,
  );
  const [customItemName, setCustomItemName] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [totalCostInput, setTotalCostInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isCustomItem = itemId === customItemOptionId;
  const selectedItem = items.find((item) => item.id === itemId);
  const itemOptions: DropdownOption<string>[] = [
    ...items.map((item) => ({ value: item.id, label: item.name })),
    { value: customItemOptionId, label: "Bahan baru" },
  ];
  const unitOptions: DropdownOption<string>[] = stockUnitOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));
  const normalizedCustomName = customItemName.trim();
  const hasDuplicateCustomName =
    isCustomItem &&
    normalizedCustomName.length > 0 &&
    items.some((item) => item.name.trim().toLowerCase() === normalizedCustomName.toLowerCase());
  const quantity = parseWholeNumber(quantityInput);
  const totalCost = parseWholeNumber(totalCostInput);
  const purchaseUnit = selectedItem ? getPurchaseUnit(selectedItem) : customUnit;
  const conversion = selectedItem ? getStockUnitsPerPurchaseUnit(selectedItem) : 1;
  const incomingStock = quantity * conversion;
  const currentStock = selectedItem?.stock ?? 0;
  const nextStock = currentStock + incomingStock;
  const canSubmit = Boolean(
    quantityInput.trim() &&
    quantity > 0 &&
    totalCost > 0 &&
    (isCustomItem
      ? normalizedCustomName && customUnit && !hasDuplicateCustomName
      : selectedItem),
  );

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const draft: PurchaseDraft = {
        mode: "purchase",
        itemId: isCustomItem ? customItemOptionId : selectedItem!.id,
        ...(isCustomItem
          ? { newItem: { name: normalizedCustomName, unit: customUnit } }
          : {}),
        quantity,
        totalCost,
      };
      await onSubmit(draft);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Stok gagal disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={[styles.modal, { maxHeight: Math.max(500, height - 28) }]}>
        <ModalHeader style={styles.modalHeader}>
          <HStack style={styles.modalIcon}>
            <AppIcon name="plus" size={18} color={colors.primary} />
          </HStack>
          <VStack style={styles.modalHeading}>
            <Text style={styles.modalTitle}>Tambah Stok</Text>
            <Text style={styles.modalSubtitle}>Catat jumlah masuk dan total pembayaran</Text>
          </VStack>
          <AppModalCloseButton onPress={onClose} accessibilityLabel="Tutup form stok" />
        </ModalHeader>

        <ModalBody style={styles.modalBody}>
          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalForm}
          >
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Bahan</Text>
              <DropdownSelect
                options={itemOptions}
                value={itemId}
                onChange={(nextId) => {
                  setItemId(nextId);
                  setQuantityInput("");
                  setTotalCostInput("");
                }}
                placeholder="Pilih bahan"
                accessibilityLabel="Pilih bahan"
              />
              {itemsError ? (
                <AppPressable
                  onPress={onRetryItems}
                  accessibilityRole="button"
                  accessibilityLabel="Coba muat ulang bahan"
                >
                  <Text style={styles.formError}>Daftar bahan gagal dimuat. Coba lagi.</Text>
                </AppPressable>
              ) : null}
            </VStack>

            {isCustomItem ? (
              <>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nama bahan</Text>
                  <AppInput
                    value={customItemName}
                    onChangeText={setCustomItemName}
                    placeholder="Contoh: Susu"
                    autoCapitalize="words"
                    style={styles.formInput}
                    inputStyle={styles.formInputText}
                    accessibilityLabel="Nama bahan baru"
                  />
                  {hasDuplicateCustomName ? (
                    <Text style={styles.formError}>Bahan dengan nama ini sudah ada.</Text>
                  ) : null}
                </VStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Satuan stok</Text>
                  <DropdownSelect
                    options={unitOptions}
                    value={customUnit}
                    onChange={setCustomUnit}
                    placeholder="Pilih satuan"
                    accessibilityLabel="Pilih satuan stok"
                  />
                </VStack>
              </>
            ) : null}

            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Jumlah dibeli ({purchaseUnit || "satuan"})</Text>
              <AppInput
                value={formatThousands(quantityInput)}
                onChangeText={(value) => setQuantityInput(value.replace(/\D/g, ""))}
                placeholder="0"
                keyboardType="number-pad"
                style={styles.formInput}
                inputStyle={styles.formInputText}
                accessibilityLabel={`Jumlah dibeli dalam ${purchaseUnit || "satuan"}`}
              />
              {conversion > 1 ? (
                <Text style={styles.formHint}>
                  1 {purchaseUnit} = {formatThousands(conversion)} {selectedItem?.unit ?? customUnit}
                </Text>
              ) : null}
            </VStack>

            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Total pembelian</Text>
              <AppInput
                value={formatThousands(totalCostInput)}
                onChangeText={(value) => setTotalCostInput(value.replace(/\D/g, ""))}
                placeholder="0"
                keyboardType="number-pad"
                style={styles.formInput}
                inputStyle={styles.formInputText}
                leading={<Text style={styles.inputPrefix}>Rp</Text>}
                accessibilityLabel="Total pembelian"
              />
              {quantity > 0 && totalCost > 0 ? (
                <Text style={styles.formHint}>
                  Harga beli: {formatCurrency(totalCost / quantity)} / {purchaseUnit}
                </Text>
              ) : null}
            </VStack>

            <VStack style={styles.summaryBox}>
              <HStack style={styles.summaryLine}>
                <Text style={styles.summaryLineLabel}>Stok setelah masuk</Text>
                <Text style={styles.summaryLineValue}>
                  {formatThousands(nextStock)} {selectedItem?.unit ?? customUnit}
                </Text>
              </HStack>
              <HStack style={styles.summaryLine}>
                <Text style={styles.summaryLineLabel}>Total dibayar</Text>
                <Text style={styles.summaryLineValue}>{formatCurrency(totalCost)}</Text>
              </HStack>
            </VStack>
          </ScrollView>
          {submitError ? (
            <Text style={[styles.formError, { marginHorizontal: 16, marginBottom: 8 }]}>
              {submitError}
            </Text>
          ) : null}
        </ModalBody>

        <ModalFooter style={styles.modalFooter}>
          <AppPressable
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            style={[styles.saveButton, (!canSubmit || isSubmitting) && styles.saveButtonDisabled]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit || isSubmitting }}
          >
            <Text style={styles.saveButtonText}>Simpan Stok</Text>
          </AppPressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
