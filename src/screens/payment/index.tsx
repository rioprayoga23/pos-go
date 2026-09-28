import { router } from "expo-router";
import { ButtonText, HStack, Text, VStack } from "@gluestack-ui/themed";
import { useWindowDimensions } from "react-native";
import { useIsFocused } from "expo-router/react-navigation";
import { AppShell } from "../../components/app-shell";
import { LoadingScreen } from "../../components/loading-screen";
import {
  AppButton as Button,
  AppIcon,
  AppPressable,
  EmptyState,
  Panel,
} from "../../components/ui";
import { colors, spacing } from "../../theme";
import { formatCurrency } from "../../utils/format";
import {
  PaymentMethodButton,
  QrPaymentPanel,
} from "./components/PaymentPanels";
import { CashPanel } from "./components/CashPanel";
import { PaymentSuccessModal } from "./components/PaymentSuccessModal";
import { ReceiptPreview } from "./components/ReceiptPreview";
import { createPaymentReceiptData } from "./utils/receiptData";
import { createHistoryReceiptData } from "../history/utils/receiptData";
import { getNextOrderNumber } from "../../utils/orderNumber";
import { useTransactionStore } from "../../store/transactionStore";
import { styles } from "./styles";
import { usePayment } from "./hooks/usePayment";

export function PaymentScreen() {
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const {
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
    received,
    change,
    paymentError,
    submitPayment,
    isSubmitting,
    isRegisterLoading,
  } = usePayment(isFocused);
  const isWide = width >= 1024;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const orders = useTransactionStore((state) => state.orders);
  const nextOrderNumber = getNextOrderNumber(orders);
  const displayedOrderNumber =
    showSuccess && lastOrder ? lastOrder.number : nextOrderNumber;
  const receiptData =
    showSuccess && lastOrder
      ? createHistoryReceiptData(lastOrder)
      : createPaymentReceiptData(
          items,
          nextOrderNumber,
          orderType,
          paymentMethod,
        );

  if (!items.length && !showSuccess)
    return (
      <AppShell active="Payment">
        <EmptyState
          icon="cart-off"
          title="Belum ada pesanan"
          action={
            <Button
              onPress={() => router.navigate("/order")}
              style={styles.primaryButton}
            >
              <ButtonText style={styles.primaryButtonText}>
                Kembali ke kasir
              </ButtonText>
            </Button>
          }
        />
      </AppShell>
    );

  return (
    <AppShell active="Payment" scrollable={!isWide}>
      {(requestCashAction) => (
        <>
          <LoadingScreen visible={isSubmitting || isRegisterLoading} />
          <VStack style={[styles.page, isWide && styles.pageFill]}>
            <HStack
              style={[
                styles.paymentLayout,
                !isWide && styles.paymentLayoutStack,
              ]}
            >
              <VStack
                style={[
                  styles.paymentColumn,
                  !isWide && styles.paymentColumnStacked,
                ]}
              >
                <Panel style={styles.billBar} padding={spacing.md}>
                  <VStack style={styles.billSummary}>
                    <HStack style={styles.billHeader}>
                      <Text
                        style={[
                          styles.microLabel,
                          (isMobile || isTablet) && styles.microLabelAdaptive,
                        ]}
                      >
                        SUBTOTAL
                      </Text>
                      <Text style={styles.billOrderTag}>
                        Pesanan {displayedOrderNumber}
                      </Text>
                    </HStack>
                    <HStack style={styles.billAmountRow}>
                      <Text
                        style={[
                          styles.billTotal,
                          isMobile && styles.billTotalMobile,
                          isTablet && styles.billTotalTablet,
                        ]}
                      >
                        {formatCurrency(subtotal)}
                      </Text>
                      <VStack style={styles.billOrderCount}>
                        <Text
                          style={[
                            styles.billOrderCountLabel,
                            (isMobile || isTablet) &&
                              styles.billOrderCountLabelAdaptive,
                            isTablet && styles.billOrderCountLabelTablet,
                          ]}
                        >
                          TOTAL PESANAN
                        </Text>
                        <Text style={styles.billOrderCountValue}>
                          {items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                          Minuman
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Panel>
                {cashRegisterOpen ? (
                  <>
                    <HStack style={styles.methodSelector}>
                      <PaymentMethodButton
                        active={paymentMethod === "Tunai"}
                        icon="payments"
                        title="Tunai / Cash"
                        onPress={() => setPaymentMethod("Tunai")}
                      />
                      <PaymentMethodButton
                        active={paymentMethod === "QRIS"}
                        icon="qrcode-scan"
                        title="QRIS"
                        onPress={() => setPaymentMethod("QRIS")}
                      />
                    </HStack>
                    {paymentMethod === "QRIS" ? (
                      <QrPaymentPanel
                        verified={qrisVerified}
                        setVerified={setQrisVerified}
                        subtotal={subtotal}
                        bounded={isWide}
                      />
                    ) : (
                      <CashPanel
                        cash={cash}
                        setCash={setCash}
                        received={received}
                        change={change}
                        subtotal={subtotal}
                        cashReady={cashReady}
                        onApply={applyCash}
                      />
                    )}
                  </>
                ) : (
                  <Panel padding={spacing.lg}>
                    <VStack style={styles.registerClosedContent}>
                      <HStack style={styles.registerClosedIcon}>
                        <AppIcon
                          name="cash-register"
                          size={28}
                          color={colors.primary}
                        />
                      </HStack>
                      <VStack style={styles.registerClosedCopy}>
                        <Text style={styles.registerClosedTitle}>
                          {cashRegisterClosedToday
                            ? "Kasir sudah ditutup hari ini"
                            : "Buka kasir sebelum menerima pembayaran"}
                        </Text>
                        <Text style={styles.registerClosedDescription}>
                          {cashRegisterClosedToday
                            ? "Transaksi dilanjutkan pada hari operasional berikutnya. Keranjang ini tetap tersimpan."
                            : "Kasir perlu dibuka sebelum pembayaran dapat diterima. Masukkan uang awal sesuai jumlah fisik di laci."}
                        </Text>
                      </VStack>
                      {!cashRegisterClosedToday ? (
                        <AppPressable
                          onPress={requestCashAction}
                          style={[
                            styles.primaryButton,
                            styles.registerClosedAction,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel="Buka Kasir"
                        >
                          <AppIcon
                            name="cash-register"
                            size={17}
                            color={colors.white}
                          />
                          <Text style={styles.primaryButtonText}>
                            Buka Kasir
                          </Text>
                        </AppPressable>
                      ) : null}
                    </VStack>
                  </Panel>
                )}
              </VStack>
              <VStack
                style={[
                  styles.receiptColumn,
                  !isWide && styles.receiptColumnStacked,
                ]}
              >
                <ReceiptPreview data={receiptData} bounded={isWide} />
                {paymentError ? (
                  <Text style={styles.paymentError}>{paymentError}</Text>
                ) : null}
                <Button
                  onPress={submitPayment}
                  isDisabled={
                    !cashRegisterOpen ||
                    isSubmitting ||
                    (paymentMethod === "QRIS" ? !qrisVerified : !cashReady)
                  }
                  style={[
                    styles.finalButton,
                    (!cashRegisterOpen ||
                      (paymentMethod === "QRIS" && !qrisVerified) ||
                      (paymentMethod === "Tunai" && !cashReady)) && {
                      opacity: 0.5,
                    },
                  ]}
                >
                  <HStack style={styles.finalButtonLeft}>
                    <HStack style={styles.finalIcon}>
                      <AppIcon
                        name={
                          cashRegisterOpen
                            ? "check-circle-outline"
                            : "lock-outline"
                        }
                        size={23}
                        color={colors.white}
                      />
                    </HStack>
                    <VStack style={{ gap: 2 }}>
                      <ButtonText style={styles.finalButtonText}>
                        {cashRegisterOpen
                          ? "Selesaikan Pesanan"
                          : cashRegisterClosedToday
                            ? "Kasir Ditutup Hari Ini"
                            : "Buka Kasir untuk Melanjutkan"}
                      </ButtonText>
                      <Text style={styles.finalButtonHint}>
                        {cashRegisterOpen
                          ? `Antrean ${displayedOrderNumber} • Menunggu diproses`
                          : cashRegisterClosedToday
                            ? "Transaksi tersedia besok"
                            : "Pilih Buka Kasir untuk memasukkan uang awal"}
                      </Text>
                    </VStack>
                  </HStack>
                </Button>
              </VStack>
            </HStack>
          </VStack>
          <PaymentSuccessModal
            visible={showSuccess}
            orderNumber={lastOrderNumber}
            onClose={() => setShowSuccess(false)}
            onViewQueue={() => {
              setShowSuccess(false);
              router.navigate("/queue");
            }}
          />
        </>
      )}
    </AppShell>
  );
}
