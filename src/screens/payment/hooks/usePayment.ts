import { useState } from "react";
import { getCartTotals, useCartStore } from "../../../store/cartStore";
import { useTransactionStore } from "../../../store/transactionStore";
import type { PaymentMethod } from "../../../types/pos";

export function usePayment() {
  const items = useCartStore((state) => state.items);
  const subtotal = getCartTotals(items).subtotal;
  const clearCart = useCartStore((state) => state.clearCart);
  const completeOrder = useTransactionStore((state) => state.completeOrder);
  const openingCash = useTransactionStore((state) => state.openingCash);
  const [paymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("Tunai");
  const [cash, setCashValue] = useState("");
  const [cashConfirmed, setCashConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState("");
  const [qrisVerified, setQrisVerified] = useState(false);
  const received = Number(cash.replace(/\D/g, "")) || 0;
  const change = received - subtotal;
  const cashReady = cashConfirmed && openingCash !== null && received >= subtotal;

  const setCash = (value: string) => {
    setCashValue(value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 12));
    setCashConfirmed(false);
  };

  const applyCash = () => {
    if (openingCash !== null && received >= subtotal) setCashConfirmed(true);
  };

  const submitPayment = () => {
    if (
      !items.length ||
      (paymentMethod === "Tunai" && !cashReady) ||
      (paymentMethod === "QRIS" && !qrisVerified)
    )
      return;
    const order = completeOrder(items, "Pelanggan umum", paymentMethod);
    setLastOrderNumber(order.number);
    clearCart();
    setCashValue("");
    setCashConfirmed(false);
    setShowSuccess(true);
  };

  return {
    items,
    subtotal,
    paymentMethod,
    setPaymentMethod: setSelectedPaymentMethod,
    cash,
    setCash,
    cashReady,
    applyCash,
    openingCash,
    showSuccess,
    setShowSuccess,
    lastOrderNumber,
    qrisVerified,
    setQrisVerified,
    received,
    change,
    submitPayment,
  };
}
