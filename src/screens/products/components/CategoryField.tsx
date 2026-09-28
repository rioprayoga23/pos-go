import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { DropdownSelect } from "../../../components/dropdown-select";
import { ActionText } from "../../../components/ui";
import { productFormStyles } from "../../../components/products/styles/form";
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
  const options = categories
    .filter((category) => category.id !== "all")
    .map((category) => ({
      value: category.id,
      label: category.name,
      accessibilityLabel: `Pilih kategori ${category.name}`,
    }));

  return (
    <VStack style={styles.categoryGroup}>
      <HStack style={styles.labelRow}>
        <Text style={[productFormStyles.fieldLabel, isMobile && productFormStyles.fieldLabelMobile, isTablet && productFormStyles.fieldLabelTablet, styles.categoryLabel]}>
          Kategori Menu Minuman
        </Text>
        <ActionText
          icon="plus"
          label="Kategori Baru"
          onPress={onAdd}
          compact
          accessibilityLabel="Tambah kategori baru"
        />
      </HStack>
      <DropdownSelect
        options={options}
        value={selectedId}
        onChange={onSelect}
        placeholder="Pilih kategori"
        accessibilityLabel="Pilih kategori menu"
      />
    </VStack>
  );
}
