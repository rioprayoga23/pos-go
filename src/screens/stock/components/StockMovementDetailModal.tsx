import {
  HStack,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { StyleSheet } from "react-native";
import { AppIcon, AppModalCloseButton, AppPressable } from "../../../components/ui";
import { colors, radius, spacing, type, typography } from "../../../theme";
import type { StockMovement } from "../../../types/stock";
import { formatCurrency, formatThousands } from "../../../utils/format";
import { styles } from "../styles";

const detailStyles = StyleSheet.create({
  modal: { maxWidth: 480 },
  header: { padding: spacing.md, paddingBottom: spacing.md },
  icon: { width: 34, height: 34 },
  itemName: { color: colors.inkMuted, ...typography.helper },
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  summary: {
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTint,
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  summaryCopy: { flex: 1, minWidth: 0, gap: 2 },
  summaryLabel: { color: colors.inkMuted, fontSize: type.caption, lineHeight: 18 },
  summaryText: { color: colors.ink, fontSize: type.caption, lineHeight: 18, fontWeight: "600" },
  summaryValue: { color: colors.ink, ...typography.input, fontWeight: "600", textAlign: "right" },
  rows: { paddingHorizontal: spacing.xs },
  row: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowLast: { borderBottomWidth: 0 },
  label: { color: colors.inkMuted, fontSize: type.caption, lineHeight: 18 },
  value: { maxWidth: "65%", color: colors.ink, fontSize: type.caption, lineHeight: 18, fontWeight: "600", textAlign: "right" },
  note: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    gap: spacing.xs,
  },
  noteLabel: { color: colors.inkMuted, fontSize: type.caption, lineHeight: 18, fontWeight: "600" },
  noteText: { color: colors.ink, fontSize: type.caption, lineHeight: 18 },
  footer: { padding: spacing.md },
  closeButton: {
    width: "100%",
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: colors.white, ...typography.button },
});

function movementTypeLabel(type: StockMovement["type"]) {
  if (type === "purchase") return "Pembelian stok";
  if (type === "sale") return "Penjualan";
  return "Koreksi stok";
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <HStack style={[detailStyles.row, last && detailStyles.rowLast]}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </HStack>
  );
}

export function StockMovementDetailModal({
  movement,
  timeLabel,
  height,
  onClose,
}: {
  movement: StockMovement;
  timeLabel: string;
  height: number;
  onClose: () => void;
}) {
  const quantity = `${movement.quantity > 0 ? "+" : movement.quantity < 0 ? "−" : ""}${formatThousands(Math.abs(movement.quantity))} ${movement.unit}`;
  const note = movement.note.trim();
  const showNote = note && !(movement.type === "purchase" && note === "Pembelian stok");

  return (
    <Modal isOpen onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent
        style={[
          styles.modal,
          detailStyles.modal,
          { maxHeight: Math.max(300, height - spacing.xxl) },
        ]}
      >
        <ModalHeader style={[styles.modalHeader, detailStyles.header]}>
          <HStack style={[styles.modalIcon, detailStyles.icon]}>
            <AppIcon name="clipboard-text-outline" size={17} color={colors.primary} />
          </HStack>
          <VStack style={styles.modalHeading}>
            <Text style={styles.modalTitle}>Detail Mutasi</Text>
            <Text style={detailStyles.itemName} numberOfLines={1}>{movement.item}</Text>
          </VStack>
          <AppModalCloseButton onPress={onClose} accessibilityLabel="Tutup detail mutasi" />
        </ModalHeader>
        <ModalBody style={styles.modalBody}>
          <VStack style={detailStyles.content}>
            <HStack style={detailStyles.summary}>
              <VStack style={detailStyles.summaryCopy}>
                <Text style={detailStyles.summaryLabel}>Jenis mutasi</Text>
                <Text style={detailStyles.summaryText}>{movementTypeLabel(movement.type)}</Text>
              </VStack>
              <VStack style={detailStyles.summaryCopy}>
                <Text style={[detailStyles.summaryLabel, { textAlign: "right" }]}>Perubahan stok</Text>
                <Text style={detailStyles.summaryValue}>{quantity}</Text>
              </VStack>
            </HStack>
            <VStack style={detailStyles.rows}>
              <DetailRow label="Waktu" value={timeLabel} />
              {movement.purchase ? (
                <>
                  <DetailRow
                    label="Jumlah pembelian"
                    value={`${formatThousands(movement.purchase.quantity)} ${movement.purchase.unit}`}
                  />
                  <DetailRow
                    label="Total pembelian"
                    value={formatCurrency(movement.purchase.totalCostRupiah)}
                    last={!showNote}
                  />
                </>
              ) : null}
            </VStack>
            {showNote ? (
              <VStack style={detailStyles.note}>
                <Text style={detailStyles.noteLabel}>Catatan</Text>
                <Text style={detailStyles.noteText}>{note}</Text>
              </VStack>
            ) : null}
          </VStack>
        </ModalBody>
        <ModalFooter style={[styles.modalFooter, detailStyles.footer]}>
          <AppPressable
            onPress={onClose}
            style={detailStyles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Tutup detail mutasi"
          >
            <Text style={detailStyles.closeText}>Tutup</Text>
          </AppPressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
