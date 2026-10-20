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
import { useWindowDimensions } from "react-native";
import {
  AppIcon,
  AppInput,
  AppModalCloseButton,
  FieldLabel,
  ModalFormActions,
} from "../../ui";
import { colors } from "../../../theme";
import { productFormStyles } from "../styles/form";
import { styles } from "../styles/modals";

export function CategoryModal({
  visible,
  name,
  setName,
  error,
  isSaving,
  onClose,
  onSave,
}: {
  visible: boolean;
  name: string;
  setName: (value: string) => void;
  error: string;
  isSaving?: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const { width } = useWindowDimensions();
  const isCompact = width < 400;

  return (
    <Modal isOpen={visible} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={styles.categoryModal}>
        <ModalHeader>
          <HStack
            style={[
              styles.modalCategoryHeader,
              isCompact && styles.modalCategoryHeaderCompact,
            ]}
          >
            <HStack
              style={[
                styles.modalCategoryIcon,
                isCompact && styles.modalCategoryIconCompact,
              ]}
            >
              <AppIcon name="shape-outline" size={22} color={colors.primary} />
            </HStack>
            <VStack style={styles.modalCategoryCopy}>
              <Text
                style={[
                  styles.modalTitle,
                  isCompact && styles.modalTitleCompact,
                ]}
              >
                Tambah Kategori Produk
              </Text>
              <Text style={productFormStyles.description}>
                Buat kategori baru untuk mengelompokkan menu.
              </Text>
            </VStack>
            <AppModalCloseButton
              onPress={onClose}
              accessibilityLabel="Tutup dialog kategori"
            />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack style={productFormStyles.formGap}>
            <VStack>
              <FieldLabel
                required
                style={[productFormStyles.fieldLabel, { marginBottom: 0 }]}
              >
                Nama Kategori
              </FieldLabel>
              <AppInput
                value={name}
                onChangeText={setName}
                placeholder="Kategori"
                accessibilityLabel="Nama kategori"
              />
              {error ? (
                <Text style={productFormStyles.errorText}>{error}</Text>
              ) : null}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter style={styles.categoryModalActions}>
          <ModalFormActions
            primaryLabel="Simpan Kategori"
            onPrimary={onSave}
            primaryBusy={Boolean(isSaving)}
            primaryBusyLabel="Menyimpan..."
            primaryIcon="check"
            onSecondary={onClose}
            secondaryDisabled={Boolean(isSaving)}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
