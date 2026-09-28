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
import { useState } from "react";
import { StyleSheet } from "react-native";
import { AppIcon, AppModalCloseButton, AppPressable } from "../../../components/ui";
import { useAppToast } from "../../../components/toast/useAppToast";
import { colors, radius, spacing, typography } from "../../../theme";
import type { StockItem } from "../../../types/stock";
import { formatQuantity } from "../../../utils/format";
import { styles } from "../styles";

const deleteStyles = StyleSheet.create({
  modal: { maxWidth: 480 },
  header: { paddingBottom: spacing.lg },
  icon: { backgroundColor: colors.dangerSoft },
  content: { padding: spacing.lg, gap: spacing.md },
  description: { color: colors.inkMuted, ...typography.body },
  stockRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  stockCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
  stockLabel: { color: colors.inkMuted, ...typography.helper },
  stockValue: { color: colors.ink, ...typography.label, fontVariant: ["tabular-nums"] },
  stockStatus: {
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    color: colors.ink,
    ...typography.helper,
    fontWeight: "600",
  },
  stockStatusBlocked: { backgroundColor: colors.warningSoft },
  stockStatusReady: { backgroundColor: colors.successSoft },
  stockHint: { color: colors.inkMuted, ...typography.helper },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  cancelText: { color: colors.ink, ...typography.button },
  deleteButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger,
  },
  deleteButtonDisabled: { backgroundColor: colors.line },
  deleteText: { color: colors.white, ...typography.button },
  deleteTextDisabled: { color: colors.inkSubtle },
});

export function DeleteStockItemModal({
  item,
  height,
  onClose,
  onDelete,
}: {
  item: StockItem;
  height: number;
  onClose: () => void;
  onDelete: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useAppToast();
  const canDelete = item.stock === 0;

  const handleDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onDelete();
    } catch (error) {
      toast.error("Bahan gagal dihapus", error instanceof Error ? error.message : "Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={[styles.modal, deleteStyles.modal, { maxHeight: Math.max(360, height - 28) }]}>
        <ModalHeader style={[styles.modalHeader, deleteStyles.header]}>
          <HStack style={[styles.modalIcon, deleteStyles.icon]}>
            <AppIcon name="delete-outline" size={18} color={colors.danger} />
          </HStack>
          <VStack style={styles.modalHeading}>
            <Text style={styles.modalTitle}>Hapus Bahan</Text>
          </VStack>
          <AppModalCloseButton onPress={onClose} accessibilityLabel="Tutup konfirmasi" />
        </ModalHeader>
        <ModalBody style={styles.modalBody}>
          <VStack style={deleteStyles.content}>
            <Text style={deleteStyles.description}>
              Bahan &quot;{item.name}&quot; akan dihapus dari daftar stok aktif.
            </Text>
            <HStack style={deleteStyles.stockRow}>
              <VStack style={deleteStyles.stockCopy}>
                <Text style={deleteStyles.stockLabel}>Stok saat ini</Text>
                <Text style={deleteStyles.stockValue}>
                  {formatQuantity(item.stock)} {item.unit}
                </Text>
              </VStack>
              <Text style={[
                deleteStyles.stockStatus,
                canDelete ? deleteStyles.stockStatusReady : deleteStyles.stockStatusBlocked,
              ]}>
                {canDelete ? "Siap dihapus" : "Stok harus 0"}
              </Text>
            </HStack>
            {!canDelete ? (
              <Text style={deleteStyles.stockHint}>
                Ubah stok menjadi 0 sebelum menghapus bahan.
              </Text>
            ) : null}
          </VStack>
        </ModalBody>
        <ModalFooter style={[styles.modalFooter, deleteStyles.footer]}>
          <AppPressable
            onPress={onClose}
            style={deleteStyles.cancelButton}
            accessibilityRole="button"
            accessibilityLabel="Batal menghapus bahan"
          >
            <Text style={deleteStyles.cancelText}>Batal</Text>
          </AppPressable>
          <AppPressable
            onPress={handleDelete}
            disabled={isSubmitting || !canDelete}
            style={[
              deleteStyles.deleteButton,
              !canDelete && deleteStyles.deleteButtonDisabled,
              isSubmitting && styles.saveButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Hapus bahan ${item.name}`}
            accessibilityState={{ disabled: isSubmitting || !canDelete }}
          >
            <Text style={[deleteStyles.deleteText, !canDelete && deleteStyles.deleteTextDisabled]}>
              Hapus bahan
            </Text>
          </AppPressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
