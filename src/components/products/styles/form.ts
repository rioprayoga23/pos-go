import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../theme";

export const productFormStyles = StyleSheet.create({
  formGap: { gap: spacing.lg },
  fieldLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 7,
  },
  fieldLabelMobile: { fontSize: 12 },
  fieldLabelTablet: { fontSize: 13 },
  required: { color: colors.danger },
  description: { color: colors.inkMuted, fontSize: 12, lineHeight: 15 },
  descriptionMobile: { fontSize: 12, lineHeight: 16 },
  descriptionTablet: { fontSize: 12, lineHeight: 17 },
  publishTextMobile: { fontSize: 12 },
  publishTextTablet: { fontSize: 13 },
  errorText: { color: colors.danger, fontSize: 12, fontWeight: "800" },
  publishText: { color: colors.white, fontSize: 12, fontWeight: "900" },
});
