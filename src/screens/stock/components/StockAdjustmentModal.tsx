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
import { ScrollView, View } from "react-native";
import {
  AppIcon,
  AppInput,
  AppModalCloseButton,
  AppPressable,
} from "../../../components/ui";
import { colors } from "../../../theme";
import { formatCurrency } from "../../../utils/format";
import { customItemOptionId, stockUnitOptions } from "../data/options";
import { isLowStock } from "../utils/stock";
import type { CorrectionDirection, ModalMode, StockDraft, StockItem } from "../types";
import { styles } from "../styles";

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
  const [itemId, setItemId] = useState(initialItemId ?? items[0]?.id ?? "");
  const [itemMenuOpen, setItemMenuOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [unitMenuOpen, setUnitMenuOpen] = useState(false);
  const [quantityInput, setQuantityInput] = useState(
    mode === "purchase" ? "20" : "2",
  );
  const [priceMode, setPriceMode] = useState<"unit" | "total">("unit");
  const [priceInput, setPriceInput] = useState(
    mode === "purchase" ? "6500" : "",
  );
  const [fundingSource, setFundingSource] = useState<"cash" | "transfer">(
    "cash",
  );
  const [purchaseTime, setPurchaseTime] = useState("24 Okt 2024, 10:20 WIB");
  const [purchaseNote, setPurchaseNote] = useState(
    "Supplier Utama CV Berkah Makmur",
  );
  const [correctionType, setCorrectionType] =
    useState<CorrectionDirection>("subtract");
  const [reason, setReason] = useState("Kerusakan Fisik / Kemasan Bocor");
  const [reasonOpen, setReasonOpen] = useState(false);
  const [correctionTime, setCorrectionTime] = useState(
    "Hari ini, 10:20 WIB (Shift Sarah Putri)",
  );
  const [correctionNote, setCorrectionNote] = useState(
    "Dua sachet kemasan robek dan serbuk menggumpal saat cek pagi.",
  );

  const isCustomItem = mode === "purchase" && itemId === customItemOptionId;
  const selectedItem = isCustomItem
    ? undefined
    : items.find((item) => item.id === itemId) ?? items[0];
  const normalizedCustomName = customItemName.trim();
  const hasDuplicateCustomName =
    isCustomItem &&
    normalizedCustomName.length > 0 &&
    items.some(
      (item) =>
        item.name.trim().toLowerCase() === normalizedCustomName.toLowerCase(),
    );
  const selectedItemIsLow = selectedItem ? isLowStock(selectedItem) : false;
  const quantity = Math.max(0, Number(quantityInput.replace(/\D/g, "")) || 0);
  const canSubmit = Boolean(
    quantity &&
      (isCustomItem
        ? normalizedCustomName && customUnit && !hasDuplicateCustomName
        : selectedItem),
  );
  const priceValue = Math.max(0, Number(priceInput.replace(/\D/g, "")) || 0);
  const totalCost = priceMode === "unit" ? quantity * priceValue : priceValue;
  const newStock = selectedItem
    ? selectedItem.stock +
      (correctionType === "subtract" ? -quantity : quantity)
    : quantity;
  const reasonOptions = [
    "Kerusakan Fisik / Kemasan Bocor",
    "Kadaluarsa / Expired Date",
    "Selisih Hitung Stok Opname Kasir",
    "Uji Rasa / Quality Check Bar",
    "Koreksi Salah Input Transaksi",
    "Lainnya (Tulis di catatan)",
  ];

  const handleSubmit = () => {
    if (!quantity) return;
    if (mode === "purchase") {
      if (isCustomItem) {
        if (
          !normalizedCustomName ||
          !customUnit ||
          hasDuplicateCustomName
        ) {
          return;
        }
        onSubmit({
          mode: "purchase",
          itemId: customItemOptionId,
          newItem: { name: normalizedCustomName, unit: customUnit },
          quantity,
          priceMode,
          priceValue,
          fundingSource,
          time: purchaseTime,
          note: purchaseNote,
        });
        return;
      }
      if (!selectedItem) return;
      onSubmit({
        mode: "purchase",
        itemId: selectedItem.id,
        quantity,
        priceMode,
        priceValue,
        fundingSource,
        time: purchaseTime,
        note: purchaseNote,
      });
      return;
    }
    if (!selectedItem) return;
    onSubmit({
      mode: "correction",
      itemId: selectedItem.id,
      direction: correctionType,
      quantity,
      reason,
      time: correctionTime,
      note: correctionNote,
    });
  };

  return (
    <Modal isOpen onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent
        style={[styles.modal, { maxHeight: Math.max(500, height - 28) }]}
      >
        <ModalHeader style={styles.modalHeader}>
          <HStack style={styles.modalIcon}>
            <AppIcon
              name={mode === "purchase" ? "plus" : "tune-variant"}
              size={18}
              color={colors.primary}
            />
          </HStack>
          <VStack style={styles.modalHeading}>
            <Text style={styles.modalTitle}>
              {mode === "purchase" ? "Catat Pembelian Stok" : "Koreksi Stok"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {mode === "purchase"
                ? "Input barang masuk dan pemotongan saldo kas kasir"
                : "Sesuaikan stok sistem dengan kondisi fisik di outlet"}
            </Text>
          </VStack>
          <AppModalCloseButton
            onPress={onClose}
            accessibilityLabel="Tutup form stok"
          />
        </ModalHeader>
        <ModalBody style={styles.modalBody}>
          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalForm}
          >
            <VStack style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {mode === "purchase"
                  ? "Pilih Bahan / Item yang Dibeli"
                  : "Pilih Bahan / Item"}
              </Text>
              <AppPressable
                onPress={() => {
                  setUnitMenuOpen(false);
                  setItemMenuOpen((current) => !current);
                }}
                style={styles.modalSelect}
                accessibilityRole="button"
                accessibilityLabel="Pilih bahan atau item yang dibeli"
                accessibilityState={{ expanded: itemMenuOpen }}
              >
                <VStack style={styles.modalSelectCopy}>
                  <Text style={styles.modalSelectTitle}>
                    {isCustomItem ? "Lainnya" : (selectedItem?.name ?? "Pilih item")}
                  </Text>
                  <Text style={styles.modalSelectMeta}>
                    {isCustomItem
                      ? "Tambah bahan atau produk baru"
                      : selectedItem?.category +
                        " · Stok " +
                        selectedItem?.stock}
                  </Text>
                </VStack>
                <AppIcon
                  name="chevron-down"
                  size={17}
                  color={colors.inkMuted}
                />
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
                      onPress={() => {
                        setItemId(item.id);
                        setItemMenuOpen(false);
                        setUnitMenuOpen(false);
                      }}
                      style={[
                        styles.modalOption,
                        item.id === selectedItem?.id &&
                          styles.modalOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalOptionTitle,
                          item.id === selectedItem?.id &&
                            styles.modalOptionTitleActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.modalOptionMeta}>
                        {item.stock} · {item.category}
                      </Text>
                    </AppPressable>
                  ))}
                  {mode === "purchase" ? (
                    <AppPressable
                      onPress={() => {
                        setItemId(customItemOptionId);
                        setItemMenuOpen(false);
                        setUnitMenuOpen(false);
                      }}
                      style={[
                        styles.modalOption,
                        isCustomItem && styles.modalOptionActive,
                      ]}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.modalOptionTitle,
                          isCustomItem && styles.modalOptionTitleActive,
                        ]}
                      >
                        Lainnya
                      </Text>
                      <Text style={styles.modalOptionMeta}>
                        Tambah bahan atau produk baru
                      </Text>
                    </AppPressable>
                  ) : null}
                </ScrollView>
              ) : null}
            </VStack>

            {mode === "purchase" ? (
              <>
                {isCustomItem ? (
                  <>
                    <VStack style={styles.formGroup}>
                      <Text style={styles.formLabel}>Nama Bahan / Produk</Text>
                      <AppInput
                        value={customItemName}
                        onChangeText={setCustomItemName}
                        placeholder="Contoh: Susu UHT 1L"
                        autoCapitalize="words"
                        style={styles.formInput}
                        inputStyle={styles.formInputText}
                        accessibilityLabel="Nama bahan atau produk baru"
                      />
                      {hasDuplicateCustomName ? (
                        <Text style={styles.formError}>
                          Nama bahan sudah terdaftar. Pilih dari daftar item.
                        </Text>
                      ) : null}
                    </VStack>
                    <VStack style={styles.formGroup}>
                      <Text style={styles.formLabel}>Satuan</Text>
                      <AppPressable
                        onPress={() => {
                          setItemMenuOpen(false);
                          setUnitMenuOpen((current) => !current);
                        }}
                        style={styles.modalSelect}
                        accessibilityRole="button"
                        accessibilityLabel="Pilih satuan stok baru"
                        accessibilityState={{ expanded: unitMenuOpen }}
                      >
                        <Text style={styles.modalSelectTitle}>
                          {stockUnitOptions.find(
                            (option) => option.value === customUnit,
                          )?.label ?? "Pilih satuan"}
                        </Text>
                        <AppIcon
                          name="chevron-down"
                          size={17}
                          color={colors.inkMuted}
                        />
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
                              style={[
                                styles.modalOption,
                                customUnit === option.value &&
                                  styles.modalOptionActive,
                              ]}
                              accessibilityRole="button"
                            >
                              <Text
                                style={[
                                  styles.modalOptionTitle,
                                  customUnit === option.value &&
                                    styles.modalOptionTitleActive,
                                ]}
                              >
                                {option.label}
                              </Text>
                            </AppPressable>
                          ))}
                        </ScrollView>
                      ) : null}
                    </VStack>
                  </>
                ) : null}
                <HStack style={styles.stockSnapshot}>
                  <AppIcon
                    name="archive-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.stockSnapshotText}>
                    {isCustomItem ? "Stok awal " : "Stok saat ini "}
                    <Text style={styles.stockSnapshotStrong}>
                      {selectedItem?.stock ?? 0}
                    </Text>
                  </Text>
                </HStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Jumlah Beli / Masuk</Text>
                  <AppInput
                    value={quantityInput}
                    onChangeText={(value) =>
                      setQuantityInput(value.replace(/\D/g, ""))
                    }
                    keyboardType="number-pad"
                    style={styles.formInput}
                    inputStyle={styles.formInputText}
                    accessibilityLabel="Jumlah beli atau masuk"
                  />
                </VStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Harga Pembelian</Text>
                  <HStack style={styles.segmentedControl}>
                    <AppPressable
                      onPress={() => setPriceMode("unit")}
                      style={[
                        styles.segment,
                        priceMode === "unit" && styles.segmentActive,
                      ]}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          priceMode === "unit" && styles.segmentTextActive,
                        ]}
                      >
                        Harga Satuan
                      </Text>
                    </AppPressable>
                    <AppPressable
                      onPress={() => setPriceMode("total")}
                      style={[
                        styles.segment,
                        priceMode === "total" && styles.segmentActive,
                      ]}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          priceMode === "total" && styles.segmentTextActive,
                        ]}
                      >
                        Total Pembelian
                      </Text>
                    </AppPressable>
                  </HStack>
                  <AppInput
                    value={priceInput}
                    onChangeText={(value) =>
                      setPriceInput(value.replace(/\D/g, ""))
                    }
                    keyboardType="number-pad"
                    style={styles.formInput}
                    inputStyle={styles.formInputText}
                    leading={<Text style={styles.inputPrefix}>Rp</Text>}
                    accessibilityLabel={
                      priceMode === "unit"
                        ? "Harga beli per satuan"
                        : "Total pembelian"
                    }
                  />
                  <Text style={styles.formHint}>
                    {priceMode === "unit"
                      ? "Harga beli per satuan: " +
                        formatCurrency(priceValue)
                      : "Harga satuan dihitung: " +
                        formatCurrency(quantity ? Math.round(priceValue / quantity) : 0)}
                  </Text>
                </VStack>
                <VStack style={styles.summaryBox}>
                  <HStack style={styles.summaryLine}>
                    <Text style={styles.summaryLineLabel}>
                      Total Pengeluaran
                    </Text>
                    <Text style={styles.summaryLineValue}>
                      {formatCurrency(totalCost)}
                    </Text>
                  </HStack>
                  <HStack style={styles.summaryLine}>
                    <Text style={styles.summaryLineLabel}>
                      Stok Baru Setelah Belanja
                    </Text>
                    <Text style={styles.summaryLineValue}>
                      {(selectedItem?.stock ?? 0) + quantity}
                    </Text>
                  </HStack>
                </VStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Sumber Dana</Text>
                  <HStack style={styles.fundingRow}>
                    <AppPressable
                      onPress={() => setFundingSource("cash")}
                      style={[
                        styles.fundingButton,
                        fundingSource === "cash" && styles.fundingButtonActive,
                      ]}
                      accessibilityRole="button"
                    >
                      <AppIcon
                        name="cash"
                        size={15}
                        color={
                          fundingSource === "cash"
                            ? colors.primary
                            : colors.inkMuted
                        }
                      />
                      <Text
                        style={[
                          styles.fundingText,
                          fundingSource === "cash" && styles.fundingTextActive,
                        ]}
                      >
                        Kas Laci
                      </Text>
                    </AppPressable>
                    <AppPressable
                      onPress={() => setFundingSource("transfer")}
                      style={[
                        styles.fundingButton,
                        fundingSource === "transfer" &&
                          styles.fundingButtonActive,
                      ]}
                      accessibilityRole="button"
                    >
                      <AppIcon
                        name="bank-transfer"
                        size={15}
                        color={
                          fundingSource === "transfer"
                            ? colors.primary
                            : colors.inkMuted
                        }
                      />
                      <Text
                        style={[
                          styles.fundingText,
                          fundingSource === "transfer" &&
                            styles.fundingTextActive,
                        ]}
                      >
                        Dana Lainnya
                      </Text>
                    </AppPressable>
                  </HStack>
                </VStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tanggal &amp; Waktu</Text>
                  <AppInput
                    value={purchaseTime}
                    onChangeText={setPurchaseTime}
                    style={styles.formInput}
                    inputStyle={styles.formInputText}
                    accessibilityLabel="Tanggal dan waktu pembelian"
                  />
                </VStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Catatan / Supplier</Text>
                  <AppInput
                    value={purchaseNote}
                    onChangeText={setPurchaseNote}
                    style={styles.formInput}
                    inputStyle={styles.formInputText}
                    accessibilityLabel="Catatan atau supplier"
                  />
                </VStack>
              </>
            ) : (
              <>
                <HStack style={styles.selectedItemBanner}>
                  <View style={styles.largeAvatar}>
                    <Text style={styles.largeAvatarText}>
                      {selectedItem?.initials}
                    </Text>
                  </View>
                  <VStack style={styles.selectedItemCopy}>
                    <Text style={styles.selectedItemName}>
                      {selectedItem?.name}
                    </Text>
                    <Text style={styles.selectedItemMeta}>
                      {selectedItem?.category} · Stok {selectedItem?.stock}
                    </Text>
                  </VStack>
                  <Text
                    style={[
                      styles.selectedItemStatus,
                      selectedItemIsLow
                        ? styles.textWarning
                        : styles.textSuccess,
                    ]}
                  >
                    {selectedItemIsLow ? "Menipis" : "Aman"}
                  </Text>
                </HStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Jenis Koreksi</Text>
                  <HStack style={styles.directionRow}>
                    <AppPressable
                      onPress={() => setCorrectionType("add")}
                      style={[
                        styles.directionButton,
                        correctionType === "add" &&
                          styles.directionButtonActive,
                      ]}
                      accessibilityRole="button"
                    >
                      <AppIcon
                        name="plus"
                        size={15}
                        color={
                          correctionType === "add"
                            ? colors.primary
                            : colors.inkMuted
                        }
                      />
                      <Text
                        style={[
                          styles.directionText,
                          correctionType === "add" &&
                            styles.directionTextActive,
                        ]}
                      >
                        Tambah Stok
                      </Text>
                    </AppPressable>
                    <AppPressable
                      onPress={() => setCorrectionType("subtract")}
                      style={[
                        styles.directionButton,
                        correctionType === "subtract" &&
                          styles.directionButtonDangerActive,
                      ]}
                      accessibilityRole="button"
                    >
                      <AppIcon
                        name="minus"
                        size={15}
                        color={
                          correctionType === "subtract"
                            ? colors.danger
                            : colors.inkMuted
                        }
                      />
                      <Text
                        style={[
                          styles.directionText,
                          correctionType === "subtract" &&
                            styles.directionTextDangerActive,
                        ]}
                      >
                        Kurangi Stok
                      </Text>
                    </AppPressable>
                  </HStack>
                </VStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Alasan Koreksi</Text>
                  <AppPressable
                    onPress={() => setReasonOpen((current) => !current)}
                    style={styles.modalSelect}
                    accessibilityRole="button"
                  >
                    <Text style={styles.modalSelectTitle}>{reason}</Text>
                    <AppIcon
                      name="chevron-down"
                      size={17}
                      color={colors.inkMuted}
                    />
                  </AppPressable>
                  {reasonOpen ? (
                    <ScrollView
                      style={styles.modalOptionMenu}
                      contentContainerStyle={styles.modalOptionMenuContent}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                    >
                      {reasonOptions.map((option) => (
                        <AppPressable
                          key={option}
                          onPress={() => {
                            setReason(option);
                            setReasonOpen(false);
                          }}
                          style={[
                            styles.modalOption,
                            option === reason && styles.modalOptionActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.modalOptionTitle,
                              option === reason &&
                                styles.modalOptionTitleActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </AppPressable>
                      ))}
                    </ScrollView>
                  ) : null}
                </VStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Jumlah{" "}
                    {correctionType === "add" ? "Tambahan" : "Pengurangan"}
                  </Text>
                  <HStack style={styles.quantityStepperRow}>
                    <AppPressable
                      onPress={() =>
                        setQuantityInput(String(Math.max(0, quantity - 1)))
                      }
                      style={styles.stepperButton}
                      accessibilityRole="button"
                      accessibilityLabel="Kurangi jumlah"
                    >
                      <AppIcon name="minus" size={15} color={colors.inkMuted} />
                    </AppPressable>
                    <AppInput
                      value={quantityInput}
                      onChangeText={(value) =>
                        setQuantityInput(value.replace(/\D/g, ""))
                      }
                      keyboardType="number-pad"
                      style={styles.stepperInput}
                      inputStyle={styles.centerInput}
                      accessibilityLabel="Jumlah koreksi"
                    />
                    <AppPressable
                      onPress={() => setQuantityInput(String(quantity + 1))}
                      style={styles.stepperButton}
                      accessibilityRole="button"
                      accessibilityLabel="Tambah jumlah"
                    >
                      <AppIcon name="plus" size={15} color={colors.inkMuted} />
                    </AppPressable>
                  </HStack>
                </VStack>
                <VStack style={styles.summaryBox}>
                  <HStack style={styles.equationRow}>
                    <Text style={styles.equationValue}>
                      {selectedItem?.stock}
                    </Text>
                    <Text style={styles.equationOperator}>
                      {correctionType === "add" ? "+" : "−"}
                    </Text>
                    <Text style={styles.equationValue}>{quantity}</Text>
                    <Text style={styles.equationOperator}>=</Text>
                    <Text
                      style={[
                        styles.equationValue,
                        correctionType === "subtract" && styles.textWarning,
                      ]}
                    >
                      {Math.max(0, newStock)}
                    </Text>
                  </HStack>
                  <Text style={[styles.formHint, styles.equationHint]}>
                    Preview stok akhir setelah koreksi disimpan.
                  </Text>
                </VStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tanggal &amp; Waktu</Text>
                  <AppInput
                    value={correctionTime}
                    onChangeText={setCorrectionTime}
                    style={styles.formInput}
                    inputStyle={styles.formInputText}
                    accessibilityLabel="Tanggal dan waktu koreksi"
                  />
                </VStack>
                <VStack style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Catatan Tambahan (Opsional)
                  </Text>
                  <AppInput
                    value={correctionNote}
                    onChangeText={setCorrectionNote}
                    style={styles.formInput}
                    inputStyle={styles.formInputText}
                    accessibilityLabel="Catatan koreksi"
                  />
                </VStack>
              </>
            )}
          </ScrollView>
        </ModalBody>
        <ModalFooter style={styles.modalFooter}>
          <AppPressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[
              styles.saveButton,
              !canSubmit && styles.saveButtonDisabled,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.saveButtonText}>Simpan</Text>
          </AppPressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
