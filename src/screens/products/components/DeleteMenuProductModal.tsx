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
import type { Product } from "../../../types/pos";

const deleteStyles = StyleSheet.create({
  modal: {
    width: "100%",
    maxWidth: 460,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  heading: { flex: 1, minWidth: 0 },
  title: { color: colors.ink, ...typography.sectionTitle },
  body: { padding: spacing.lg },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.dangerSoft,
  },
  content: { gap: spacing.md, paddingVertical: spacing.sm },
  description: { color: colors.inkMuted, ...typography.body },
  product: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    color: colors.ink,
    ...typography.label,
  },
  footer: { width: "100%", paddingTop: spacing.md },
});

export function DeleteMenuProductModal({
  product,
  onClose,
  onDelete,
}: {
  product: Product;
  onClose: () => void;
  onDelete: (product: Product) => Promise<void>;
}) {
  const toast = useAppToast();
  const form = useFormSubmit((error) =>
    toast.error(
      "Menu gagal dihapus",
      error instanceof Error ? error.message : "Coba lagi.",
    ),
  );
  const close = () => {
    if (!form.busy) onClose();
  };

  const confirm = () =>
    form.submit(async () => {
      await onDelete(product);
      onClose();
    });

  return (
    <Modal isOpen onClose={close} size="md">
      <ModalBackdrop />
      <ModalContent style={deleteStyles.modal}>
        <ModalHeader style={deleteStyles.header}>
          <HStack style={deleteStyles.icon}>
            <AppIcon name="delete-outline" size={19} color={colors.danger} />
          </HStack>
          <VStack style={deleteStyles.heading}>
            <Text style={deleteStyles.title}>Hapus Menu</Text>
          </VStack>
          <AppModalCloseButton
            onPress={close}
            accessibilityLabel="Tutup konfirmasi hapus menu"
          />
        </ModalHeader>
        <ModalBody style={deleteStyles.body}>
          <VStack style={deleteStyles.content}>
            <Text style={deleteStyles.description}>
              Menu ini akan dihapus permanen dari katalog.
            </Text>
            <Text style={deleteStyles.product}>{product.name}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter style={deleteStyles.footer}>
          <ModalFormActions
            primaryLabel="Hapus Menu"
            onPrimary={() => void confirm()}
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
