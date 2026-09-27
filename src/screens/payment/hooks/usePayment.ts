import { useState } from "react";
import { getCartTotals, useCartStore } from "../../../store/cartStore";
import { useTransactionStore } from "../../../store/transactionStore";
import { getLocalDateKey } from "../../../utils/date";
import type { Order, PaymentMethod } from "../../../types/pos";

export function usePayment() {
  const items = useCartStore((state) => state.items);
  const orderType = useCartStore((state) => state.orderType);
  const subtotal = getCartTotals(items).subtotal;
  const clearCart = useCartStore((state) => state.clearCart);
  const completeOrder = useTransactionStore((state) => state.completeOrder);
  const openingCash = useTransactionStore((state) => state.openingCash);
  const cashRegisterOpenedOn = useTransactionStore((state) => state.cashRegisterOpenedOn);
  const cashRegisterClosedOn = useTransactionStore((state) => state.cashRegisterClosedOn);
  const today = getLocalDateKey();
  const cashRegisterOpen = openingCash !== null && cashRegisterOpenedOn === today && cashRegisterClosedOn !== today;
  const cashRegisterClosedToday = cashRegisterClosedOn === today;
  const [paymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("Tunai");
  const [cash, setCashValue] = useState("");
  const [cashConfirmationKey, setCashConfirmationKey] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState("");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [qrisConfirmationKey, setQrisConfirmationKey] = useState<string | null>(null);
  const [paymentErrorState, setPaymentErrorState] = useState<{ cartKey: string; message: string } | null>(null);
  const cartKey = items
    .map(({ product, quantity }) => `${product.id}:${quantity}:${product.price}:${product.stock}:${product.isAvailable}`)
    .join("|") + `|${cashRegisterOpenedOn ?? "closed"}`;
  const qrisVerified = qrisConfirmationKey === cartKey && Boolean(cartKey);
  const paymentError = paymentErrorState?.cartKey === cartKey ? paymentErrorState.message : "";
  const received = Number(cash.replace(/\D/g, "")) || 0;
  const change = received - subtotal;
  const cashReady = cashConfirmationKey === cartKey && cashRegisterOpen && received >= subtotal;

  const setCash = (value: string) => {
    setCashValue(value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 12));
    setCashConfirmationKey(null);
    setPaymentErrorState(null);
  };

  const applyCash = () => {
    if (cashRegisterOpen && received >= subtotal) setCashConfirmationKey(cartKey);
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setCashConfirmationKey(null);
    setQrisConfirmationKey(null);
    setPaymentErrorState(null);
  };

  const setQrisVerified = (verified: boolean) => {
    setQrisConfirmationKey(verified ? cartKey : null);
    setPaymentErrorState(null);
  };

  const submitPayment = () => {
    if (
      !items.length ||
      !cashRegisterOpen ||
      (paymentMethod === "Tunai" && !cashReady) ||
      (paymentMethod === "QRIS" && !qrisVerified)
    )
      return;
    const order = completeOrder(items, "Pelanggan umum", paymentMethod, orderType);
    if (!order) {
      setPaymentErrorState({ cartKey, message: "Stok berubah atau kasir belum dibuka. Periksa stok dan status kas sebelum melanjutkan." });
      return;
    }
    setLastOrderNumber(order.number);
    setLastOrder(order);
    clearCart();
    setCashValue("");
    setCashConfirmationKey(null);
    setQrisConfirmationKey(null);
    setPaymentErrorState(null);
    setShowSuccess(true);
  };

  return {
    items,
    orderType,
    subtotal,
    paymentMethod,
    setPaymentMethod,
    cash,
    setCash,
    cashReady,
    applyCash,
    cashRegisterOpen,
    cashRegisterClosedToday,
    showSuccess,
    setShowSuccess,
    lastOrderNumber,
    lastOrder,
    qrisVerified,
    setQrisVerified,
    paymentError,
    received,
    change,
    submitPayment,
  };
}
