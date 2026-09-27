import { StyleSheet } from "react-native";
import { colors, spacing, type, typography } from "../../../theme";

export const productFormStyles = StyleSheet.create({
  formGap: { gap: spacing.md },
  fieldLabel: {
    color: colors.ink,
    ...typography.label,
    marginBottom: spacing.sm,
  },
  fieldLabelMobile: { fontSize: type.label },
  fieldLabelTablet: { fontSize: type.label },
  required: { color: colors.danger },
  description: { color: colors.inkMuted, ...typography.description },
  descriptionMobile: { lineHeight: 21 },
  descriptionTablet: { lineHeight: 21 },
  publishTextMobile: { fontSize: type.button },
  publishTextTablet: { fontSize: type.button },
  errorText: { color: colors.danger, ...typography.helper, fontWeight: "600" },
  publishText: { color: colors.white, ...typography.button },
});
