import { useState } from "react";
import { Text } from "@gluestack-ui/themed";
import { AppInput, ModalFormActions } from "../../../components/ui";
import {
  Field,
  FormDialog,
  NumberField,
  ui,
} from "../../../components/management";
import type { StockItem } from "../../../types/stock";
import { formatQuantity, isValidQuantity } from "../../../utils/format";
import type { StockPurchaseDraft } from "../api";
import { useFormSubmit } from "../../../hooks/useFormSubmit";
import { getStockUnitsPerPurchaseUnit } from "../utils/stock";
import { toPurchaseQuantity } from "../utils/stockForm";

export function StockPurchaseModal({
  item,
  onClose,
  onSubmit,
}: {
  item: StockItem;
  onClose: () => void;
  onSubmit: (draft: StockPurchaseDraft) => Promise<void>;
}) {
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  const [attempted, setAttempted] = useState(false);
  const form = useFormSubmit();
  const stockUnitsPerPurchaseUnit = getStockUnitsPerPurchaseUnit(item);
  const incoming = Number(quantity);
  const purchaseQuantity = toPurchaseQuantity(
    quantity,
    stockUnitsPerPurchaseUnit,
  );
  const nextStock = Math.round((item.stock + incoming) * 1e9) / 1e9;
  const validQuantity =
    Boolean(quantity) &&
    incoming > 0 &&
    isValidQuantity(incoming) &&
    purchaseQuantity !== null &&
    isValidQuantity(nextStock);
  const validCost = Number.isSafeInteger(Number(cost)) && Number(cost) > 0;
  const save = () => {
    setAttempted(true);
    if (!validQuantity || !validCost || purchaseQuantity === null) return;
    void form.submit(() =>
      onSubmit({
        stockItemId: item.id,
        quantity: purchaseQuantity,
        totalCostRupiah: Number(cost),
      }),
    );
  };
  return (
    <FormDialog
      title="Tambah Stok"
      onClose={onClose}
      busy={form.busy}
      footer={
        <ModalFormActions
          primaryLabel="Simpan Stok"
          onPrimary={save}
          primaryBusy={form.busy}
          onSecondary={onClose}
          secondaryDisabled={form.busy}
        />
      }
    >
      <Field label="Nama bahan">
        <AppInput
          value={item.name}
          onChangeText={() => undefined}
          editable={false}
          accessibilityLabel="Nama bahan"
        />
      </Field>
      <Field label="Stok saat ini">
        <AppInput
          value={formatQuantity(item.stock)}
          onChangeText={() => undefined}
          editable={false}
          accessibilityLabel="Stok saat ini"
          trailing={<Text style={ui.muted}>{item.unit}</Text>}
        />
      </Field>
      <Field
        label="Jumlah masuk"
        required
        error={
          attempted && !validQuantity
            ? "Isi jumlah stok lebih dari 0 dengan ketelitian yang sesuai."
            : undefined
        }
      >
        <NumberField
          label="Jumlah masuk"
          value={quantity}
          onChange={setQuantity}
          unit={item.unit}
        />
      </Field>
      <Field
        label="Total biaya"
        required
        error={
          attempted && !validCost
            ? "Isi total biaya lebih dari Rp0."
            : undefined
        }
      >
        <NumberField
          label="Total biaya pembelian"
          value={cost}
          onChange={setCost}
          money
        />
      </Field>
      {form.error ? (
        <Text accessibilityRole="alert" style={ui.error}>
          {form.error}
        </Text>
      ) : null}
    </FormDialog>
  );
}
