import { useState, type Dispatch, type SetStateAction } from "react";
import { View } from "react-native";
import { Text } from "@gluestack-ui/themed";
import Sortable from "react-native-sortables";
import {
  AppIcon,
  AppPressable,
  ActionText,
  FieldLabel,
} from "../../../components/ui";
import { ActionButton, NumberField, ui } from "../../../components/management";
import { DropdownSelect } from "../../../components/dropdown-select";
import { colors, spacing } from "../../../theme";
import { formatPreciseCurrency, formatQuantity } from "../../../utils/format";
import type { StockItem } from "../../../types/stock";
import type { MenuEditorDraft, summarizeDraft } from "../editorModel";
import {
  editorStyles as styles,
  menuEditorMaxWidth,
  ingredientQuantityWidth,
  ingredientCostWidth,
  ingredientActionWidth,
} from "../editorStyles";

function IngredientReorderHandle({ name }: { name: string }) {
  return (
    <Sortable.Handle style={styles.ingredientReorderHandle}>
      <View
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Urutkan bahan ${name}`}
        accessibilityHint="Geser ke atas atau bawah untuk mengubah urutan bahan."
      >
        <AppIcon name="drag-vertical" size={19} color={colors.inkMuted} />
      </View>
    </Sortable.Handle>
  );
}

export function MenuIngredientsField({
  ingredients,
  items,
  lines,
  viewportWidth,
  errors,
  onChange,
  onManageStock,
}: {
  ingredients: MenuEditorDraft["ingredients"];
  items: StockItem[];
  lines: ReturnType<typeof summarizeDraft>["lines"];
  viewportWidth: number;
  errors?: Record<string, string>;
  onChange: Dispatch<SetStateAction<MenuEditorDraft["ingredients"]>>;
  onManageStock: () => void;
}) {
  const compact = viewportWidth < 768;
  const initialModalWidth =
    viewportWidth < 600
      ? viewportWidth
      : Math.min(menuEditorMaxWidth, viewportWidth - spacing.xl * 2);
  const [ingredientListWidth, setIngredientListWidth] = useState(
    Math.max(0, initialModalWidth - spacing.lg * 2),
  );
  function updateIngredient(
    index: number,
    values: Partial<MenuEditorDraft["ingredients"][number]>,
  ) {
    onChange((current) =>
      current.map((part, position) =>
        position === index ? { ...part, ...values } : part,
      ),
    );
  }
  return (
    <>
      {!items.length ? (
        <View style={styles.noIngredients}>
          <AppIcon
            name="package-variant-closed"
            size={20}
            color={colors.inkSubtle}
          />
          <Text style={styles.emptyLabel}>Belum ada bahan stok</Text>
          <ActionText
            icon="arrow-right"
            label="Tambah bahan"
            onPress={() => onManageStock()}
          />
        </View>
      ) : null}
      {items.length > 0 && ingredients.length === 0 ? (
        <View style={styles.recipeEmpty}>
          <AppIcon name="beaker-outline" size={20} color={colors.inkSubtle} />
          <Text style={styles.emptyLabel}>Belum ada bahan menu</Text>
        </View>
      ) : null}
      {!compact && ingredients.length ? (
        <View style={styles.ingredientColumns}>
          <View style={styles.ingredientHandleSpacer} />
          <FieldLabel required style={[ui.label, { flex: 1, marginBottom: 0 }]}>
            Bahan
          </FieldLabel>
          <FieldLabel
            required
            style={[
              ui.label,
              { width: ingredientQuantityWidth, marginBottom: 0 },
            ]}
          >
            Takaran
          </FieldLabel>
          <Text
            style={[
              ui.label,
              { width: ingredientCostWidth, textAlign: "right" },
            ]}
          >
            Biaya / cup
          </Text>
          <View style={{ width: ingredientActionWidth }} />
        </View>
      ) : null}
      {ingredients.length > 0 ? (
        <View
          style={styles.ingredientSortableFrame}
          onLayout={({ nativeEvent }) => {
            const nextWidth = nativeEvent.layout.width;
            if (nextWidth <= 0) return;
            setIngredientListWidth((currentWidth) =>
              currentWidth === nextWidth ? currentWidth : nextWidth,
            );
          }}
        >
          <Sortable.Flex
            customHandle
            flexDirection="column"
            flexWrap="nowrap"
            width={ingredientListWidth || "fill"}
            rowGap={spacing.sm}
            itemsLayoutTransitionMode="reorder"
            dragActivationDelay={80}
            activationAnimationDuration={160}
            dropAnimationDuration={180}
            activeItemScale={1.015}
            activeItemShadowOpacity={0.14}
            inactiveItemOpacity={1}
            reorderTriggerOrigin="touch"
            onDragEnd={({ order }) => onChange(order)}
          >
            {ingredients.map((part, index) => {
              const line = lines[index];
              const options = items
                .filter(
                  (item) =>
                    item.id === part.itemId ||
                    !ingredients.some((used) => used.itemId === item.id),
                )
                .map((item) => ({
                  value: item.id,
                  label: item.name,
                  detail: `${formatQuantity(item.stock)} ${item.unit}`,
                }));
              const ingredientField = (
                <View style={styles.ingredientField}>
                  {compact ? (
                    <FieldLabel
                      required
                      style={[ui.label, { marginBottom: spacing.xs }]}
                    >
                      Bahan
                    </FieldLabel>
                  ) : null}
                  <DropdownSelect
                    value={part.itemId}
                    onChange={(value) =>
                      updateIngredient(index, { itemId: value })
                    }
                    options={options}
                    placeholder="Pilih bahan"
                    accessibilityLabel={`Bahan ${index + 1}`}
                  />
                  {line.item ? (
                    <Text style={styles.modalCost}>
                      {line.item.avgPrice > 0
                        ? `${formatPreciseCurrency(line.item.avgPrice)} / ${line.item.unit}`
                        : "Harga modal belum tercatat"}
                    </Text>
                  ) : null}
                </View>
              );
              const quantityField = (
                <View
                  style={[
                    styles.quantityField,
                    compact && styles.quantityFieldCompact,
                  ]}
                >
                  {compact ? (
                    <FieldLabel
                      required
                      style={[ui.label, { marginBottom: spacing.xs }]}
                    >
                      Takaran
                    </FieldLabel>
                  ) : null}
                  <NumberField
                    value={part.quantity}
                    onChange={(value) =>
                      updateIngredient(index, { quantity: value })
                    }
                    unit={line.item?.unit}
                    label={`Takaran ${line.item?.name ?? `bahan ${index + 1}`}`}
                  />
                </View>
              );
              const costField = (
                <View style={styles.ingredientCost}>
                  <Text style={[ui.label, { textAlign: "right" }]}>
                    {line.cost === null
                      ? "—"
                      : formatPreciseCurrency(line.cost)}
                  </Text>
                  {compact ? (
                    <Text style={[styles.modalCost, { textAlign: "right" }]}>
                      biaya / cup
                    </Text>
                  ) : null}
                </View>
              );
              const removeAction = (
                <AppPressable
                  onPress={() =>
                    onChange((current) =>
                      current.filter((_, position) => index !== position),
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus bahan ${line.item?.name ?? index + 1}`}
                  hitSlop={2}
                  style={styles.removeButton}
                >
                  <AppIcon
                    name="delete-outline"
                    size={18}
                    color={colors.danger}
                  />
                </AppPressable>
              );
              // Sortable's intrinsic cell needs a numeric row width before it can measure the columns.
              return (
                <View
                  key={part.itemId || `new-${index}`}
                  style={[styles.ingredient, { width: ingredientListWidth }]}
                >
                  <View
                    style={[
                      styles.ingredientColumns,
                      compact && styles.ingredientColumnsCompact,
                    ]}
                  >
                    <IngredientReorderHandle
                      name={line.item?.name ?? `bahan ${index + 1}`}
                    />
                    {compact ? (
                      <View style={styles.ingredientCompactContent}>
                        {ingredientField}
                        <View style={styles.quantityRow}>
                          {quantityField}
                          {costField}
                          {removeAction}
                        </View>
                      </View>
                    ) : (
                      <>
                        {ingredientField}
                        {quantityField}
                        {costField}
                        {removeAction}
                      </>
                    )}
                  </View>
                  {errors && errors[`ingredient.${index}`] ? (
                    <Text style={ui.error} accessibilityRole="alert">
                      {errors[`ingredient.${index}`]}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </Sortable.Flex>
        </View>
      ) : null}
      {errors && errors.ingredients ? (
        <Text style={ui.error}>{errors.ingredients}</Text>
      ) : null}
      <View style={{ alignItems: "flex-start" }}>
        <ActionButton
          label="Tambah Bahan"
          icon="plus"
          tone="quiet"
          disabled={
            !items.length ||
            ingredients.some((part) => !part.itemId) ||
            ingredients.length >= 100 ||
            ingredients.length >= items.length
          }
          onPress={() =>
            onChange((current) => [...current, { itemId: "", quantity: "" }])
          }
        />
      </View>
    </>
  );
}
