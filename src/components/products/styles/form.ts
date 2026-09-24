import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../theme";

export const productFormStyles = StyleSheet.create({
  formGap: { gap: spacing.lg },
  fieldLabel: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 7,
  },
  required: { color: colors.danger },
  description: { color: colors.inkMuted, fontSize: 10, lineHeight: 15 },
  errorText: { color: colors.danger, fontSize: 11, fontWeight: "800" },
  publishText: { color: colors.white, fontSize: 11, fontWeight: "900" },
});
