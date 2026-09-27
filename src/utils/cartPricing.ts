import type { CartItem } from "../types/pos";

export function getCartLineTotal(
  quantity: number,
  unitPrice: number,
) {
  return unitPrice * quantity;
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce(
    (subtotal, item) =>
      subtotal +
      getCartLineTotal(item.quantity, item.product.price),
    0,
  );
}
