import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { Image } from "react-native";
import { AppIcon, AppPressable as Pressable } from "../../../components/ui";
import { productFormStyles } from "../../../components/products/styles/form";
import { colors } from "../../../theme";
import { ProductEditorModel } from "../types";
import { styles } from "../styles";

type Props = {
  form: ProductEditorModel["form"];
  error: string;
  isMobile: boolean;
  isTablet: boolean;
  isPickingImage: boolean;
  onPick: () => Promise<void>;
  onClear: () => void;
};

export function PhotoField({ form, error, isPickingImage, isMobile, isTablet, onPick, onClear }: Props) {
  return (
    <VStack>
      <Text style={[productFormStyles.fieldLabel, isMobile && productFormStyles.fieldLabelMobile, isTablet && productFormStyles.fieldLabelTablet]}>
        Foto Produk / Thumbnail Kasir
      </Text>
      <HStack style={styles.photoCard}>
        {form.image ? (
          <Image source={form.image} style={styles.photoImage} />
        ) : (
          <VStack style={styles.photoPlaceholder}>
            <AppIcon name="image-outline" size={23} color={colors.inkSubtle} />
            <Text style={[styles.photoPlaceholderText, (isMobile || isTablet) && styles.photoPlaceholderTextAdaptive]}>Belum dipilih</Text>
          </VStack>
        )}
        <VStack style={{ flex: 1, gap: 7 }}>
          <HStack style={{ alignItems: "center", gap: 7 }}>
            <Text style={styles.photoTitle}>Foto Produk &amp; Thumbnail POS</Text>
            {form.image ? <Text style={styles.savedBadge}>Tersimpan</Text> : null}
          </HStack>
          <Text style={[productFormStyles.description, isMobile && productFormStyles.descriptionMobile, isTablet && productFormStyles.descriptionTablet]}>
            Format PNG, JPG, atau WEBP rasio 1:1
          </Text>
          <HStack style={{ gap: 7 }}>
            <Pressable
              onPress={onPick}
              disabled={isPickingImage}
              style={[
                styles.uploadButton,
                isPickingImage && styles.photoActionDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Pilih gambar dari perangkat"
              accessibilityState={{ disabled: isPickingImage }}
            >
              <AppIcon name="cloud-upload-outline" size={17} color={colors.white} />
              <Text style={styles.uploadText}>
                {isPickingImage ? "Memilih gambar..." : "Pilih File Gambar"}
              </Text>
            </Pressable>
            <Pressable
              onPress={onClear}
              disabled={!form.image}
              style={[
                styles.deletePhoto,
                form.image ? styles.deletePhotoActive : styles.photoActionDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Hapus foto produk"
              accessibilityState={{ disabled: !form.image }}
            >
              <AppIcon
                name="delete-outline"
                size={16}
                color={form.image ? colors.danger : colors.inkMuted}
              />
              <Text
                style={[
                  styles.deletePhotoText,
                  form.image ? styles.deletePhotoTextActive : undefined,
                ]}
              >
                Hapus
              </Text>
            </Pressable>
          </HStack>
        </VStack>
      </HStack>
      {error ? <Text style={styles.photoError}>{error}</Text> : null}
    </VStack>
  );
}
