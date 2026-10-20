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
import { digitsOnly, formatThousands } from "../../../utils/format";
import {
  colors,
  elevation,
  fieldHeight,
  radius,
  spacing,
  type,
  typography,
} from "../../../theme";
import {
  AppIcon,
  AppInput,
  AppModalCloseButton,
  FieldLabel,
  ModalFormActions,
} from "../../ui";

export function OpenCashRegisterDialog({
  isOpen,
  onClose,
  onConfirm,
  error,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (openingCash: number) => Promise<void>;
  error: string;
  isSubmitting: boolean;
}) {
  const { height } = useWindowDimensions();
  const openingCashDefault = 100_000;
  const [openingInput, setOpeningInput] = useState(() =>
    String(openingCashDefault),
  );
  const openingAmount =
    openingInput === "" ? null : Number(digitsOnly(openingInput, 12));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent
        style={[
          dialogStyles.content,
          { maxHeight: Math.max(360, height - 24) },
        ]}
      >
        <ModalHeader style={dialogStyles.header}>
          <HStack style={dialogStyles.icon}>
            <AppIcon name="cash-register" size={19} color={colors.primary} />
          </HStack>
          <VStack style={dialogStyles.heading}>
            <Text style={dialogStyles.title}>Buka sesi kasir</Text>
          </VStack>
          <AppModalCloseButton
            onPress={onClose}
            accessibilityLabel="Tutup popup buka kasir"
          />
        </ModalHeader>
        <ModalBody style={dialogStyles.body}>
          <VStack style={dialogStyles.form}>
            <FieldLabel
              required
              style={[dialogStyles.label, { marginBottom: 0 }]}
            >
              Uang awal sesi ini
            </FieldLabel>
            <AppInput
              value={formatThousands(openingInput)}
              onChangeText={(value) => setOpeningInput(digitsOnly(value, 12))}
              keyboardType="number-pad"
              placeholder="0"
              leading={<Text style={dialogStyles.prefix}>Rp</Text>}
              style={dialogStyles.amountInput}
              inputStyle={dialogStyles.amountValue}
              accessibilityLabel="Uang awal sesi kasir"
            />
            {error ? <Text style={dialogStyles.error}>{error}</Text> : null}
          </VStack>
        </ModalBody>
        <ModalFooter style={dialogStyles.footer}>
          <ModalFormActions
            primaryLabel="Buka Kasir"
            onPrimary={() => {
              if (openingAmount !== null) void onConfirm(openingAmount);
            }}
            primaryDisabled={openingAmount === null}
            primaryBusy={isSubmitting}
            primaryBusyLabel="Membuka kasir..."
            primaryIcon="check"
            onSecondary={onClose}
            secondaryDisabled={isSubmitting}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

const dialogStyles = StyleSheet.create({
  content: {
    width: "94%",
    maxWidth: 520,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    overflow: "hidden",
    ...elevation.panel,
  },
  header: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTint,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { flex: 1, minWidth: 0, gap: spacing.xs },
  title: { color: colors.ink, ...typography.sectionTitle },
  body: { padding: spacing.lg },
  form: { gap: spacing.sm },
  label: { color: colors.ink, ...typography.label },
  error: { color: colors.danger, ...typography.helper },
  amountInput: { width: "100%", minHeight: fieldHeight },
  amountValue: {
    color: colors.success,
    fontSize: type.amount,
    lineHeight: 25,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  prefix: { color: colors.inkMuted, ...typography.input, fontWeight: "600" },
  footer: {
    width: "100%",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
