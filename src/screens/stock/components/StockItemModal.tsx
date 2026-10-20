import { useState } from "react";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
} from "@gluestack-ui/themed";
import { colors } from "../../../theme";
import { DropdownSelect } from "../../../components/dropdown-select";
import {
  Field,
  FormDialog,
  NumberField,
  ui,
} from "../../../components/management";
import {
  AppInput,
  AppModalCloseButton,
  ModalFormActions,
} from "../../../components/ui";
import type { StockItem } from "../../../types/stock";
import {
  formatCurrency,
  formatPreciseCurrency,
  formatQuantity,
  isValidQuantity,
} from "../../../utils/format";
import type { StockAdjustmentDraft, StockItemDraft } from "../api";
import { stockUnitOptions } from "../data/options";
import { useFormSubmit } from "../../../hooks/useFormSubmit";
import { calculateStockUnitsPerPurchaseUnit } from "../utils/unitConversion";
import { stockUnitPriceChanged, toPurchaseUnitPrice } from "../utils/stockForm";

type SettingsDraft = StockItemDraft & StockAdjustmentDraft;

export function StockItemModal({
  item,
  onClose,
  onSubmit,
}: {
  item?: StockItem;
  onClose: () => void;
  onSubmit: (
    draft: SettingsDraft,
    opening?: { quantity: number; totalCost: number },
  ) => Promise<void>;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const description = item?.description ?? "";
  const [unit, setUnit] = useState(item?.unit ?? "");
  const purchaseUnit = item?.purchaseUnit ?? unit;
  const [actualStock, setActualStock] = useState(String(item?.stock ?? ""));
  const [priceDraft, setPriceDraft] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [openingQuantity, setOpeningQuantity] = useState("");
  const [openingCost, setOpeningCost] = useState("");
  const [confirmingSave, setConfirmingSave] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const form = useFormSubmit();
  const conversion =
    calculateStockUnitsPerPurchaseUnit(purchaseUnit, unit) ??
    (item && unit === item.unit && purchaseUnit === item.purchaseUnit
      ? item.stockUnitsPerPurchaseUnit
      : null);
  const price =
    priceDraft ?? (item?.avgPrice ? String(Math.round(item.avgPrice)) : "");
  const purchaseUnitPrice = conversion
    ? toPurchaseUnitPrice(price, conversion)
    : null;
  const quantity = Number(openingQuantity);
  const hasOpening = !item && quantity > 0;
  const validOpening =
    Boolean(item) ||
    (Number.isSafeInteger(quantity) && isValidQuantity(quantity));
  const validOpeningCost = hasOpening
    ? Number.isSafeInteger(Number(openingCost)) && Number(openingCost) > 0
    : openingCost.trim() === "";
  const validName =
    name.trim().length > 0 &&
    new TextEncoder().encode(name.trim()).length <= 120;
  const validStock =
    !item ||
    (actualStock.trim() !== "" && isValidQuantity(Number(actualStock)));
  const validPrice =
    priceDraft === null ||
    (price.trim() !== "" &&
      Number.isSafeInteger(Number(price)) &&
      Number(price) >= 0 &&
      purchaseUnitPrice !== null);
  const stockChanged = Boolean(
    item && validStock && Number(actualStock) !== item.stock,
  );
  const priceChanged = Boolean(
    item && validPrice && stockUnitPriceChanged(priceDraft, item.avgPrice),
  );
  const correcting = stockChanged || priceChanged;
  const changed = !item || name.trim() !== item.name || correcting;

  const validNote =
    (!correcting || note.trim().length > 0) &&
    new TextEncoder().encode(note.trim()).length <= 500;
  const submit = () => {
    if (!conversion) return;
    const validConversion = conversion;
    void form.submit(() =>
      onSubmit(
        {
          name: name.trim(),
          description: description.trim(),
          unit,
          purchaseUnit,
          stockUnitsPerPurchaseUnit: validConversion,
          ...(stockChanged ? { actualStock: Number(actualStock) } : {}),
          ...(priceChanged && purchaseUnitPrice !== null
            ? {
                purchaseUnitPriceRupiah: purchaseUnitPrice,
              }
            : {}),
          ...(correcting ? { note: note.trim() } : {}),
        },
        hasOpening ? { quantity, totalCost: Number(openingCost) } : undefined,
      ),
    );
  };

  const save = () => {
    setAttempted(true);
    if (
      !validName ||
      !unit ||
      !conversion ||
      !validOpening ||
      !validOpeningCost ||
      !validStock ||
      !validPrice ||
      !validNote
    )
      return;
    if (!item) {
      setConfirmingSave(true);
      return;
    }
    submit();
  };
  return (
    <>
      <FormDialog
        title={item ? "Edit Bahan" : "Bahan Baru"}
        onClose={onClose}
        busy={form.busy}
        footer={
          <ModalFormActions
            primaryLabel={item ? "Simpan Perubahan" : "Simpan Bahan"}
            onPrimary={save}
            primaryBusy={form.busy}
            primaryDisabled={!changed}
            onSecondary={onClose}
            secondaryDisabled={form.busy}
          />
        }
      >
        <Field
          label="Nama bahan"
          required
          error={
            attempted && !validName
              ? "Isi nama bahan, maksimal 120 karakter."
              : undefined
          }
        >
          <AppInput
            value={name}
            onChangeText={setName}
            accessibilityLabel="Nama bahan"
            placeholder="Contoh: Susu segar"
            autoCapitalize="words"
          />
        </Field>
        <Field
          label="Satuan stok"
          required
          error={attempted && !unit ? "Pilih satuan stok." : undefined}
        >
          {item ? (
            <AppInput
              value={unit}
              onChangeText={() => undefined}
              editable={false}
              accessibilityLabel="Satuan stok"
            />
          ) : (
            <DropdownSelect
              options={[...stockUnitOptions]}
              value={unit}
              onChange={(value) => {
                setUnit(value);
              }}
              placeholder="Pilih satuan stok"
              accessibilityLabel="Satuan stok"
            />
          )}
        </Field>
        {item ? (
          <>
            <Field
              label="Stok fisik saat ini"
              required
              hint={
                stockChanged
                  ? `Selisih ${Number(actualStock) > item.stock ? "+" : ""}${formatQuantity(Number(actualStock) - item.stock)} ${unit} dari catatan ${formatQuantity(item.stock)} ${unit}.`
                  : "Ubah jika hasil hitung fisik berbeda dari catatan."
              }
              error={
                attempted && !validStock
                  ? "Isi jumlah 0 atau lebih, maksimal 9 angka desimal."
                  : undefined
              }
            >
              <NumberField
                label="Stok fisik saat ini"
                value={actualStock}
                onChange={setActualStock}
                unit={unit}
              />
            </Field>
            <Field
              label={`Harga modal per ${unit || "satuan stok"}`}
              hint={
                item.avgPrice > 0
                  ? `Saat ini ${formatPreciseCurrency(item.avgPrice)} / ${unit}. Ubah hanya untuk mengoreksi harga modal.`
                  : "Harga modal per satuan stok belum tercatat. Isi untuk menetapkannya."
              }
              error={
                attempted && !validPrice
                  ? `Isi harga modal yang menghasilkan rupiah bulat per ${purchaseUnit || "satuan pembelian"}.`
                  : undefined
              }
            >
              <NumberField
                label="Harga modal"
                value={price}
                onChange={setPriceDraft}
                money
              />
            </Field>
            {correcting ? (
              <Field
                label="Alasan perubahan"
                required
                error={
                  attempted && !validNote
                    ? "Isi alasan singkat, maksimal 500 karakter."
                    : undefined
                }
                hint="Koreksi dicatat di riwayat stok; tidak mencatat pembelian atau kas keluar."
              >
                <AppInput
                  value={note}
                  onChangeText={setNote}
                  accessibilityLabel="Alasan perubahan"
                  placeholder="Contoh: Penyesuaian setelah hitung fisik"
                />
              </Field>
            ) : null}
          </>
        ) : (
          <>
            <Field
              label="Stok awal"
              error={
                attempted && !validOpening
                  ? "Isi jumlah pembelian bulat 0 atau lebih."
                  : undefined
              }
            >
              <NumberField
                label="Stok awal"
                value={openingQuantity}
                onChange={setOpeningQuantity}
                unit={unit || undefined}
                whole
              />
            </Field>
            <Field
              label="Total biaya stok awal"
              required={hasOpening}
              error={
                attempted && !validOpeningCost
                  ? hasOpening
                    ? "Isi total biaya lebih dari Rp0."
                    : "Isi stok awal agar total biaya dapat dicatat."
                  : undefined
              }
            >
              <NumberField
                label="Total biaya stok awal"
                value={openingCost}
                onChange={setOpeningCost}
                money
              />
            </Field>
          </>
        )}
        {form.error ? (
          <Text style={ui.error} accessibilityRole="alert">
            {form.error}
          </Text>
        ) : null}
      </FormDialog>
      <Modal
        isOpen={confirmingSave}
        onClose={() => setConfirmingSave(false)}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent style={[ui.dialog, { width: "100%", maxWidth: 440 }]}>
          <ModalHeader style={ui.dialogHeader}>
            <Text style={ui.heading}>Konfirmasi harga</Text>
            <AppModalCloseButton
              onPress={() => setConfirmingSave(false)}
              accessibilityLabel="Tutup konfirmasi harga"
            />
          </ModalHeader>
          <ModalBody style={ui.dialogBody}>
            {hasOpening ? (
              <>
                <Text style={ui.muted}>
                  Pastikan total biaya pembelian awal ini sudah sesuai.
                </Text>
                <Text style={[ui.total, { color: colors.ink }]}>
                  {formatCurrency(Number(openingCost))}
                </Text>
                <Text style={ui.muted}>
                  Nilai ini dicatat sebagai total biaya untuk{" "}
                  {formatQuantity(quantity)} {unit} stok awal.
                </Text>
              </>
            ) : (
              <Text style={ui.muted}>
                Bahan ini akan disimpan tanpa stok awal dan tanpa biaya
                pembelian.
              </Text>
            )}
          </ModalBody>
          <ModalFooter style={ui.dialogFooter}>
            <ModalFormActions
              primaryLabel="Ya, simpan bahan"
              onPrimary={() => {
                setConfirmingSave(false);
                submit();
              }}
              primaryBusy={form.busy}
              onSecondary={() => setConfirmingSave(false)}
              secondaryLabel="Periksa kembali"
              secondaryDisabled={form.busy}
            />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
