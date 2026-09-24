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
  icon,
  setIcon,
  error,
  onClose,
  onSave,
}: {
  visible: boolean;
  name: string;
  setName: (value: string) => void;
  icon: string;
  setIcon: (value: string) => void;
  error: string;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal isOpen={visible} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={styles.categoryModal}>
        <ModalHeader>
          <HStack style={styles.modalCategoryHeader}>
            <HStack style={styles.modalCategoryIcon}>
              <AppIcon name="shape-outline" size={22} color={colors.primary} />
            </HStack>
            <VStack style={styles.modalCategoryCopy}>
              <Text style={styles.modalTitle}>Tambah Kategori Produk</Text>
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
                placeholder="Contoh: Signature Mocktail"
                accessibilityLabel="Nama kategori"
              />
              {error ? (
                <Text style={productFormStyles.errorText}>{error}</Text>
              ) : null}
            </VStack>
            <VStack>
              <Text style={productFormStyles.fieldLabel}>Ikon / Simbol Menu</Text>
              <AppInput
                value={icon}
                onChangeText={setIcon}
                placeholder="local_bar"
                accessibilityLabel="Ikon kategori"
                trailing={
                  <AppIcon
                    name="glass-cocktail"
                    size={19}
                    color={colors.primary}
                  />
                }
              />
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <VStack style={styles.categoryModalActions}>
            <Button onPress={onSave} style={styles.categorySaveButton}>
              <AppIcon name="check" size={17} color={colors.white} />
              <ButtonText style={productFormStyles.publishText}>
                Simpan Kategori
              </ButtonText>
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
