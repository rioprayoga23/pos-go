import { useRef, useState } from "react";
import { useAppToast } from "../../../components/toast/useAppToast";
import { getCartTotals, useCartStore } from "../../../store/cartStore";
import { useTransactionStore } from "../../../store/transactionStore";
import type { Order } from "../../../types/pos";
import { digitsOnly, parseWholeNumber } from "../../../utils/format";
import { useCashRegister } from "../../cash/hooks/useCashApi";
import { orderRecordToLocalOrder, type CreateOrderDraft } from "../../order/api";
import { useCreateOrder } from "../../order/hooks/useCreateOrder";

function createRequestKey() {
  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function usePayment(enabled = true) {
  const toast = useAppToast();
  const items = useCartStore((state) => state.items);
  const orderType = useCartStore((state) => state.orderType);
  const subtotal = getCartTotals(items).subtotal;
  const clearCart = useCartStore((state) => state.clearCart);
  const addCreatedOrder = useTransactionStore((state) => state.addCreatedOrder);
  const cashRegisterQuery = useCashRegister({ enabled });
  const createOrderMutation = useCreateOrder();
  const register = cashRegisterQuery.data?.data;
  const cashRegisterOpen = register?.status === "open";
  const cashRegisterClosed = register?.status === "closed";
  const [paymentMethod, setSelectedPaymentMethod] = useState<"Tunai" | "QRIS">("Tunai");
  const [cash, setCashValue] = useState("");
  const [cashConfirmationKey, setCashConfirmationKey] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState("");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [qrisConfirmationKey, setQrisConfirmationKey] = useState<string | null>(null);
  const pendingRequest = useRef<{ identity: string; key: string } | null>(null);
  const cartKey =
    items
      .map(({ product, quantity }) =>
        `${product.id}:${quantity}:${product.price}:${product.stock}:${product.isAvailable}`,
      )
      .join("|") + `|${register?.id ?? register?.status ?? "loading"}`;
  const qrisVerified = qrisConfirmationKey === cartKey && Boolean(cartKey);
  const received = parseWholeNumber(cash);
  const change = received - subtotal;
  const cashReady = cashConfirmationKey === cartKey && cashRegisterOpen && received >= subtotal;

  const setCash = (value: string) => {
    setCashValue(digitsOnly(value, 12));
    setCashConfirmationKey(null);
  };

  const applyCash = () => {
    if (cashRegisterOpen && received >= subtotal) setCashConfirmationKey(cartKey);
  };

  const setPaymentMethod = (method: "Tunai" | "QRIS") => {
    setSelectedPaymentMethod(method);
    setCashConfirmationKey(null);
    setQrisConfirmationKey(null);
  };

  const setQrisVerified = (verified: boolean) => {
    setQrisConfirmationKey(verified ? cartKey : null);
  };

  const submitPayment = async () => {
    if (
      !items.length ||
      !cashRegisterOpen ||
      (paymentMethod === "Tunai" && !cashReady) ||
      (paymentMethod === "QRIS" && !qrisVerified)
    ) return;

    const draft: CreateOrderDraft = {
      requestKey: "",
      orderType: orderType === "Dine in" ? "dine_in" : "take_away",
      paymentMethod: paymentMethod === "Tunai" ? "cash" : "qris",
      ...(paymentMethod === "Tunai" ? { cashReceivedRupiah: received } : { qrisConfirmedManually: true }),
      items: items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
        expectedUnitPriceRupiah: product.price,
      })),
    };
    const identity = JSON.stringify({
      orderType: draft.orderType,
      paymentMethod: draft.paymentMethod,
      cashReceivedRupiah: draft.cashReceivedRupiah,
      items: draft.items,
      registerID: register?.id,
    });
    if (pendingRequest.current?.identity !== identity) {
      pendingRequest.current = { identity, key: createRequestKey() };
    }
    draft.requestKey = pendingRequest.current.key;

    try {
      const saved = await createOrderMutation.mutateAsync(draft);
      const order = orderRecordToLocalOrder(saved, items);
      addCreatedOrder(order);
      setLastOrderNumber(order.number);
      setLastOrder(order);
      pendingRequest.current = null;
      clearCart();
      setCashValue("");
      setCashConfirmationKey(null);
      setQrisConfirmationKey(null);
      setShowSuccess(true);
    } catch (error) {
      toast.error(
        "Pembayaran gagal dicatat",
        error instanceof Error ? error.message : "Coba lagi.",
      );
    }
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
    cashRegisterClosed,
    showSuccess,
    setShowSuccess,
    lastOrderNumber,
    lastOrder,
    qrisVerified,
    setQrisVerified,
    isSubmitting: createOrderMutation.isPending,
    isRegisterLoading: cashRegisterQuery.isFetching,
    received,
    change,
    submitPayment,
  };
}
