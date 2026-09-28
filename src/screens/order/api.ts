import { apiClient } from "../../services/apiClient";
import type { ApiEnvelope } from "../../services/apiTypes";
import type { CartItem, Order, OrderStatus, OrderType, PaymentMethod } from "../../types/pos";
import { getLocalDateKey } from "../../utils/date";

export type OrderPaymentMethod = "cash" | "qris";
export type OrderKind = "dine_in" | "take_away";

export type CreateOrderDraft = {
  requestKey: string;
  orderType: OrderKind;
  paymentMethod: OrderPaymentMethod;
  cashReceivedRupiah?: number;
  qrisConfirmedManually?: boolean;
  items: {
    productId: string;
    quantity: number;
    expectedUnitPriceRupiah: number;
  }[];
};

export type OrderRecord = {
  id: string;
  number: string;
  orderType: OrderKind;
  paymentMethod: OrderPaymentMethod;
  status: OrderStatus;
  totalRupiah: number;
  cashReceivedRupiah?: number;
  changeRupiah: number;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPriceRupiah: number;
    lineTotalRupiah: number;
    hppPerPortionRupiah: number | null;
    isPrepared: boolean;
  }[];
};

export async function createOrder(draft: CreateOrderDraft) {
  const response = await apiClient.post<ApiEnvelope<OrderRecord>>("/orders", draft);
  return response.data;
}

export function orderRecordToLocalOrder(
  record: OrderRecord,
  cartItems: CartItem[],
): Order {
  const cartByID = new Map(cartItems.map((item) => [item.product.id, item]));
  const createdAt = new Date(record.createdAt);
  const orderType: OrderType = record.orderType === "dine_in" ? "Dine in" : "Take away";
  const paymentMethod: PaymentMethod = record.paymentMethod === "cash" ? "Tunai" : "QRIS";

  return {
    id: record.id,
    number: record.number,
    createdAt: createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    createdOn: getLocalDateKey(createdAt),
    customer: "Pelanggan umum",
    items: record.items.map((item, index) => {
      const cartItem = cartByID.get(item.productId);
      const product = cartItem
        ? {
            ...cartItem.product,
            name: item.productName,
            price: item.unitPriceRupiah,
          }
        : {
            id: item.productId || `order-item-${index + 1}`,
            name: item.productName,
            recipeId: "",
            categoryId: "",
            categoryName: "",
            price: item.unitPriceRupiah,
            stock: 0,
            description: "",
            isAvailable: false,
            isRecommended: false,
            accent: "#5B45D6",
            icon: "cup-outline",
          };
      return {
        product,
        quantity: item.quantity,
        hppPerPortion: item.hppPerPortionRupiah,
      };
    }),
    preparedItemIds: [],
    status: record.status,
    paymentMethod,
    orderType,
    total: record.totalRupiah,
    cashReceivedRupiah: record.cashReceivedRupiah,
    changeRupiah: record.changeRupiah,
  };
}
