import { StyleSheet } from "react-native";
import { colors, radius, spacing, type } from "../../theme";

export const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  rangeButtonStandalone: {
    minHeight: 40,
    maxWidth: 210,
    flexShrink: 1,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerLow,
  },
  rangeButtonPhone: {
    width: "100%",
  },
  rangeButtonStandaloneText: {
    fontSize: type.micro,
    fontWeight: "800",
  },
  buttonActive: {
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.surfaceBlue,
  },
  buttonText: {
    color: colors.inkMuted,
    fontSize: type.caption,
    fontWeight: "700",
  },
  buttonTextActive: {
    color: colors.primary,
    fontWeight: "900",
  },
  rangeText: {
    maxWidth: 190,
    flexShrink: 1,
  },
});
