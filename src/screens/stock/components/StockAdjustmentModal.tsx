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
  AppIcon,
  AppInput,
  AppModalCloseButton,
  AppPressable,
} from "../../../components/ui";
import { colors } from "../../../theme";
import { formatCurrency, formatPreciseCurrency, formatThousands } from "../../../utils/format";
import { customItemOptionId, stockUnitOptions } from "../data/options";
import {
  getPurchaseUnit,
  getPurchaseUnitPrice,
  getStockUnitsPerPurchaseUnit,
} from "../utils/stock";
import type { ModalMode, StockDraft, StockItem } from "../types";
import { styles } from "../styles";

const correctionReasons = ["Stok opname", "Rusak / kedaluwarsa", "Lainnya"];

function parseWholeNumber(value: string) {
  return Math.max(0, Number(value.replace(/\D/g, "")) || 0);
}

export function StockAdjustmentModal({
  mode,
  items,
  initialItemId,
  height,
  onClose,
  onSubmit,
}: {
  mode: ModalMode;
  items: StockItem[];
  initialItemId?: string;
  height: number;
  onClose: () => void;
  onSubmit: (draft: StockDraft) => void;
}) {
  const [itemId, setItemId] = useState(
    initialItemId ?? items[0]?.id ?? (mode === "purchase" ? customItemOptionId : ""),
  );
  const [itemMenuOpen, setItemMenuOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [unitMenuOpen, setUnitMenuOpen] = useState(false);
  const [quantityInput, setQuantityInput] = useState("");
  const [totalCostInput, setTotalCostInput] = useState("");
  const [fundingSource, setFundingSource] = useState<"cash" | "transfer">("cash");
  const [actualStockInput, setActualStockInput] = useState("");
  const [reason, setReason] = useState(correctionReasons[0]);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [correctionNote, setCorrectionNote] = useState("");
  const [purchaseUnitPriceInput, setPurchaseUnitPriceInput] = useState(() => {
    const item = items.find((entry) => entry.id === initialItemId) ?? items[0];
    return mode === "correction" && item
      ? String(Math.round(getPurchaseUnitPrice(item)))
      : "";
  });

  const isCustomItem = mode === "purchase" && itemId === customItemOptionId;
  const selectedItem = isCustomItem
    ? undefined
    : items.find((item) => item.id === itemId);
  const normalizedCustomName = customItemName.trim();
  const hasDuplicateCustomName =
    isCustomItem &&
    normalizedCustomName.length > 0 &&
    items.some((item) => item.name.trim().toLowerCase() === normalizedCustomName.toLowerCase());
  const quantity = parseWholeNumber(quantityInput);
  const totalCost = parseWholeNumber(totalCostInput);
  const actualStock = parseWholeNumber(actualStockInput);
  const purchaseUnitPrice = parseWholeNumber(purchaseUnitPriceInput);
  const purchaseUnit = selectedItem ? getPurchaseUnit(selectedItem) : customUnit;
  const conversion = selectedItem ? getStockUnitsPerPurchaseUnit(selectedItem) : 1;
  const incomingStock = quantity * conversion;
  const currentStock = selectedItem?.stock ?? 0;
  const nextStock = currentStock + incomingStock;
  const correctionDelta = selectedItem ? actualStock - selectedItem.stock : 0;
  const pricePreview = selectedItem
    ? purchaseUnitPrice / getStockUnitsPerPurchaseUnit(selectedItem)
    : 0;
  const hasPurchaseQuantity = quantityInput.trim().length > 0 && quantity > 0;
  const hasActualStock = actualStockInput.trim().length > 0;
  const hasCorrectionChange = hasActualStock && correctionDelta !== 0;
  const hasPriceChange = Boolean(
    selectedItem &&
    purchaseUnitPriceInput.trim().length > 0 &&
    purchaseUnitPrice !== Math.round(getPurchaseUnitPrice(selectedItem)),
  );
  const canSubmit = mode === "purchase"
    ? Boolean(
        hasPurchaseQuantity &&
        totalCost > 0 &&
        (isCustomItem
          ? normalizedCustomName && customUnit && !hasDuplicateCustomName
          : selectedItem),
      )
    : Boolean(
        selectedItem &&
        (hasCorrectionChange || hasPriceChange) &&
        (!hasCorrectionChange || reason !== "Lainnya" || correctionNote.trim()),
      );

  const changeSelectedItem = (nextId: string) => {
    setItemId(nextId);
    setItemMenuOpen(false);
    setUnitMenuOpen(false);
    if (mode === "purchase") {
      setQuantityInput("");
      setTotalCostInput("");
    }
    if (mode === "correction") {
      const nextItem = items.find((item) => item.id === nextId);
      setPurchaseUnitPriceInput(nextItem ? String(Math.round(getPurchaseUnitPrice(nextItem))) : "");
      setActualStockInput("");
      setCorrectionNote("");
      setReason(correctionReasons[0]);
      setReasonOpen(false);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (mode === "purchase") {
      if (isCustomItem) {
        onSubmit({
          mode: "purchase",
          itemId: customItemOptionId,
          newItem: { name: normalizedCustomName, unit: customUnit },
          quantity,
          totalCost,
          fundingSource,
        });
        return;
      }
      if (!selectedItem) return;
      onSubmit({
        mode: "purchase",
        itemId: selectedItem.id,
        quantity,
        totalCost,
        fundingSource,
      });
      return;
    }

    if (!selectedItem) return;
    if (mode === "correction") {
      onSubmit({
        mode: "correction",
        itemId: selectedItem.id,
        actualStock: hasActualStock ? actualStock : selectedItem.stock,
        purchaseUnitPrice,
        reason,
        note: correctionNote.trim(),
      });
      return;
    }
  };

  const title = mode === "purchase"
    ? "Tambah Stok"
    : "Sesuaikan Stok";
  const icon = mode === "purchase" ? "plus" : "tune-variant";
  const saveLabel = mode === "purchase" ? "Simpan Stok" : "Simpan Perubahan";

  return (
    <Modal isOpen onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={[styles.modal, { maxHeight: Math.max(500, height - 28) }]}>
        <ModalHeader style={styles.modalHeader}>
          <HStack style={styles.modalIcon}>
            <AppIcon name={icon} size={18} color={colors.primary} />
          </HStack>
          <VStack style={styles.modalHeading}>
            <Text style={styles.modalTitle}>{title}</Text>
            {mode === "purchase" ? (
              <Text style={styles.modalSubtitle}>Catat jumlah masuk dan total pembayaran</Text>
            ) : null}
          </VStack>
          <AppModalCloseButton onPress={onClose} accessibilityLabel="Tutup form stok" />
        </ModalHeader>

        <ModalBody style={styles.modalBody}>
          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalForm}
          >
            {mode === "purchase" || mode === "correction" ? (
              <VStack style={styles.formGroup}>
                <Text style={styles.formLabel}>Bahan</Text>
                <AppPressable
                  onPress={() => {
                    setUnitMenuOpen(false);
                    setItemMenuOpen((current) => !current);
                  }}
                  style={styles.modalSelect}
                  accessibilityRole="button"
                  accessibilityLabel="Pilih bahan"
                  accessibilityState={{ expanded: itemMenuOpen }}
                >
                  <Text style={styles.modalSelectTitle}>
                    {isCustomItem ? "Bahan baru" : selectedItem?.name ?? "Pilih bahan"}
                  </Text>
                  <AppIcon name="chevron-down" size={17} color={colors.inkMuted} />
                </AppPressable>
                {itemMenuOpen ? (
                  <ScrollView
                    style={styles.modalOptionMenu}
                    contentContainerStyle={styles.modalOptionMenuContent}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                  >
                    {items.map((item) => (
                      <AppPressable
                        key={item.id}
                        onPress={() => changeSelectedItem(item.id)}
                        style={[styles.modalOption, item.id === selectedItem?.id && styles.modalOptionActive]}
                        accessibilityRole="button"
                      >
                        <Text style={[styles.modalOptionTitle, item.id === selectedItem?.id && styles.modalOptionTitleActive]}>
                          {item.name}
                        </Text>
                      </AppPressable>
                    ))}
                    {mode === "purchase" ? (
                      <AppPressable
                        onPress={() => changeSelectedItem(customItemOptionId)}
                        style={[styles.modalOption, isCustomItem && styles.modalOptionActive]}
                        accessibilityRole="button"
                      >
                        <Text style={[styles.modalOptionTitle, isCustomItem && styles.modalOptionTitleActive]}>
                          + Bahan baru
                        </Text>
                      </AppPressable>
                    ) : null}
                  </ScrollView>
                ) : null}
              </VStack>
            ) : null}

            {mode === "purchase" ? (
              <>
                {isCustomItem ? (
                  <>
                    <VStack style={styles.formGroup}>
                      <Text style={styles.formLabel}>Nama bahan</Text>
                      <AppInput
                        value={customItemName}
                        onChangeText={setCustomItemName}
                        placeholder="Contoh: Susu UHT"
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
                      <AppPressable
                        onPress={() => {
                          setItemMenuOpen(false);
                          setUnitMenuOpen((current) => !current);
                        }}
                        style={styles.modalSelect}
                        accessibilityRole="button"
                        accessibilityLabel="Pilih satuan stok"
                        accessibilityState={{ expanded: unitMenuOpen }}
                      >
                        <Text style={styles.modalSelectTitle}>
                          {stockUnitOptions.find((option) => option.value === customUnit)?.label ?? "Pilih satuan"}
                        </Text>
                        <AppIcon name="chevron-down" size={17} color={colors.inkMuted} />
                      </AppPressable>
                      {unitMenuOpen ? (
                        <ScrollView
                          style={styles.modalOptionMenu}
                          contentContainerStyle={styles.modalOptionMenuContent}
                          nestedScrollEnabled
                          showsVerticalScrollIndicator
                        >
                          {stockUnitOptions.map((option) => (
                            <AppPressable
                              key={option.value}
                              onPress={() => {
                                setCustomUnit(option.value);
                                setUnitMenuOpen(false);
                              }}
                              style={[styles.modalOption, customUnit === option.value && styles.modalOptionActive]}
                              accessibilityRole="button"
                            >
                              <Text style={[styles.modalOptionTitle, customUnit === option.value && styles.modalOptionTitleActive]}>
                                {option.label}
                              </Text>
                            </AppPressable>
                          ))}
                        </ScrollView>
                      ) : null}
                    </VStack>
                  </>
                ) : null}

                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Jumlah dibeli ({purchaseUnit || "satuan"})
                  </Text>
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
                  {hasPurchaseQuantity && totalCost > 0 ? (
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
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Bayar dari</Text>
                  <HStack style={styles.fundingRow}>
                    {(["cash", "transfer"] as const).map((source) => {
                      const active = fundingSource === source;
                      return (
                        <AppPressable
                          key={source}
                          onPress={() => setFundingSource(source)}
                          style={[styles.fundingButton, active && styles.fundingButtonActive]}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                        >
                          <Text style={[styles.fundingText, active && styles.fundingTextActive]}>
                            {source === "cash" ? "Kas laci" : "Transfer"}
                          </Text>
                        </AppPressable>
                      );
                    })}
                  </HStack>
                </VStack>
              </>
            ) : null}

            {mode === "correction" && selectedItem ? (
              <>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Stok fisik saat ini</Text>
                  <AppInput
                    value={formatThousands(actualStockInput)}
                    onChangeText={(value) => setActualStockInput(value.replace(/\D/g, ""))}
                    placeholder={String(selectedItem.stock)}
                    keyboardType="number-pad"
                    style={styles.formInput}
                    inputStyle={styles.formInputText}
                    trailing={<Text style={styles.inputPrefix}>{selectedItem.unit}</Text>}
                    accessibilityLabel={`Stok fisik saat ini dalam ${selectedItem.unit}`}
                  />
                </VStack>
                {hasActualStock ? (
                  <VStack style={styles.summaryBox}>
                    <HStack style={styles.summaryLine}>
                      <Text style={styles.summaryLineLabel}>Stok sistem</Text>
                      <Text style={styles.summaryLineValue}>
                        {formatThousands(selectedItem.stock)} {selectedItem.unit}
                      </Text>
                    </HStack>
                    <HStack style={styles.summaryLine}>
                      <Text style={styles.summaryLineLabel}>Selisih</Text>
                      <Text style={[styles.summaryLineValue, correctionDelta < 0 && styles.textWarning]}>
                        {correctionDelta > 0 ? "+" : correctionDelta < 0 ? "−" : ""}{formatThousands(Math.abs(correctionDelta))} {selectedItem.unit}
                      </Text>
                    </HStack>
                  </VStack>
                ) : null}
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Harga modal per {purchaseUnit}</Text>
                  <AppInput
                    value={formatThousands(purchaseUnitPriceInput)}
                    onChangeText={(value) => setPurchaseUnitPriceInput(value.replace(/\D/g, ""))}
                    placeholder="0"
                    keyboardType="number-pad"
                    style={styles.formInput}
                    inputStyle={styles.formInputText}
                    leading={<Text style={styles.inputPrefix}>Rp</Text>}
                    accessibilityLabel={`Harga modal per ${purchaseUnit}`}
                  />
                  <Text style={styles.formHint}>
                    Setara {formatPreciseCurrency(pricePreview)} / {selectedItem.unit}
                  </Text>
                </VStack>
                {hasCorrectionChange ? (
                  <VStack style={styles.formGroup}>
                    <Text style={styles.formLabel}>Alasan koreksi</Text>
                    <AppPressable
                      onPress={() => setReasonOpen((current) => !current)}
                      style={styles.modalSelect}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: reasonOpen }}
                    >
                      <Text style={styles.modalSelectTitle}>{reason}</Text>
                      <AppIcon name="chevron-down" size={17} color={colors.inkMuted} />
                    </AppPressable>
                    {reasonOpen ? (
                      <VStack style={styles.modalOptionMenu}>
                        {correctionReasons.map((option) => (
                          <AppPressable
                            key={option}
                            onPress={() => {
                              setReason(option);
                              setReasonOpen(false);
                            }}
                            style={[styles.modalOption, option === reason && styles.modalOptionActive]}
                            accessibilityRole="button"
                          >
                            <Text style={[styles.modalOptionTitle, option === reason && styles.modalOptionTitleActive]}>
                              {option}
                            </Text>
                          </AppPressable>
                        ))}
                      </VStack>
                    ) : null}
                  </VStack>
                ) : null}
                {hasCorrectionChange && reason === "Lainnya" ? (
                  <VStack style={styles.formGroup}>
                    <Text style={styles.formLabel}>Catatan</Text>
                    <AppInput
                      value={correctionNote}
                      onChangeText={setCorrectionNote}
                      placeholder="Tulis alasan koreksi"
                      style={styles.formInput}
                      inputStyle={styles.formInputText}
                      accessibilityLabel="Catatan koreksi"
                    />
                  </VStack>
                ) : null}
              </>
            ) : null}
          </ScrollView>
        </ModalBody>

        <ModalFooter style={styles.modalFooter}>
          <AppPressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
          >
            <Text style={styles.saveButtonText}>{saveLabel}</Text>
          </AppPressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
