export type StockUnit = "kg" | "g" | "liter" | "ml" | "galon" | "pcs";

type UnitDefinition = {
  label: string;
  dimension: "mass" | "volume" | "count";
  baseQuantity: number;
};

const units: Record<StockUnit, UnitDefinition> = {
  kg: { label: "Kilogram (kg)", dimension: "mass", baseQuantity: 1_000 },
  g: { label: "Gram (g)", dimension: "mass", baseQuantity: 1 },
  liter: { label: "Liter", dimension: "volume", baseQuantity: 1_000 },
  ml: { label: "Mililiter (ml)", dimension: "volume", baseQuantity: 1 },
  galon: { label: "Galon (19 liter)", dimension: "volume", baseQuantity: 19_000 },
  pcs: { label: "Pcs", dimension: "count", baseQuantity: 1 },
};

const unitOrder: StockUnit[] = ["kg", "g", "galon", "liter", "ml", "pcs"];

function isSupportedFactor(value: number): boolean {
  return Number.isFinite(value) && value > 0 &&
    Math.round(value * 1_000_000_000) > 0 &&
    Math.abs(value - Math.round(value * 1_000_000_000) / 1_000_000_000) < 0.000000000001;
}

export function getPurchaseUnitOptions(stockUnit: string): { value: string; label: string }[] {
  const stock = units[stockUnit as StockUnit];
  if (!stock) return [{ value: stockUnit, label: stockUnit }];

  return unitOrder
    .filter((unit) => {
      const purchase = units[unit];
      const conversion = purchase.baseQuantity / stock.baseQuantity;
      return purchase.dimension === stock.dimension && isSupportedFactor(conversion);
    })
    .map((unit) => ({ value: unit, label: units[unit].label }));
}

export function calculateStockUnitsPerPurchaseUnit(purchaseUnit: string, stockUnit: string): number | null {
  const purchase = units[purchaseUnit as StockUnit];
  const stock = units[stockUnit as StockUnit];
  if (!purchase || !stock || purchase.dimension !== stock.dimension) return null;

  const conversion = purchase.baseQuantity / stock.baseQuantity;
  return isSupportedFactor(conversion) ? Math.round(conversion * 1_000_000_000) / 1_000_000_000 : null;
}

export function getDefaultPurchaseUnit(stockUnit: string): string {
  const defaults: Record<string, string> = {
    kg: "kg",
    g: "kg",
    liter: "liter",
    ml: "liter",
    pcs: "pcs",
  };
  const preferred = defaults[stockUnit];
  const options = getPurchaseUnitOptions(stockUnit);
  return options.find((option) => option.value === preferred)?.value ?? options[0]?.value ?? stockUnit;
}
