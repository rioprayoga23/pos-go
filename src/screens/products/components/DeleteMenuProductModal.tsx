import { ButtonText, HStack, Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader, Text, VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { AppButton, AppIcon, AppModalCloseButton, AppPressable } from "../../../components/ui";
import { useAppToast } from "../../../components/toast/useAppToast";
import { colors, radius, spacing, typography } from "../../../theme";
import type { Product } from "../../../types/pos";
import { styles } from "../styles";

const deleteStyles = StyleSheet.create({
  modal: { width: "100%", maxWidth: 460, borderRadius: radius.lg, overflow: "hidden" },
  header: { alignItems: "center", gap: spacing.md, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.line },
  heading: { flex: 1, minWidth: 0 },
  title: { color: colors.ink, ...typography.sectionTitle },
  body: { padding: spacing.lg },
  icon: { width: 42, height: 42, borderRadius: radius.md, alignItems: "center", justifyContent: "center", backgroundColor: colors.dangerSoft },
  content: { gap: spacing.md, paddingVertical: spacing.sm },
  description: { color: colors.inkMuted, ...typography.body },
  product: { padding: spacing.md, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.surfaceContainerLow, color: colors.ink, ...typography.label },
  footer: { gap: spacing.sm },
  confirm: { backgroundColor: colors.danger },
  cancel: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.md },
  cancelText: { color: colors.inkMuted, ...typography.button },
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
  const [pending, setPending] = useState(false);
  const toast = useAppToast();
  const close = () => {
    if (!pending) onClose();
  };

  const confirm = async () => {
    if (pending) return;
    setPending(true);
    try {
      await onDelete(product);
      onClose();
    } catch (deleteError) {
      toast.error("Menu gagal dihapus", deleteError instanceof Error ? deleteError.message : "Coba lagi.");
    } finally {
      setPending(false);
    }
  };

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
          <AppModalCloseButton onPress={close} accessibilityLabel="Tutup konfirmasi hapus menu" />
        </ModalHeader>
        <ModalBody style={deleteStyles.body}>
          <VStack style={deleteStyles.content}>
            <Text style={deleteStyles.description}>Menu ini akan dihapus permanen dari katalog.</Text>
            <Text style={deleteStyles.product}>{product.name}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter style={deleteStyles.footer}>
          <AppPressable onPress={close} disabled={pending} style={deleteStyles.cancel} accessibilityRole="button">
            <Text style={deleteStyles.cancelText}>Batal</Text>
          </AppPressable>
          <AppButton onPress={() => { void confirm(); }} isDisabled={pending} style={[styles.formPublishButton, deleteStyles.confirm]}>
            <AppIcon name="delete-outline" size={17} color={colors.white} />
            <ButtonText style={typography.button}>{pending ? "Menghapus..." : "Hapus Menu"}</ButtonText>
          </AppButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
