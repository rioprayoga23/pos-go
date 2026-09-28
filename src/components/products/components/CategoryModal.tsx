import {
  ButtonText,
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
  AppButton as Button,
  AppIcon,
  AppInput,
  AppModalCloseButton,
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
              <Text style={productFormStyles.fieldLabel}>
                Nama Kategori <Text style={productFormStyles.required}>*</Text>
              </Text>
              <AppInput
                value={name}
                onChangeText={setName}
                placeholder="Contoh: Mocktail"
                accessibilityLabel="Nama kategori"
              />
              {error ? (
                <Text style={productFormStyles.errorText}>{error}</Text>
              ) : null}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <VStack style={styles.categoryModalActions}>
            <Button onPress={onSave} isDisabled={isSaving} style={styles.categorySaveButton}>
              <AppIcon name="check" size={17} color={colors.white} />
              <ButtonText style={productFormStyles.publishText}>
                {isSaving ? "Menyimpan..." : "Simpan Kategori"}
              </ButtonText>
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
