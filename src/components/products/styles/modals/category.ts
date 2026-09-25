import { StyleSheet } from "react-native";
import { colors, elevation, radius, spacing } from "../../../../theme";

export const categoryModalStyles = StyleSheet.create({
  categoryModal: {
    width: 480,
    maxWidth: "92%",
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  modalCategoryHeader: {
    width: "100%",
    minWidth: 0,
    alignItems: "center",
    gap: spacing.md,
  },
  modalCategoryHeaderCompact: { gap: spacing.sm },
  modalCategoryCopy: { flex: 1, minWidth: 0, gap: 2 },
  modalCategoryIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTint,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCategoryIconCompact: { width: 32, height: 32 },
  modalTitle: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  modalTitleCompact: { fontSize: 16, lineHeight: 20 },
  categoryModalActions: {
    width: "100%",
    alignItems: "stretch",
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  categorySaveButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    ...elevation.button,
  },
});
