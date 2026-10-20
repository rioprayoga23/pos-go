import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Modal, ModalBackdrop, ModalContent, Text } from "@gluestack-ui/themed";
import {
  AppIcon,
  AppInput,
  AppModalCloseButton,
  AppPressable,
  FieldLabel,
  type IconName,
} from "../ui";
import {
  colors,
  elevation,
  fieldHeight,
  radius,
  spacing,
  typography,
} from "../../theme";
import {
  decimalOnly,
  digitsOnly,
  formatDecimalInput,
  formatThousands,
} from "../../utils/format";

export function Field({
  label,
  required = false,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={ui.field}>
      <FieldLabel required={required} style={[ui.label, { marginBottom: 0 }]}>
        {label}
      </FieldLabel>
      {children}
      {error ? (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={ui.muted}>{hint}</Text>
      ) : null}
    </View>
  );
}
export function NumberField({
  value,
  onChange,
  label,
  unit,
  money = false,
  whole = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  unit?: string;
  money?: boolean;
  whole?: boolean;
}) {
  return (
    <AppInput
      accessibilityLabel={label}
      value={
        money || whole ? formatThousands(value) : formatDecimalInput(value)
      }
      onChangeText={(text) =>
        onChange(money || whole ? digitsOnly(text) : decimalOnly(text))
      }
      keyboardType={money || whole ? "number-pad" : "decimal-pad"}
      placeholder="0"
      leading={money ? <Text style={ui.muted}>Rp</Text> : undefined}
      trailing={unit ? <Text style={ui.muted}>{unit}</Text> : undefined}
      style={{ minHeight: fieldHeight, height: fieldHeight }}
    />
  );
}
export function ActionButton({
  label,
  icon,
  onPress,
  tone = "secondary",
  disabled = false,
  busy = false,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  tone?: "primary" | "secondary" | "danger" | "quiet";
  disabled?: boolean;
  busy?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const foreground =
    tone === "primary"
      ? colors.white
      : tone === "danger"
        ? colors.danger
        : colors.primaryDark;
  return (
    <AppPressable
      preserveTouchSize
      hitSlop={2}
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        ui.button,
        tone === "primary" && ui.primaryButton,
        tone === "quiet" && {
          backgroundColor: "transparent",
          borderColor: "transparent",
          paddingHorizontal: spacing.xs,
        },
        tone === "danger" && {
          backgroundColor: colors.dangerSoft,
          borderColor: "transparent",
        },
        focused && { borderColor: colors.primary, borderWidth: 2 },
        (disabled || busy) && { opacity: 0.55 },
      ]}
    >
      {busy ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : icon ? (
        <AppIcon name={icon} size={18} color={foreground} />
      ) : null}
      <Text style={[ui.buttonText, { color: foreground }]}>{label}</Text>
    </AppPressable>
  );
}
export function SummaryRow({
  label,
  value,
  prominent = false,
}: {
  label: string;
  value: string;
  prominent?: boolean;
}) {
  return (
    <View style={ui.summaryRow}>
      <Text style={ui.muted}>{label}</Text>
      <Text style={[ui.value, prominent && ui.total]}>{value}</Text>
    </View>
  );
}
export function FormDialog({
  title,
  children,
  footer,
  onClose,
  busy = false,
  maxWidth = 560,
  dense = false,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
  busy?: boolean;
  maxWidth?: number;
  dense?: boolean;
}) {
  const { width, height } = useWindowDimensions();
  const compact = width < 600;
  return (
    <Modal
      isOpen
      onClose={() => {
        if (!busy) onClose();
      }}
      size="full"
    >
      <ModalBackdrop />
      <ModalContent
        style={[
          ui.dialog,
          {
            width: compact
              ? "100%"
              : Math.min(maxWidth, width - spacing.xl * 2),
            maxHeight: height - (compact ? 24 : 64),
            borderRadius: compact ? 12 : 16,
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flexShrink: 1 }}
        >
          <View style={[ui.dialogHeader, dense && ui.dialogHeaderCompact]}>
            <Text style={ui.heading}>{title}</Text>
            {!busy ? (
              <AppModalCloseButton
                onPress={onClose}
                accessibilityLabel={`Tutup ${title}`}
              />
            ) : null}
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              ui.dialogBody,
              dense && ui.dialogBodyCompact,
            ]}
          >
            {children}
          </ScrollView>
          <View style={[ui.dialogFooter, dense && ui.dialogFooterCompact]}>
            {footer}
          </View>
        </KeyboardAvoidingView>
      </ModalContent>
    </Modal>
  );
}
export function SectionState({
  error,
  onRetry,
  children,
}: {
  error?: string;
  onRetry: () => void;
  children: ReactNode;
}) {
  return (
    <>
      {error ? (
        <View style={ui.notice}>
          <Text accessibilityRole="alert" style={ui.error}>
            {error}
          </Text>
          <ActionButton label="Coba lagi" onPress={onRetry} />
        </View>
      ) : null}
      {children}
    </>
  );
}
export const ui = StyleSheet.create({
  page: { gap: spacing.xl, width: "100%", maxWidth: 1400, alignSelf: "center" },
  header: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: { ...typography.pageTitle, color: colors.ink },
  heading: { ...typography.sectionTitle, color: colors.ink, flexShrink: 1 },
  muted: { ...typography.description, color: colors.inkMuted },
  label: { ...typography.label, color: colors.ink },
  field: { gap: spacing.sm, minWidth: 0 },
  error: { ...typography.description, color: colors.danger },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  stack: { gap: spacing.lg },
  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  button: {
    minHeight: fieldHeight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...elevation.button,
  },
  buttonText: { ...typography.button },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: spacing.md,
  },
  value: {
    ...typography.label,
    color: colors.ink,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
    flexShrink: 1,
  },
  total: { fontSize: 20, fontWeight: "600" },
  dialog: {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderWidth: 0,
  },
  dialogHeader: {
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  dialogBody: { padding: spacing.xl, gap: spacing.lg },
  dialogFooter: {
    width: "100%",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    alignItems: "stretch",
  },
  dialogHeaderCompact: { padding: spacing.lg },
  dialogBodyCompact: { padding: spacing.lg, gap: spacing.md },
  dialogFooterCompact: { padding: spacing.md },
  notice: { gap: spacing.sm, alignItems: "flex-start" },
  empty: { padding: spacing.xxxl, gap: spacing.md, alignItems: "center" },
  divider: { height: 1, backgroundColor: colors.line },
});
