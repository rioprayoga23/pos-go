import { useRef, useState } from "react";
import { getCartTotals, useCartStore } from "../../../store/cartStore";
import { useTransactionStore } from "../../../store/transactionStore";
import type { Order, PaymentMethod } from "../../../types/pos";
import { digitsOnly, parseWholeNumber } from "../../../utils/format";
import { useCashMutations, useCashRegister } from "../../cash/hooks/useCashApi";

export function usePayment() {
  const items = useCartStore((state) => state.items);
  const orderType = useCartStore((state) => state.orderType);
  const subtotal = getCartTotals(items).subtotal;
  const clearCart = useCartStore((state) => state.clearCart);
  const completeOrder = useTransactionStore((state) => state.completeOrder);
  const canCompleteOrder = useTransactionStore(
    (state) => state.canCompleteOrder,
  );
  const cashRegisterQuery = useCashRegister();
  const cashMutations = useCashMutations();
  const register = cashRegisterQuery.data?.data;
  const cashRegisterOpen = register?.status === "open";
  const cashRegisterClosedToday = register?.status === "closed_today";
  const [paymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("Tunai");
  const [cash, setCashValue] = useState("");
  const [cashConfirmationKey, setCashConfirmationKey] = useState<string | null>(
    null,
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState("");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [qrisConfirmationKey, setQrisConfirmationKey] = useState<string | null>(
    null,
  );
  const [paymentErrorState, setPaymentErrorState] = useState<{
    cartKey: string;
    message: string;
  } | null>(null);
  const pendingCashReceipt = useRef<{
    identity: string;
    orderRef: string;
  } | null>(null);
  const saleIdentity =
    items
      .map(({ product, quantity }) => `${product.id}:${quantity}:${product.price}`)
      .join("|") + `|${register?.id ?? "no-register"}`;
  const cartKey =
    items
      .map(
        ({ product, quantity }) =>
          `${product.id}:${quantity}:${product.price}:${product.stock}:${product.isAvailable}`,
      )
      .join("|") + `|${register?.id ?? register?.status ?? "loading"}`;
  const qrisVerified = qrisConfirmationKey === cartKey && Boolean(cartKey);
  const paymentError =
    paymentErrorState?.cartKey === cartKey ? paymentErrorState.message : "";
  const received = parseWholeNumber(cash);
  const change = received - subtotal;
  const cashReady =
    cashConfirmationKey === cartKey && cashRegisterOpen && received >= subtotal;

  const setCash = (value: string) => {
    setCashValue(digitsOnly(value, 12));
    setCashConfirmationKey(null);
    setPaymentErrorState(null);
  };

  const applyCash = () => {
    if (cashRegisterOpen && received >= subtotal)
      setCashConfirmationKey(cartKey);
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

  const submitPayment = async () => {
    if (
      !items.length ||
      !cashRegisterOpen ||
      (paymentMethod === "Tunai" && !cashReady) ||
      (paymentMethod === "QRIS" && !qrisVerified)
    )
      return;

    if (!canCompleteOrder(items)) {
      setPaymentErrorState({
        cartKey,
        message:
          "Stok berubah atau menu tidak tersedia. Periksa pesanan sebelum melanjutkan.",
      });
      return;
    }

    if (paymentMethod === "Tunai") {
      if (pendingCashReceipt.current?.identity !== saleIdentity) {
        pendingCashReceipt.current = {
          identity: saleIdentity,
          orderRef: `cash-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        };
      }
      try {
        await cashMutations.recordSale.mutateAsync({
          orderRef: pendingCashReceipt.current.orderRef,
          amountRupiah: subtotal,
        });
      } catch (error) {
        setPaymentErrorState({
          cartKey,
          message:
            error instanceof Error
              ? error.message
              : "Pembayaran gagal dicatat.",
        });
        return;
      }
    }

    const order = completeOrder(
      items,
      "Pelanggan umum",
      paymentMethod,
      orderType,
    );
    if (!order) {
      setPaymentErrorState({
        cartKey,
        message:
          "Stok berubah atau kasir belum dibuka. Periksa stok dan status kas sebelum melanjutkan.",
      });
      return;
    }
    pendingCashReceipt.current = null;
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
    isSubmitting: cashMutations.recordSale.isPending,
    isRegisterLoading: cashRegisterQuery.isFetching,
    received,
    change,
    submitPayment,
  };
}
