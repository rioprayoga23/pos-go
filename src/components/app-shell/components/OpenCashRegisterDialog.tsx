import {
  HStack,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useState } from "react";
import { useWindowDimensions, StyleSheet } from "react-native";
import { useTransactionStore } from "../../../store/transactionStore";
import { colors, elevation, radius, spacing, type } from "../../../theme";
import { AppIcon, AppInput, AppModalCloseButton, AppPressable } from "../../ui";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 12);
}

function formatAmount(value: string) {
  return onlyDigits(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function OpenCashRegisterDialog({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (openingCash: number) => void;
}) {
  const { height } = useWindowDimensions();
  const openingCashDefault = useTransactionStore((state) => state.openingCashDefault);
  const [openingInput, setOpeningInput] = useState(() => String(openingCashDefault));
  const openingAmount = openingInput === "" ? null : Number(onlyDigits(openingInput));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={[dialogStyles.content, { maxHeight: Math.max(360, height - 24) }]}>
        <ModalHeader style={dialogStyles.header}>
          <HStack style={dialogStyles.icon}>
            <AppIcon name="cash-register" size={19} color={colors.primary} />
          </HStack>
          <VStack style={dialogStyles.heading}>
            <Text style={dialogStyles.title}>Buka kasir hari ini</Text>
          </VStack>
          <AppModalCloseButton onPress={onClose} accessibilityLabel="Tutup popup buka kasir" />
        </ModalHeader>
        <ModalBody style={dialogStyles.body}>
          <VStack style={dialogStyles.form}>
            <Text style={dialogStyles.label}>Uang awal hari ini</Text>
            <AppInput
              value={formatAmount(openingInput)}
              onChangeText={(value) => setOpeningInput(onlyDigits(value))}
              keyboardType="number-pad"
              placeholder="0"
              leading={<Text style={dialogStyles.prefix}>Rp</Text>}
              style={dialogStyles.amountInput}
              inputStyle={dialogStyles.amountValue}
              accessibilityLabel="Uang awal kasir hari ini"
            />
          </VStack>
        </ModalBody>
        <ModalFooter style={dialogStyles.footer}>
          <AppPressable
            onPress={() => openingAmount !== null && onConfirm(openingAmount)}
            disabled={openingAmount === null}
            style={[dialogStyles.confirmButton, openingAmount === null && dialogStyles.disabled]}
            accessibilityRole="button"
            accessibilityLabel="Konfirmasi buka kasir"
            accessibilityState={{ disabled: openingAmount === null }}
          >
            <AppIcon name="check" size={17} color={colors.white} />
            <Text style={dialogStyles.confirmText}>Buka Kasir</Text>
          </AppPressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

const dialogStyles = StyleSheet.create({
  content: { width: "94%", maxWidth: 520, borderRadius: radius.lg, backgroundColor: colors.white, overflow: "hidden", ...elevation.panel },
  header: { alignItems: "center", gap: spacing.md, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.line },
  icon: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.surfaceTint, alignItems: "center", justifyContent: "center" },
  heading: { flex: 1, minWidth: 0, gap: spacing.xs },
  title: { color: colors.ink, fontSize: 18, lineHeight: 24, fontWeight: "900" },
  body: { padding: spacing.lg },
  form: { gap: spacing.sm },
  label: { color: colors.ink, fontSize: type.caption, fontWeight: "800" },
  amountInput: { width: "100%", minHeight: 54 },
  amountValue: { color: colors.success, fontSize: 21, fontWeight: "900", fontVariant: ["tabular-nums"] },
  prefix: { color: colors.inkMuted, fontSize: type.bodySmall, fontWeight: "800" },
  footer: { width: "100%", padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.line },
  confirmButton: { width: "100%", minHeight: 48, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: spacing.sm, ...elevation.button },
  confirmText: { color: colors.white, fontSize: type.caption, fontWeight: "900" },
  disabled: { opacity: 0.45 },
});
