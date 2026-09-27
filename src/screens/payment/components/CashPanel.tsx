import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useWindowDimensions, View } from "react-native";
import { AppInput, AppPressable as Pressable, Panel } from "../../../components/ui";
import { colors, spacing } from "../../../theme";
import { formatCurrency } from "../../../utils/format";
import { quickTenderAmounts } from "../constants";
import { styles } from "../styles";
import { formatCashInput } from "../utils/formatCashInput";

type CashPanelProps = {
  cash: string;
  setCash: (value: string) => void;
  received: number;
  change: number;
  subtotal: number;
  cashReady: boolean;
  onApply: () => void;
};

const keypadRows = [
  ["7", "8", "9", "Backspace"],
  ["4", "5", "6", "C"],
  ["1", "2", "3", "000"],
  ["0", "00", null, null],
] as const;
type KeypadKey = Exclude<(typeof keypadRows)[number][number], null>;

export function CashPanel({
  cash,
  setCash,
  received,
  change,
  subtotal,
  cashReady,
  onApply,
}: CashPanelProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const compactWideGrid = width >= 1024;
  const isStacked = width < 1024;
  const stackTenderFields = width < 420;
  const hasCash = cash.length > 0;
  const isPaid = hasCash && received >= subtotal;

  const handleKey = (key: KeypadKey) => {
    if (key === "Backspace") return setCash(cash.slice(0, -1));
    if (key === "C") return setCash("");
    if (cash.length + key.length <= 12) setCash(cash + key);
  };

  return (
    <Panel style={[styles.cashPanel, isStacked && styles.cashPanelStacked]} padding={spacing.md}>
      <VStack style={[styles.cashContent, isStacked && styles.cashContentStacked]}>
        <VStack style={styles.tenderSection}>
          <HStack style={styles.tenderHeading}>
            <Text style={[styles.microLabel, styles.microLabelAdaptive, isTablet && styles.microLabelTablet]}>PEMBAYARAN TUNAI</Text>
          </HStack>
          <View style={[styles.quickGrid, compactWideGrid && styles.quickGridCompact]}>
            <Pressable
              onPress={() => setCash(String(subtotal))}
              hitSlop={3}
              style={[
                styles.quickButton,
                compactWideGrid && styles.quickButtonCompact,
                hasCash && received === subtotal && styles.quickButtonActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Uang pas ${formatCurrency(subtotal)}`}
              accessibilityState={{ selected: hasCash && received === subtotal }}
            >
              <Text
                style={[
                  styles.quickButtonText,
                  isTablet && styles.quickButtonTextTablet,
                  hasCash && received === subtotal && styles.quickButtonTextActive,
                ]}
              >
                PAS
              </Text>
            </Pressable>
            {quickTenderAmounts.map((amount) => (
              <Pressable
                key={amount}
                onPress={() => setCash(String(amount))}
                hitSlop={3}
                style={[
                  styles.quickButton,
                  compactWideGrid && styles.quickButtonCompact,
                  received === amount && styles.quickButtonActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Uang diterima ${formatCurrency(amount)}`}
                accessibilityState={{ selected: received === amount }}
              >
                <Text style={[styles.quickButtonText, isTablet && styles.quickButtonTextTablet, received === amount && styles.quickButtonTextActive]}>
                  {amount / 1000}k
                </Text>
              </Pressable>
            ))}
          </View>
          <HStack style={[styles.tenderAmounts, stackTenderFields && styles.tenderAmountsStacked]}>
            <VStack style={styles.amountBox}>
              <Text style={[styles.microLabel, styles.microLabelAdaptive, isTablet && styles.microLabelTablet]}>UANG DITERIMA</Text>
              <AppInput
                value={formatCashInput(cash)}
                onChangeText={setCash}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.inkSubtle}
                accessibilityLabel="Uang diterima dari pelanggan"
                leading={<Text style={styles.moneyPrefix}>Rp</Text>}
                style={styles.tenderInput}
                inputStyle={styles.moneyInputText}
              />
            </VStack>
            <VStack style={styles.amountBox}>
              <Text style={[styles.microLabel, styles.microLabelAdaptive, isTablet && styles.microLabelTablet]}>{!hasCash || isPaid ? "KEMBALIAN" : "KURANG BAYAR"}</Text>
              <HStack style={[styles.changeBox, isPaid && styles.changeBoxReady]}>
                <Text style={[styles.moneyInputText, styles.changeValue, hasCash && !isPaid && styles.shortageValue]}>
                  {formatCurrency(hasCash ? Math.abs(change) : 0)}
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </VStack>
        <VStack style={[styles.keypadGrid, isStacked && styles.keypadGridStacked]}>
          {keypadRows.map((row, rowIndex) => (
            <View
              key={`keypad-row-${rowIndex}`}
              style={[styles.keypadRow, isStacked && styles.keypadRowStacked, isMobile && styles.keypadRowMobile]}
            >
              {row.map((key, cellIndex) => key === null ? (
                <View key={`empty-${cellIndex}`} style={styles.keypadCell} />
              ) : (
                <View key={key} style={styles.keypadCell}>
                  <Pressable
                    onPress={() => handleKey(key)}
                    style={[styles.keypadButton, key === "C" && styles.keypadClear]}
                    accessibilityRole="button"
                    accessibilityLabel={key === "C" ? "Kosongkan uang diterima" : key === "Backspace" ? "Hapus satu digit uang diterima" : `Ketik ${key}`}
                  >
                    <Text
                      style={[
                        styles.keypadText,
                        isMobile && styles.keypadTextMobile,
                        key === "C" && styles.keypadClearText,
                      ]}
                    >
                      {key === "Backspace" ? "⌫" : key}
                    </Text>
                  </Pressable>
                </View>
              ))}
              {rowIndex === keypadRows.length - 1 ? (
                <Pressable
                  onPress={onApply}
                  disabled={!isPaid}
                  style={[styles.applyButton, !isPaid && styles.disabledButton]}
                  accessibilityRole="button"
                  accessibilityLabel="Terapkan uang diterima"
                  accessibilityState={{ disabled: !isPaid }}
                >
                  <Text style={[styles.applyButtonText, isTablet && styles.applyButtonTextTablet]}>{cashReady ? "Uang Diterapkan" : "Terapkan Uang"}</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </VStack>
      </VStack>
    </Panel>
  );
}
