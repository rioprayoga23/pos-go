import { StyleSheet } from "react-native";
import { colors, fieldHeight, radius, spacing, type } from "../../theme";

export const styles = StyleSheet.create({
  button: {
    minHeight: fieldHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  rangeButtonStandalone: {
    width: 210,
    minHeight: fieldHeight,
    maxWidth: 210,
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
  },
  rangeButtonFullWidth: {
    width: "100%",
    maxWidth: "100%",
    flexShrink: 1,
    justifyContent: "space-between",
  },
  rangeButtonPhone: {
    width: "100%",
    maxWidth: "100%",
    flexShrink: 1,
  },
  rangeButtonStandaloneText: {
    fontSize: type.micro,
    fontWeight: "600",
  },
  rangeButtonFullWidthText: { flex: 1, minWidth: 0, maxWidth: "100%" },
  buttonActive: {
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.surfaceBlue,
  },
  buttonText: {
    color: colors.inkMuted,
    fontSize: type.micro,
    fontWeight: "600",
  },
  buttonTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  rangeText: {
    maxWidth: 190,
    minWidth: 0,
    flexShrink: 1,
  },
});
