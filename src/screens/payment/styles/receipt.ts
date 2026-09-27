import { StyleSheet } from "react-native";
import { colors, elevation, radius, type, typography } from "../../../theme";

export const receiptStyles = StyleSheet.create({
  receiptStage: {
    minHeight: 620,
    padding: 13,
    borderRadius: radius.md,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
  },
  receiptStageBounded: { flex: 1, minHeight: 0 },
  receiptStageHeader: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 9,
  },
  receiptScroll: { flex: 1, minHeight: 0, width: "100%" },
  receiptScrollContent: { flexGrow: 1, alignItems: "center", paddingBottom: 1 },
  receiptStageTitle: {
    color: colors.inkMuted,
    fontSize: type.micro,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  readyPrint: { color: colors.inkMuted, fontSize: type.micro, fontWeight: "600" },
  finalButton: {
    minHeight: 64,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    ...elevation.button,
  },
  finalButtonLeft: { alignItems: "center", gap: 10 },
  finalIcon: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  finalButtonText: { color: colors.white, ...typography.button },
  finalButtonHint: { color: colors.primarySoft, ...typography.helper },
});
