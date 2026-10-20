import type { MenuProductRecord } from "./api";
import type { StockItem } from "../../types/stock";

export type MenuEditorDraft = {
  name: string;
  categoryId: string;
  price: string;
  description: string;
  isAvailable: boolean;
  isRecommended: boolean;
  ingredients: { itemId: string; quantity: string }[];
};

export function priceForTargetMargin(hpp: number, marginPercent: number) {
  if (
    !Number.isFinite(hpp) ||
    hpp <= 0 ||
    !Number.isFinite(marginPercent) ||
    marginPercent < 0 ||
    marginPercent > 90
  )
    return null;

  const rawPrice = (hpp * 100) / (100 - marginPercent);
  const precisionTolerance = Math.min(
    0.000001,
    Math.abs(rawPrice) * Number.EPSILON * 4,
  );
  const price = Math.ceil(rawPrice - precisionTolerance);
  return Number.isSafeInteger(price) ? price : null;
}

export function createEditorDraft(
  product?: MenuProductRecord,
): MenuEditorDraft {
  return {
    name: product?.name ?? "",
    categoryId: product?.categoryId ?? "",
    price: product ? String(product.price) : "",
    description: product?.description ?? "",
    isAvailable: product?.isAvailable ?? true,
    isRecommended: product?.isRecommended ?? false,
    ingredients:
      product?.ingredients?.map((part) => ({
        itemId: part.itemId,
        quantity: String(part.quantity),
      })) ?? [],
  };
}
export function validateEditorDraft(
  draft: MenuEditorDraft,
  items: StockItem[],
  categoryIds: string[],
) {
  const errors: Record<string, string> = {};
  if (
    !draft.name.trim() ||
    new TextEncoder().encode(draft.name.trim()).length > 120
  )
    errors.name = "Isi nama menu yang lebih singkat.";
  if (!categoryIds.includes(draft.categoryId))
    errors.categoryId = "Pilih kategori menu.";
  if (!Number.isSafeInteger(Number(draft.price)) || Number(draft.price) <= 0)
    errors.price = "Harga jual harus lebih dari Rp0.";
  if (new TextEncoder().encode(draft.description.trim()).length > 500)
    errors.description = "Deskripsi terlalu panjang. Ringkas keterangannya.";
  if (!draft.ingredients.length)
    errors.ingredients = "Tambahkan minimal satu bahan.";
  if (draft.ingredients.length > 100)
    errors.ingredients = "Maksimal 100 bahan per menu.";
  const seen = new Set<string>();
  draft.ingredients.forEach((part, index) => {
    const quantity = Number(part.quantity);
    if (!items.some((item) => item.id === part.itemId))
      errors[`ingredient.${index}`] = "Pilih bahan yang terdaftar di stok.";
    else if (seen.has(part.itemId))
      errors[`ingredient.${index}`] = "Bahan ini sudah digunakan.";
    else if (
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      quantity > 1e12 ||
      Math.round(quantity * 1e9) === 0 ||
      Math.abs(quantity - Math.round(quantity * 1e9) / 1e9) >= 1e-12
    )
      errors[`ingredient.${index}`] =
        "Isi takaran lebih dari nol, maksimal 9 angka desimal.";
    seen.add(part.itemId);
  });
  return errors;
}
export function summarizeDraft(draft: MenuEditorDraft, items: StockItem[]) {
  const lines = draft.ingredients.map((part) => {
    const item = items.find((entry) => entry.id === part.itemId);
    const quantity = Number(part.quantity);
    const valid = Boolean(item && quantity > 0 && Number.isFinite(quantity));
    const cost = valid && item!.avgPrice > 0 ? quantity * item!.avgPrice : null;
    return {
      item,
      quantity,
      cost,
      portions: valid
        ? Math.max(0, Math.floor(item!.stock / quantity + 1e-9))
        : 0,
    };
  });
  const hpp =
    lines.length && lines.every((line) => line.cost !== null)
      ? lines.reduce((sum, line) => sum + line.cost!, 0)
      : null;
  const price = Number(draft.price);
  const profit = hpp !== null && price > 0 ? price - hpp : null;
  return {
    lines,
    hpp,
    profit,
    margin: profit !== null ? (profit / price) * 100 : null,
    portions: lines.length
      ? Math.min(...lines.map((line) => line.portions))
      : 0,
  };
}
