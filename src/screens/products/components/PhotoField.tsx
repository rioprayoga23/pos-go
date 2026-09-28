import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { Image, View } from "react-native";
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
  const [failedPhotoUri, setFailedPhotoUri] = useState<string | null>(null);
  const photoUri =
    form.image && typeof form.image === "object" && !Array.isArray(form.image) && "uri" in form.image
      ? form.image.uri
      : undefined;
  const photoUnavailable = photoUri
    ? failedPhotoUri === photoUri
    : failedPhotoUri === "unreadable-local-photo";

  return (
    <VStack>
      <Text style={[productFormStyles.fieldLabel, isMobile && productFormStyles.fieldLabelMobile, isTablet && productFormStyles.fieldLabelTablet]}>
        Foto Menu
      </Text>
      {form.image ? (
        <HStack style={styles.photoRow}>
          {photoUnavailable ? (
            <View style={[styles.photoImage, styles.photoUnavailable]}>
              <AppIcon name="image-outline" size={20} color={colors.inkMuted} />
            </View>
          ) : (
            <Image
              source={form.image}
              style={styles.photoImage}
              resizeMode="cover"
              onError={() => setFailedPhotoUri(photoUri ?? "unreadable-local-photo")}
              accessibilityLabel={`Foto ${form.name || "menu"}`}
            />
          )}
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
      {photoUnavailable || error ? (
        <Text style={styles.photoError}>
          {error || "Foto lama tidak ditemukan di server. Pilih ulang foto, lalu simpan kembali."}
        </Text>
      ) : null}
    </VStack>
  );
}
