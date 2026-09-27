import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { ActionPill, AppIcon, AppPressable } from "../../../components/ui";
import { productFormStyles } from "../../../components/products/styles/form";
import { colors, radius, spacing } from "../../../theme";
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
  const [open, setOpen] = useState(false);
  const menuRecipes = recipes.filter((recipe) => recipe.kind === "menu");
  const selected = menuRecipes.find((recipe) => recipe.id === selectedId);

  return (
    <VStack style={styles.field}>
      <HStack style={styles.heading}>
        <Text style={productFormStyles.fieldLabel}>Bahan</Text>
        <ActionPill icon="pencil-outline" label="Kelola" onPress={() => {
          setOpen(false);
          onManage();
        }} />
      </HStack>
      <AppPressable
        onPress={() => setOpen((current) => !current)}
        style={styles.select}
        accessibilityRole="button"
        accessibilityLabel={`Pilih bahan menu, saat ini ${selected?.name ?? "belum dipilih"}`}
        accessibilityState={{ expanded: open }}
      >
        <VStack style={styles.selectCopy}>
          <Text style={styles.selectedName}>{selected?.name ?? "Pilih bahan"}</Text>
          {selected ? <Text style={styles.stockText}>{availableStock} porsi tersedia</Text> : null}
        </VStack>
        <AppIcon name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.inkMuted} />
      </AppPressable>
      {open ? (
        <VStack style={styles.options}>
          {menuRecipes.map((recipe) => (
            <AppPressable
              key={recipe.id}
              onPress={() => {
                onSelect(recipe.id);
                setOpen(false);
              }}
              style={[styles.option, recipe.id === selectedId && styles.optionSelected]}
              accessibilityRole="button"
              accessibilityLabel={`Gunakan ${recipe.name}, ${getAvailablePortions(items, recipe, recipes)} porsi tersedia`}
            >
              <Text style={styles.optionText} numberOfLines={1}>{recipe.name}</Text>
              <Text style={styles.optionStock}>{getAvailablePortions(items, recipe, recipes)} porsi</Text>
              {recipe.id === selectedId ? <AppIcon name="check" size={17} color={colors.primary} /> : null}
            </AppPressable>
          ))}
        </VStack>
      ) : null}
    </VStack>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  heading: { alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  select: {
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceContainerLow,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  selectCopy: { flex: 1, minWidth: 0, gap: 2 },
  selectedName: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  stockText: { color: colors.inkMuted, fontSize: 12 },
  options: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, overflow: "hidden" },
  option: { minHeight: 44, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  optionSelected: { backgroundColor: colors.surfaceTint },
  optionText: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 13, fontWeight: "700" },
  optionStock: { color: colors.inkMuted, fontSize: 12, fontWeight: "700" },
});
