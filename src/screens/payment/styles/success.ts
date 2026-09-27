import { StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../../../theme";

export const successStyles = StyleSheet.create({
  successModal: { borderRadius: radius.xl, padding: spacing.md },
  successHeader: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  successClose: { position: "absolute", top: 0, right: 0 },
  successFooter: {
    width: "100%",
    alignSelf: "stretch",
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: 0,
  },
  successButton: { width: "100%", alignSelf: "stretch" },
  successIcon: {
    width: 64,
    height: 64,
    alignSelf: "center",
    borderRadius: 99,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  successBody: {
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  successTitle: { color: colors.ink, ...typography.sectionTitle },
  successDescription: {
    color: colors.inkMuted,
    ...typography.description,
    textAlign: "center",
  },
});
