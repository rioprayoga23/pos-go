import { StyleSheet } from "react-native";
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from "../../../theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  loginPanel: {
    width: "100%",
    maxWidth: 440,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    ...elevation.panel,
  },
  brandRow: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
  },
  brandCopy: {
    alignItems: "center",
    gap: 2,
  },
  brandName: {
    color: colors.ink,
    textAlign: "center",
    ...typography.label,
  },
  brandOutlet: {
    color: colors.inkMuted,
    textAlign: "center",
    ...typography.helper,
  },
  rule: {
    height: 1,
    backgroundColor: colors.line,
  },
  intro: {
    gap: spacing.xs,
  },
  title: {
    color: colors.ink,
    textAlign: "center",
    ...typography.pageTitle,
  },
  description: {
    color: colors.inkMuted,
    textAlign: "center",
    ...typography.description,
  },
  form: {
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.ink,
    textAlign: "left",
    ...typography.label,
  },
  passwordToggle: {
    width: 28,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: colors.danger,
    textAlign: "center",
    ...typography.helper,
  },
  submitButton: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  submitText: {
    color: colors.white,
    ...typography.button,
    fontWeight: "600",
  },
});
