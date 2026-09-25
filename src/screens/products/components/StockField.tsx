import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { AppIcon, AppInput, AppPressable as Pressable, Panel } from "../../../components/ui";
import { productFormStyles } from "../../../components/products/styles/form";
import { colors, spacing } from "../../../theme";
import { ProductEditorModel } from "../types";
import { styles } from "../styles";

type Props = {
  form: ProductEditorModel["form"];
  setForm: ProductEditorModel["setForm"];
  isMobile: boolean;
  isTablet: boolean;
};

export function StockField({ form, setForm, isMobile, isTablet }: Props) {
  return (
    <Panel style={styles.stockPanel} padding={spacing.md}>
      <HStack style={styles.stockRow}>
        <VStack style={{ flex: 1, gap: 3 }}>
          <Text style={styles.stockLabel}>Stok Saat Ini</Text>
          <Text style={[productFormStyles.description, isMobile && productFormStyles.descriptionMobile, isTablet && productFormStyles.descriptionTablet]}>
            Atur ketersediaan porsi di kasir.
          </Text>
        </VStack>
        <HStack style={styles.stockControl}>
          <Pressable
            onPress={() =>
              setForm((current) => ({
                ...current,
                stock: String(Math.max(0, Number(current.stock || 0) - 1)),
              }))
            }
            style={styles.stockButton}
            accessibilityRole="button"
            accessibilityLabel="Kurangi stok"
          >
            <AppIcon name="minus" size={16} color={colors.inkMuted} />
          </Pressable>
          <AppInput
            value={form.stock}
            onChangeText={(stock) =>
              setForm((current) => ({
                ...current,
                stock: stock.replace(/\D/g, ""),
              }))
            }
            placeholder=""
            keyboardType="number-pad"
            accessibilityLabel="Jumlah stok saat ini"
            style={styles.stockInput}
            inputStyle={styles.stockInputText}
          />
          <Pressable
            onPress={() =>
              setForm((current) => ({
                ...current,
                stock: String(Number(current.stock || 0) + 1),
              }))
            }
            style={[styles.stockButton, { backgroundColor: colors.surfaceTint }]}
            accessibilityRole="button"
            accessibilityLabel="Tambah stok"
          >
            <AppIcon name="plus" size={16} color={colors.primary} />
          </Pressable>
          <Text style={[styles.stockUnit, isTablet && styles.stockUnitTablet]}>Porsi</Text>
        </HStack>
      </HStack>
    </Panel>
  );
}
