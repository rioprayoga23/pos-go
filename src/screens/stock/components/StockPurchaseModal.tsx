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
import { useAppToast } from "../../../components/toast/useAppToast";
import {
  AppIcon,
  AppInput,
  AppModalCloseButton,
  AppPressable,
} from "../../../components/ui";
import { colors } from "../../../theme";
import {
  digitsOnly,
  formatCurrency,
  formatQuantity,
  formatThousands,
  isValidQuantity,
  parseWholeNumber,
} from "../../../utils/format";
import type { StockItem } from "../../../types/stock";
import { customItemOptionId, stockUnitOptions } from "../data/options";
import type { PurchaseDraft } from "../types";
import { getPurchaseUnit, getStockUnitsPerPurchaseUnit } from "../utils/stock";
import {
  calculateStockUnitsPerPurchaseUnit,
  getDefaultPurchaseUnit,
  getPurchaseUnitOptions,
} from "../utils/unitConversion";
import { styles } from "../styles";

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
  const [customPurchaseUnit, setCustomPurchaseUnit] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [totalCostInput, setTotalCostInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useAppToast();

  const isCustomItem = itemId === customItemOptionId;
  const selectedItem = items.find((item) => item.id === itemId);
  const itemOptions: DropdownOption<string>[] = [
    ...items.map((item) => ({ value: item.id, label: item.name })),
    { value: customItemOptionId, label: "Bahan baru" },
  ];
  const stockOptions: DropdownOption<string>[] = stockUnitOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));
  const purchaseOptions: DropdownOption<string>[] = getPurchaseUnitOptions(customUnit).map((option) => ({
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
  const stockUnit = selectedItem?.unit ?? customUnit;
  const purchaseUnit = selectedItem ? getPurchaseUnit(selectedItem) : customPurchaseUnit;
  const conversion = selectedItem
    ? getStockUnitsPerPurchaseUnit(selectedItem)
    : calculateStockUnitsPerPurchaseUnit(customPurchaseUnit, customUnit) ?? 0;
  const incomingStock = quantity * conversion;
  const currentStock = selectedItem?.stock ?? 0;
  const nextStock = currentStock + incomingStock;
  const canSubmit = Boolean(
    quantityInput.trim() &&
    quantity > 0 &&
    isValidQuantity(incomingStock) &&
    isValidQuantity(nextStock) &&
    totalCost > 0 &&
    (isCustomItem
      ? normalizedCustomName && customUnit && customPurchaseUnit && conversion > 0 && !hasDuplicateCustomName
      : selectedItem),
  );

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const draft: PurchaseDraft = {
        mode: "purchase",
        itemId: isCustomItem ? customItemOptionId : selectedItem!.id,
        ...(isCustomItem
          ? {
              newItem: {
                name: normalizedCustomName,
                description: "",
                unit: customUnit,
                purchaseUnit: customPurchaseUnit,
                stockUnitsPerPurchaseUnit: conversion,
              },
            }
          : {}),
        quantity,
        totalCost,
      };
      await onSubmit(draft);
    } catch (error) {
      toast.error("Stok gagal disimpan", error instanceof Error ? error.message : "Coba lagi.");
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
                  <Text style={styles.formLabel}>Satuan stok & resep</Text>
                  <DropdownSelect
                    options={stockOptions}
                    value={customUnit}
                    onChange={(nextUnit) => {
                      setCustomUnit(nextUnit);
                      setCustomPurchaseUnit(getDefaultPurchaseUnit(nextUnit));
                    }}
                    placeholder="Pilih satuan"
                    accessibilityLabel="Pilih satuan stok dan resep"
                  />
                  <Text style={styles.formHint}>
                    Satuan ini dipakai untuk takaran resep dan perhitungan HPP.
                  </Text>
                </VStack>
                {customUnit ? (
                  <VStack style={styles.formGroup}>
                    <Text style={styles.formLabel}>Satuan pembelian</Text>
                    <DropdownSelect
                      options={purchaseOptions}
                      value={customPurchaseUnit}
                      onChange={setCustomPurchaseUnit}
                      placeholder="Pilih satuan pembelian"
                      accessibilityLabel="Pilih satuan pembelian"
                    />
                    {conversion > 0 ? (
                      <VStack style={styles.formGroup}>
                        <Text style={styles.formLabel}>Konversi otomatis</Text>
                        <AppInput
                          value={`1 ${customPurchaseUnit} = ${formatQuantity(conversion)} ${customUnit}`}
                          onChangeText={() => undefined}
                          editable={false}
                          accessibilityLabel="Konversi satuan otomatis"
                        />
                      </VStack>
                    ) : null}
                    <Text style={styles.formHint}>Satuan dan konversi ini disimpan pada data bahan.</Text>
                  </VStack>
                ) : null}
              </>
            ) : null}

            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Jumlah dibeli ({purchaseUnit || "satuan"})</Text>
              <AppInput
                value={formatThousands(quantityInput)}
                onChangeText={(value) => setQuantityInput(digitsOnly(value))}
                placeholder="0"
                keyboardType="number-pad"
                style={styles.formInput}
                inputStyle={styles.formInputText}
                accessibilityLabel={`Jumlah dibeli dalam ${purchaseUnit || "satuan"}`}
              />
              {conversion > 1 ? (
                <Text style={styles.formHint}>
                  1 {purchaseUnit} = {formatQuantity(conversion)} {stockUnit}
                </Text>
              ) : null}
              {quantity > 0 && conversion > 0 ? (
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Stok masuk setelah konversi</Text>
                  <AppInput
                    value={`${formatQuantity(incomingStock)} ${stockUnit}`}
                    onChangeText={() => undefined}
                    editable={false}
                    accessibilityLabel="Jumlah stok yang akan masuk setelah konversi"
                  />
                </VStack>
              ) : null}
            </VStack>

            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>Total pembelian</Text>
              <AppInput
                value={formatThousands(totalCostInput)}
                onChangeText={(value) => setTotalCostInput(digitsOnly(value))}
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
                  {formatQuantity(nextStock)} {stockUnit}
                </Text>
              </HStack>
              <HStack style={styles.summaryLine}>
                <Text style={styles.summaryLineLabel}>Total dibayar</Text>
                <Text style={styles.summaryLineValue}>{formatCurrency(totalCost)}</Text>
              </HStack>
            </VStack>
          </ScrollView>
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
