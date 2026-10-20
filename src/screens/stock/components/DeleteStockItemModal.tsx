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
import {
  AppIcon,
  AppModalCloseButton,
  ModalFormActions,
} from "../../../components/ui";
import { useAppToast } from "../../../components/toast/useAppToast";
import { useFormSubmit } from "../../../hooks/useFormSubmit";
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
  stockValue: {
    color: colors.ink,
    ...typography.label,
    fontVariant: ["tabular-nums"],
  },
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
  const toast = useAppToast();
  const form = useFormSubmit((error) =>
    toast.error(
      "Bahan gagal dihapus",
      error instanceof Error ? error.message : "Coba lagi.",
    ),
  );
  const canDelete = item.stock === 0;
  const close = () => {
    if (!form.busy) onClose();
  };

  const handleDelete = async () => {
    if (canDelete) await form.submit(onDelete);
  };

  return (
    <Modal isOpen onClose={close} size="md">
      <ModalBackdrop />
      <ModalContent
        style={[
          styles.modal,
          deleteStyles.modal,
          { maxHeight: Math.max(360, height - 28) },
        ]}
      >
        <ModalHeader style={[styles.modalHeader, deleteStyles.header]}>
          <HStack style={[styles.modalIcon, deleteStyles.icon]}>
            <AppIcon name="delete-outline" size={18} color={colors.danger} />
          </HStack>
          <VStack style={styles.modalHeading}>
            <Text style={styles.modalTitle}>Hapus Bahan</Text>
          </VStack>
          <AppModalCloseButton
            onPress={close}
            accessibilityLabel="Tutup konfirmasi"
          />
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
              <Text
                style={[
                  deleteStyles.stockStatus,
                  canDelete
                    ? deleteStyles.stockStatusReady
                    : deleteStyles.stockStatusBlocked,
                ]}
              >
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
        <ModalFooter style={styles.modalFooter}>
          <ModalFormActions
            primaryLabel="Hapus bahan"
            onPrimary={() => void handleDelete()}
            primaryDisabled={!canDelete}
            primaryBusy={form.busy}
            primaryBusyLabel="Menghapus..."
            primaryTone="danger"
            primaryIcon="delete-outline"
            onSecondary={close}
            secondaryDisabled={form.busy}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
