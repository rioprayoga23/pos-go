import type { CartItem } from "../types/pos";

const productPriceAdjustments: Record<string, number> = {
  "p-02": 4000,
  "p-05": 2000,
};

const cartItemNames: Record<string, string> = {
  "p-02": "Brown Sugar Boba Fresh Milk",
  "p-05": "Jasmine Peach Sparkling Tea",
};

export function getCartLineTotal(
  productId: string,
  quantity: number,
  unitPrice: number,
) {
  return (unitPrice + (productPriceAdjustments[productId] ?? 0)) * quantity;
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce(
    (subtotal, item) =>
      subtotal +
      getCartLineTotal(item.product.id, item.quantity, item.product.price),
    0,
  );
}

export function getCartItemName(productId: string, productName: string) {
  return cartItemNames[productId] ?? productName;
}
