import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ButtonText, HStack, Text, VStack } from "@gluestack-ui/themed";
import { useWindowDimensions } from "react-native";
import { AppShell } from "../../components/app-shell";
import {
  AppButton as Button,
  AppIcon,
  EmptyState,
  Panel,
} from "../../components/ui";
import { RootStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme";
import { formatCurrency } from "../../utils/format";
import { PaymentMethodButton, QrPaymentPanel } from "./components/PaymentPanels";
import { CashPanel } from "./components/CashPanel";
import { PaymentSuccessModal } from "./components/PaymentSuccessModal";
import { ReceiptPreview } from "./components/ReceiptPreview";
import { createPaymentReceiptData } from "./utils/receiptData";
import { styles } from "./styles";
import { usePayment } from "./hooks/usePayment";

type Props = NativeStackScreenProps<RootStackParamList, "Payment">;

export function PaymentScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const {
    items,
    subtotal,
    paymentMethod,
    setPaymentMethod,
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
  } = usePayment();
  const isWide = width >= 1024;

  if (!items.length && !showSuccess)
    return (
      <AppShell active="Payment">
        <EmptyState
          icon="cart-off"
          title="Belum ada pesanan"
          description="Tambahkan menu terlebih dahulu sebelum melanjutkan ke pembayaran."
          action={
            <Button
              onPress={() => navigation.navigate("Order")}
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
      <VStack style={[styles.page, isWide && styles.pageFill]}>
        <HStack
          style={[styles.paymentLayout, !isWide && styles.paymentLayoutStack]}
        >
          <VStack style={styles.paymentColumn}>
            <Panel style={styles.billBar} padding={spacing.md}>
              <VStack style={styles.billSummary}>
                <HStack style={styles.billHeader}>
                  <Text style={styles.microLabel}>SUBTOTAL</Text>
                  <Text style={styles.billOrderTag}>Order #B-042</Text>
                </HStack>
                <HStack style={styles.billAmountRow}>
                  <Text style={styles.billTotal}>
                    {formatCurrency(subtotal)}
                  </Text>
                  <VStack style={styles.billOrderCount}>
                    <Text style={styles.billOrderCountLabel}>
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
              />
            ) : (
              <CashPanel
                cash={cash}
                setCash={setCash}
                received={received}
                change={change}
                subtotal={subtotal}
                cashReady={cashReady}
                openingCash={openingCash}
                onApply={applyCash}
              />
            )}
          </VStack>
          <VStack style={styles.receiptColumn}>
            <ReceiptPreview
              data={createPaymentReceiptData(items)}
              bounded={isWide}
            />
            <Button
              onPress={submitPayment}
              isDisabled={
                paymentMethod === "QRIS" ? !qrisVerified : !cashReady
              }
              style={[
                styles.finalButton,
                ((paymentMethod === "QRIS" && !qrisVerified) ||
                  (paymentMethod === "Tunai" && !cashReady)) && {
                  opacity: 0.5,
                },
              ]}
            >
              <HStack style={styles.finalButtonLeft}>
                <HStack style={styles.finalIcon}>
                  <AppIcon
                    name="printer-outline"
                    size={23}
                    color={colors.white}
                  />
                </HStack>
                <VStack style={{ gap: 2 }}>
                  <ButtonText style={styles.finalButtonText}>
                    Selesaikan &amp; Cetak Antrean
                  </ButtonText>
                  <Text style={styles.finalButtonHint}>
                    Antrean #A-042 • Langsung Siap
                  </Text>
                </VStack>
              </HStack>
              <Text style={styles.enterKey}>ENTER ↵</Text>
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
          navigation.navigate("Queue");
        }}
      />
    </AppShell>
  );
}
