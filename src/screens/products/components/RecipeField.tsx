import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { StyleSheet } from "react-native";
import { DropdownSelect } from "../../../components/dropdown-select";
import { ActionPill } from "../../../components/ui";
import { productFormStyles } from "../../../components/products/styles/form";
import { colors, spacing, typography } from "../../../theme";
import type { Recipe, StockItem } from "../../../types/stock";
import { getAvailablePortions } from "../../../utils/standardRecipe";

export function RecipeField({
  recipes,
  items,
  selectedId,
  availableStock,
  onSelect,
  onManage,
}: {
  recipes: Recipe[];
  items: StockItem[];
  selectedId: string;
  availableStock: number;
  onSelect: (id: string) => void;
  onManage: () => void;
}) {
  const menuRecipes = recipes.filter((recipe) => recipe.kind === "menu");
  const selected = menuRecipes.find((recipe) => recipe.id === selectedId);
  const options = menuRecipes.map((recipe) => {
    const available = getAvailablePortions(items, recipe, recipes);
    return {
      value: recipe.id,
      label: recipe.name,
      detail: `${available} porsi`,
      accessibilityLabel: `Gunakan ${recipe.name}, ${available} porsi tersedia`,
    };
  });

  return (
    <VStack style={styles.field}>
      <HStack style={styles.heading}>
        <VStack style={styles.headingTitle}>
          <Text style={[productFormStyles.fieldLabel, styles.headingLabel]}>
            Bahan
          </Text>
        </VStack>
        <ActionPill icon="pencil-outline" label="Kelola" onPress={onManage} />
      </HStack>
      <DropdownSelect
        options={options}
        value={selectedId}
        onChange={onSelect}
        placeholder="Pilih bahan"
        accessibilityLabel="Pilih bahan menu"
      />
      {selected ? (
        <Text style={styles.stockText}>{availableStock} porsi tersedia</Text>
      ) : null}
    </VStack>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  heading: { alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  headingTitle: { minHeight: 44, justifyContent: "center" },
  headingLabel: { marginBottom: 0, includeFontPadding: false },
  stockText: { color: colors.inkMuted, ...typography.helper },
});
