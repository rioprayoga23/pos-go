const quantityScale = 1_000_000_000n;
const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER);

/** Keep the API's nine-decimal stock units exact during unit conversion. */
function scaledQuantity(value: string): bigint | null {
  if (!/^\d+(?:\.\d{0,9})?$/.test(value)) return null;
  const [integer, fraction = ""] = value.split(".");
  return BigInt(integer) * quantityScale + BigInt(fraction.padEnd(9, "0"));
}

function scaledConversion(conversion: number) {
  if (!Number.isFinite(conversion) || conversion <= 0) return null;
  return scaledQuantity(conversion.toFixed(9));
}

export function toPurchaseQuantity(
  stockQuantity: string,
  stockUnitsPerPurchaseUnit: number,
): number | null {
  const quantity = scaledQuantity(stockQuantity);
  const conversion = scaledConversion(stockUnitsPerPurchaseUnit);
  if (quantity === null || !conversion || quantity % conversion !== 0n)
    return null;
  const count = quantity / conversion;
  return count <= maxSafeInteger ? Number(count) : null;
}

export function toPurchaseUnitPrice(
  stockUnitPrice: string,
  stockUnitsPerPurchaseUnit: number,
): number | null {
  if (!/^\d+$/.test(stockUnitPrice)) return null;
  const conversion = scaledConversion(stockUnitsPerPurchaseUnit);
  if (!conversion) return null;
  const scaledPrice = BigInt(stockUnitPrice) * conversion;
  if (scaledPrice % quantityScale !== 0n) return null;
  const price = scaledPrice / quantityScale;
  return price <= maxSafeInteger ? Number(price) : null;
}

export function stockUnitPriceChanged(
  draft: string | null,
  currentAverage: number,
) {
  return draft !== null && Number(draft) !== currentAverage;
}
