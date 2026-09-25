import { HStack, Text, VStack } from "@gluestack-ui/themed";
import {
  ActionPill,
  AppIcon,
  AppPressable as Pressable,
  type IconName,
} from "../../../components/ui";
import { productFormStyles } from "../../../components/products/styles/form";
import { colors } from "../../../theme";
import { Category } from "../../../types/pos";
import { styles } from "../styles";

type Props = {
  categories: Category[];
  selectedId: string;
  isMobile: boolean;
  isTablet: boolean;
  onSelect: (categoryId: string) => void;
  onAdd: () => void;
};

export function CategoryField({ categories, selectedId, isMobile, isTablet, onSelect, onAdd }: Props) {
  return (
    <VStack style={styles.categoryGroup}>
      <HStack style={styles.labelRow}>
        <Text style={[productFormStyles.fieldLabel, isMobile && productFormStyles.fieldLabelMobile, isTablet && productFormStyles.fieldLabelTablet, styles.categoryLabel]}>
          Kategori Menu Minuman
        </Text>
        <ActionPill
          icon="plus"
          label="Kategori Baru"
          onPress={onAdd}
          accessibilityLabel="Tambah kategori baru"
        />
      </HStack>
      <HStack style={styles.categoryRow}>
        {categories
          .filter((category) => category.id !== "all")
          .map((category) => (
            <Pressable
              key={category.id}
              onPress={() => onSelect(category.id)}
              style={[
                styles.formCategory,
                selectedId === category.id && styles.formCategoryActive,
              ]}
            >
              <AppIcon
                name={getCategoryIcon(category.id)}
                size={17}
                color={selectedId === category.id ? colors.white : colors.inkMuted}
              />
              <Text
                style={[
                  styles.formCategoryText,
                  isMobile && styles.formCategoryTextMobile,
                  isTablet && styles.formCategoryTextTablet,
                  selectedId === category.id && styles.formCategoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
      </HStack>
    </VStack>
  );
}

function getCategoryIcon(categoryId: string): IconName {
  if (categoryId === "boba") return "chart-bubble";
  if (categoryId === "coffee") return "coffee";
  if (categoryId === "tea") return "tea-outline";
  return "ice-cream";
}
