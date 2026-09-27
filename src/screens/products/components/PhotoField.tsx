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
        Foto Menu
      </Text>
      {form.image ? (
        <HStack style={styles.photoRow}>
          <Image
            source={form.image}
            style={styles.photoImage}
            resizeMode="cover"
            accessibilityLabel={`Foto ${form.name || "menu"}`}
          />
          <Pressable
            onPress={onPick}
            disabled={isPickingImage}
            style={styles.photoAction}
            accessibilityRole="button"
            accessibilityLabel="Ganti foto menu"
            accessibilityState={{ disabled: isPickingImage }}
          >
            <AppIcon name="image-edit-outline" size={17} color={colors.primary} />
            <Text style={styles.photoActionText}>{isPickingImage ? "Memilih..." : "Ganti foto"}</Text>
          </Pressable>
          <Pressable
            onPress={onClear}
            style={styles.photoRemoveAction}
            accessibilityRole="button"
            accessibilityLabel="Hapus foto menu"
          >
            <AppIcon name="delete-outline" size={17} color={colors.danger} />
            <Text style={styles.photoRemoveText}>Hapus</Text>
          </Pressable>
        </HStack>
      ) : (
        <Pressable
          onPress={onPick}
          disabled={isPickingImage}
          style={[styles.photoPickEmpty, isPickingImage && styles.photoActionDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Pilih foto menu dari perangkat"
          accessibilityState={{ disabled: isPickingImage }}
        >
          <AppIcon name="image-plus" size={18} color={colors.primary} />
          <Text style={styles.photoActionText}>{isPickingImage ? "Memilih..." : "Pilih foto"}</Text>
        </Pressable>
      )}
      {error ? <Text style={styles.photoError}>{error}</Text> : null}
    </VStack>
  );
}
