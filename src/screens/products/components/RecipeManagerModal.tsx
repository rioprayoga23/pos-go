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
import { useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import {
  AppButton as Button,
  AppIcon,
  AppInput,
  AppModalCloseButton,
  AppPressable,
} from "../../../components/ui";
import { productFormStyles } from "../../../components/products/styles/form";
import {
  colors,
  fieldHeight,
  radius,
  spacing,
  type,
  typography,
} from "../../../theme";
import type { Recipe, RecipeIngredient, RecipeKind, StockItem } from "../../../types/stock";
import type { Product } from "../../../types/pos";
import type { MenuRecipeDraft } from "../api";
import {
  getAvailablePortions,
} from "../../../utils/standardRecipe";
import { decimalOnly, formatDecimalInput, formatQuantity, isValidQuantity } from "../../../utils/format";

type DraftIngredient =
  | { type: "stock"; itemId: string; quantity: string }
  | { type: "base"; recipeId: string; quantity: string };
type ChoiceType = "stock" | "base";

export function RecipeManagerModal({
  onClose,
  onCreate,
  onCreateRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
  recipes,
  inventoryItems,
  products,
  selectedRecipeId,
  onSelectedDeleted,
}: {
  onClose: () => void;
  onCreate: (id: string) => void;
  onCreateRecipe: (draft: MenuRecipeDraft) => Promise<Recipe>;
  onUpdateRecipe: (id: string, draft: Pick<MenuRecipeDraft, "name" | "ingredients">) => Promise<Recipe>;
  onDeleteRecipe: (id: string) => Promise<void>;
  recipes: Recipe[];
  inventoryItems: StockItem[];
  products: Product[];
  selectedRecipeId: string;
  onSelectedDeleted: () => void;
}) {
  const { height, width } = useWindowDimensions();
  const isCompact = width < 420;
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);
  const [kind, setKind] = useState<RecipeKind>("menu");
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<DraftIngredient[]>([]);
  const [choiceType, setChoiceType] = useState<ChoiceType | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const startCreate = (nextKind: RecipeKind) => {
    setEditingId(null);
    setKind(nextKind);
    setConfirmDeleteId(null);
    setName("");
    setIngredients([]);
    setChoiceType(null);
    setError("");
  };

  const startEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setKind(recipe.kind);
    setConfirmDeleteId(null);
    setName(recipe.name);
    setIngredients(recipe.ingredients.map((part) => ({
      ...part,
      quantity: String(part.quantity),
    })));
    setChoiceType(null);
    setError("");
  };

  const save = async () => {
    const normalizedName = name.trim();
    const normalizedIngredients: RecipeIngredient[] = ingredients.map((part) => ({
      ...part,
      quantity: Number(part.quantity),
    }));
    if (!normalizedName) {
      setError(kind === "base" ? "Isi nama bahan dasar." : "Isi nama menu.");
      return;
    }
    if (recipes.some((recipe) => recipe.id !== editingId && recipe.name.trim().toLowerCase() === normalizedName.toLowerCase())) {
      setError("Nama ini sudah dipakai.");
      return;
    }
    if (!normalizedIngredients.length || normalizedIngredients.some((part) =>
      !isValidQuantity(part.quantity) || part.quantity <= 0 ||
      (part.type === "base" && !Number.isSafeInteger(part.quantity)))) {
      setError("Pilih bahan dan isi takaran lebih dari 0.");
      return;
    }
    if (kind === "base" && normalizedIngredients.some((part) => part.type !== "stock")) {
      setError("Bahan dasar hanya dapat memakai bahan dari stok.");
      return;
    }

    const draft = { name: normalizedName, kind, ingredients: normalizedIngredients };
    setIsSaving(true);
    setError("");
    try {
      if (editingId) {
        await onUpdateRecipe(editingId, { name: draft.name, ingredients: draft.ingredients });
        setEditingId(undefined);
        return;
      }
      const created = await onCreateRecipe(draft);
      if (kind === "base") {
        setEditingId(undefined);
        return;
      }
      onCreate(created.id);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Resep gagal disimpan. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    setError("");
    try {
      await onDeleteRecipe(id);
      if (selectedRecipeId === id) onSelectedDeleted();
      setConfirmDeleteId(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Resep gagal dihapus.");
    } finally {
      setDeletingId(null);
    }
  };

  const availableItems = inventoryItems.filter((item) =>
    !ingredients.some((part) => part.type === "stock" && part.itemId === item.id),
  );
  const availableBases = recipes.filter((recipe) => recipe.kind === "base" &&
    !ingredients.some((part) => part.type === "base" && part.recipeId === recipe.id),
  );
  const isEditing = editingId !== undefined;
  const draftRecipe: Recipe = {
    id: editingId ?? "draft",
    name,
    kind,
    ingredients: ingredients.map((part) => ({ ...part, quantity: Number(part.quantity) })),
  };
  const validDraft = ingredients.length > 0 && ingredients.every((part) =>
    isValidQuantity(Number(part.quantity)) && Number(part.quantity) > 0 &&
    (part.type === "stock" || Number.isSafeInteger(Number(part.quantity))));
  const draftStock = validDraft ? getAvailablePortions(inventoryItems, draftRecipe, [...recipes, draftRecipe]) : null;

  const choices = choiceType === "stock"
    ? availableItems.map((item) => ({ id: item.id, name: item.name, meta: `Stok ${formatQuantity(item.stock)} ${item.unit}`, type: "stock" as const }))
    : availableBases.map((recipe) => ({ id: recipe.id, name: recipe.name, meta: `${getAvailablePortions(inventoryItems, recipe, recipes)} porsi dasar tersedia`, type: "base" as const }));

  const addChoice = (type: ChoiceType, id: string) => {
    setIngredients((current) => [
      ...current,
      type === "stock"
        ? { type, itemId: id, quantity: "1" }
        : { type, recipeId: id, quantity: "1" },
    ]);
    setChoiceType(null);
    setError("");
  };

  const baseRecipes = recipes.filter((recipe) => recipe.kind === "base");
  const menuRecipes = recipes.filter((recipe) => recipe.kind === "menu");
  const renderRecipe = (recipe: Recipe) => {
    const productUsage = products.filter((product) => product.recipeId === recipe.id).length;
    const menuUsage = recipes.filter((entry) => entry.kind === "menu" && entry.ingredients.some((part) => part.type === "base" && part.recipeId === recipe.id)).length;
    const usage = recipe.kind === "base" ? menuUsage : productUsage;
    const canDelete = usage === 0;
    const portions = getAvailablePortions(inventoryItems, recipe, recipes);
    return (
      <VStack key={recipe.id} style={styles.recipeRow}>
        <HStack style={styles.recipeMain}>
          <HStack style={styles.recipeIcon}>
            <AppIcon name={recipe.kind === "base" ? "layers-outline" : "cup-outline"} size={19} color={colors.primary} />
          </HStack>
          <VStack style={styles.recipeName}>
            <Text style={styles.rowName} numberOfLines={1}>{recipe.name}</Text>
            <Text style={styles.rowMeta}>{recipe.kind === "base" ? `Dipakai ${usage} menu` : `Dipakai ${usage} produk`}</Text>
          </VStack>
          {!isCompact ? (
            <HStack style={[styles.portionBadge, portions ? styles.portionBadgeReady : styles.portionBadgeEmpty]}>
              <AppIcon name={portions ? "check-circle-outline" : "alert-circle-outline"} size={15} color={portions ? colors.success : colors.warning} />
              <Text style={[styles.portionText, portions ? styles.portionTextReady : styles.portionTextEmpty]}>{portions ? `${portions} porsi` : "Stok habis"}</Text>
            </HStack>
          ) : null}
          {!isCompact ? <EditAction name={recipe.name} onPress={() => startEdit(recipe)} /> : null}
          {!isCompact ? <DeleteAction name={recipe.name} disabled={!canDelete} onPress={() => setConfirmDeleteId(recipe.id)} /> : null}
        </HStack>
        {isCompact ? (
          <HStack style={styles.recipeActions}>
            <HStack style={[styles.portionBadge, portions ? styles.portionBadgeReady : styles.portionBadgeEmpty]}>
              <AppIcon name={portions ? "check-circle-outline" : "alert-circle-outline"} size={15} color={portions ? colors.success : colors.warning} />
              <Text style={[styles.portionText, portions ? styles.portionTextReady : styles.portionTextEmpty]}>{portions ? `${portions} porsi` : "Stok habis"}</Text>
            </HStack>
            <EditAction name={recipe.name} onPress={() => startEdit(recipe)} />
            <DeleteAction name={recipe.name} disabled={!canDelete} onPress={() => setConfirmDeleteId(recipe.id)} />
          </HStack>
        ) : null}
        {confirmDeleteId === recipe.id ? (
          <HStack style={styles.confirmRow}>
            <Text style={styles.confirmText}>{usage ? "Formula ini masih dipakai." : "Hapus formula ini?"}</Text>
            <AppPressable onPress={() => setConfirmDeleteId(null)} style={styles.confirmButton} accessibilityRole="button"><Text style={styles.cancelText}>Batal</Text></AppPressable>
            <AppPressable onPress={() => { void handleDeleteRecipe(recipe.id); }} disabled={!canDelete || deletingId !== null} style={styles.confirmButton} accessibilityRole="button" accessibilityState={{ disabled: !canDelete || deletingId !== null }}>
              <Text style={[styles.deleteText, (!canDelete || deletingId !== null) && styles.disabledText]}>{deletingId === recipe.id ? "Menghapus..." : "Hapus"}</Text>
            </AppPressable>
          </HStack>
        ) : null}
      </VStack>
    );
  };

  return (
    <Modal isOpen onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={[styles.modal, { width: Math.min(width - 24, 560), maxHeight: height - 32 }]}>
        <ModalHeader style={styles.header}>
          <HStack style={styles.headerCopy}>
            <HStack style={styles.titleIcon}>
              <AppIcon name="package-variant-closed" size={20} color={colors.primary} />
            </HStack>
            <Text style={styles.title}>
              {isEditing ? (editingId ? "Edit Bahan" : kind === "base" ? "Bahan Dasar Baru" : "Menu Baru") : "Kelola Bahan"}
            </Text>
          </HStack>
          <AppModalCloseButton onPress={onClose} accessibilityLabel="Tutup kelola bahan" />
        </ModalHeader>

        <ModalBody style={styles.body}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {isEditing ? (
              <VStack style={styles.form}>
                <HStack style={styles.kindBadge}>
                  <AppIcon name={kind === "base" ? "layers-outline" : "cup-outline"} size={15} color={colors.primary} />
                  <Text style={styles.kindText}>{kind === "base" ? "Bahan dasar" : "Menu jual"}</Text>
                </HStack>
                <VStack style={styles.field}>
                  <Text style={[productFormStyles.fieldLabel, styles.fieldLabelFlush]}>{kind === "base" ? "Nama bahan dasar" : "Nama menu"}</Text>
                  <AppInput
                    value={name}
                    onChangeText={(value) => { setName(value); setError(""); }}
                    placeholder={kind === "base" ? "Contoh: Sirup Gula" : "Contoh: Matcha Latte"}
                    accessibilityLabel={kind === "base" ? "Nama bahan dasar" : "Nama menu"}
                  />
                </VStack>

                <VStack style={styles.field}>
                  <HStack style={styles.sectionHeading}>
                    <Text style={[productFormStyles.fieldLabel, styles.fieldLabelFlush]}>Takaran per porsi</Text>
                    {choiceType ? (
                      <AppPressable onPress={() => setChoiceType(null)} style={styles.addButton} accessibilityRole="button" accessibilityLabel="Tutup pilihan bahan">
                        <AppIcon name="close" size={16} color={colors.primary} />
                        <Text style={styles.addIngredientText}>Tutup</Text>
                      </AppPressable>
                    ) : (
                      <AppPressable onPress={() => setChoiceType("stock")} style={styles.addButton} accessibilityRole="button" accessibilityLabel={kind === "base" ? "Tambah bahan dari stok" : "Tambah komponen ke menu"}>
                        <AppIcon name="plus" size={16} color={colors.primary} />
                        <Text style={styles.addIngredientText}>{kind === "base" ? "Tambah bahan" : "Tambah komponen"}</Text>
                      </AppPressable>
                    )}
                  </HStack>

                  {ingredients.length ? (
                    <VStack style={styles.ingredientList}>
                      {ingredients.map((part, index) => {
                        const item = part.type === "stock" ? inventoryItems.find((entry) => entry.id === part.itemId) : undefined;
                        const base = part.type === "base" ? recipes.find((entry) => entry.id === part.recipeId) : undefined;
                        const ingredientId = part.type === "stock" ? `stock:${part.itemId}` : `base:${part.recipeId}`;
                        const ingredientName = item?.name ?? base?.name ?? "Bahan tidak ditemukan";
                        const subline = item
                          ? `Stok ${formatQuantity(item.stock)} ${item.unit}`
                          : base
                            ? `Bahan dasar · ${getAvailablePortions(inventoryItems, base, recipes)} porsi tersedia`
                            : "Komponen tidak tersedia";
                        return (
                          <HStack key={ingredientId} style={[styles.ingredientRow, index < ingredients.length - 1 && styles.ingredientRowBorder]}>
                            <VStack style={styles.ingredientCopy}>
                              <Text style={styles.ingredientName} numberOfLines={1}>{ingredientName}</Text>
                              <Text style={styles.ingredientStock} numberOfLines={1}>{subline}</Text>
                            </VStack>
                            <AppInput
                              value={formatDecimalInput(part.quantity)}
                              onChangeText={(value) => {
                                setIngredients((current) => current.map((entry) => {
                                  const entryId = entry.type === "stock" ? `stock:${entry.itemId}` : `base:${entry.recipeId}`;
                                  return entryId === ingredientId ? { ...entry, quantity: decimalOnly(value) } : entry;
                                }));
                                setError("");
                              }}
                              keyboardType="decimal-pad"
                              accessibilityLabel={`${ingredientName} per porsi`}
                              style={[styles.quantityInput, isCompact && styles.quantityInputCompact]}
                              inputStyle={styles.quantityValue}
                              trailing={<Text style={styles.unitText}>{item?.unit ?? "porsi"}</Text>}
                            />
                            <AppPressable
                              onPress={() => setIngredients((current) => current.filter((entry) => {
                                const entryId = entry.type === "stock" ? `stock:${entry.itemId}` : `base:${entry.recipeId}`;
                                return entryId !== ingredientId;
                              }))}
                              style={styles.iconButton}
                              accessibilityRole="button"
                              accessibilityLabel={`Hapus ${ingredientName} dari takaran`}
                            >
                              <AppIcon name="trash-can-outline" size={18} color={colors.danger} />
                            </AppPressable>
                          </HStack>
                        );
                      })}
                    </VStack>
                  ) : !choiceType ? (
                    <VStack style={styles.emptyIngredients}>
                      <HStack style={styles.emptyIcon}>
                        <AppIcon name="package-variant-closed" size={20} color={colors.primary} />
                      </HStack>
                      <Text style={styles.emptyTitle}>{kind === "base" ? "Belum ada bahan dipilih" : "Tambahkan bahan stok atau bahan dasar"}</Text>
                      <AppPressable onPress={() => setChoiceType("stock")} style={styles.emptyAction} accessibilityRole="button" accessibilityLabel="Pilih bahan dari stok">
                        <AppIcon name="plus" size={17} color={colors.primary} />
                        <Text style={styles.addIngredientText}>Pilih bahan</Text>
                      </AppPressable>
                    </VStack>
                  ) : null}

                  {choiceType ? (
                    <VStack style={styles.choices}>
                      {kind === "menu" ? (
                        <HStack style={styles.choiceTabs}>
                          {(["stock", "base"] as const).map((type) => (
                            <AppPressable key={type} onPress={() => setChoiceType(type)} style={[styles.choiceTab, choiceType === type && styles.choiceTabSelected]} accessibilityRole="button" accessibilityState={{ selected: choiceType === type }}>
                              <Text style={[styles.choiceTabText, choiceType === type && styles.choiceTabTextSelected]}>{type === "stock" ? "Bahan stok" : "Bahan dasar"}</Text>
                            </AppPressable>
                          ))}
                        </HStack>
                      ) : null}
                      {choices.length ? (
                        choices.map((entry) => (
                          <AppPressable key={entry.id} onPress={() => addChoice(entry.type, entry.id)} style={styles.choice} accessibilityRole="button" accessibilityLabel={`Tambahkan ${entry.name}`}>
                            <VStack style={styles.choiceCopy}>
                              <Text style={styles.rowName} numberOfLines={1}>{entry.name}</Text>
                              <Text style={styles.rowMeta}>{entry.meta}</Text>
                            </VStack>
                            <HStack style={styles.choiceAddIcon}><AppIcon name="plus" size={17} color={colors.primary} /></HStack>
                          </AppPressable>
                        ))
                      ) : (
                        <Text style={styles.noChoices}>{choiceType === "stock" ? "Semua bahan stok sudah dipilih." : "Belum ada bahan dasar. Buat bahan dasar dulu."}</Text>
                      )}
                    </VStack>
                  ) : null}

                  {draftStock !== null ? (
                    <HStack style={[styles.stockPreview, draftStock > 0 ? styles.stockPreviewReady : styles.stockPreviewEmpty]}>
                      <HStack style={styles.stockPreviewCopy}>
                        <AppIcon name={draftStock > 0 ? "store-check-outline" : "alert-circle-outline"} size={18} color={draftStock > 0 ? colors.success : colors.warning} />
                        <Text style={styles.stockPreviewLabel}>{kind === "base" ? "Porsi bahan dasar" : "Stok menu"}</Text>
                      </HStack>
                      <Text style={[styles.stockPreviewValue, draftStock > 0 ? styles.stockPreviewValueReady : styles.stockPreviewValueEmpty]}>{draftStock} porsi</Text>
                    </HStack>
                  ) : null}
                </VStack>
                {error ? <Text style={productFormStyles.errorText}>{error}</Text> : null}
              </VStack>
            ) : (
              <VStack style={styles.list}>
                {error ? <Text style={productFormStyles.errorText}>{error}</Text> : null}
                <VStack style={styles.createBlock}>
                  <Text style={[productFormStyles.fieldLabel, styles.fieldLabelFlush]}>Tambah formula</Text>
                  <HStack style={styles.createActions}>
                    <AppPressable onPress={() => startCreate("base")} style={styles.createButton} accessibilityRole="button" accessibilityLabel="Buat bahan dasar">
                      <AppIcon name="layers-outline" size={17} color={colors.primary} />
                      <Text style={styles.createText}>Bahan dasar</Text>
                    </AppPressable>
                    <AppPressable onPress={() => startCreate("menu")} style={styles.createButton} accessibilityRole="button" accessibilityLabel="Buat menu jual">
                      <AppIcon name="cup-outline" size={17} color={colors.primary} />
                      <Text style={styles.createText}>Menu jual</Text>
                    </AppPressable>
                  </HStack>
                </VStack>
                <VStack style={styles.recipeSection}>
                  <Text style={styles.recipeSectionTitle}>Bahan Dasar</Text>
                  {baseRecipes.length ? baseRecipes.map(renderRecipe) : <EmptyRecipeSection kind="base" />}
                </VStack>
                <VStack style={styles.recipeSection}>
                  <Text style={styles.recipeSectionTitle}>Menu Jual</Text>
                  {menuRecipes.length ? menuRecipes.map(renderRecipe) : <EmptyRecipeSection kind="menu" />}
                </VStack>
              </VStack>
            )}
          </ScrollView>
        </ModalBody>

        {isEditing ? (
          <ModalFooter style={styles.footer}>
            <AppPressable onPress={() => { setEditingId(undefined); setChoiceType(null); setError(""); }} style={styles.cancel} accessibilityRole="button" accessibilityLabel="Kembali ke daftar bahan">
              <Text style={styles.cancelText}>Kembali</Text>
            </AppPressable>
            <Button onPress={() => { void save(); }} isDisabled={isSaving} style={styles.save}>
              <ButtonText style={styles.saveText}>{isSaving ? "Menyimpan..." : editingId ? "Simpan perubahan" : kind === "base" ? "Simpan bahan dasar" : "Simpan menu"}</ButtonText>
            </Button>
          </ModalFooter>
        ) : null}
      </ModalContent>
    </Modal>
  );
}

function EmptyRecipeSection({ kind }: { kind: RecipeKind }) {
  const isBase = kind === "base";
  return (
    <VStack style={styles.emptyRecipe}>
      <HStack style={styles.emptyRecipeIcon}>
        <AppIcon name={isBase ? "layers-outline" : "cup-outline"} size={17} color={colors.primary} />
      </HStack>
      <VStack style={styles.emptyRecipeCopy}>
        <Text style={styles.emptyRecipeTitle}>{isBase ? "Belum ada bahan dasar" : "Belum ada menu jual"}</Text>
        <Text style={styles.emptyRecipeText}>{isBase ? "Buat bahan dasar untuk dipakai dalam formula menu." : "Buat menu jual untuk menghubungkan formula dengan produk."}</Text>
      </VStack>
    </VStack>
  );
}

function EditAction({ name, onPress }: { name: string; onPress: () => void }) {
  return (
    <AppPressable onPress={onPress} style={styles.editButton} accessibilityRole="button" accessibilityLabel={`Edit ${name}`}>
      <AppIcon name="pencil-outline" size={16} color={colors.primary} />
      <Text style={styles.editText}>Edit</Text>
    </AppPressable>
  );
}

function DeleteAction({ name, disabled, onPress }: { name: string; disabled: boolean; onPress: () => void }) {
  return (
    <AppPressable onPress={onPress} disabled={disabled} style={[styles.deleteButton, disabled && styles.disabled]} accessibilityRole="button" accessibilityLabel={disabled ? `Tidak dapat menghapus ${name}, masih dipakai` : `Hapus ${name}`} accessibilityState={{ disabled }}>
      <AppIcon name="trash-can-outline" size={16} color={colors.danger} />
      <Text style={styles.deleteActionText}>Hapus</Text>
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  modal: { maxWidth: 560, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: "hidden" },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.line },
  headerCopy: { flex: 1, alignItems: "center", gap: spacing.sm },
  titleIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surfaceTint, alignItems: "center", justifyContent: "center" },
  title: { color: colors.ink, ...typography.sectionTitle },
  body: { minHeight: 0 },
  scroll: { flexGrow: 0 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  form: { gap: spacing.md },
  fieldLabelFlush: { marginBottom: 0 },
  field: { gap: spacing.sm },
  kindBadge: { alignSelf: "flex-start", minHeight: 32, paddingHorizontal: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.surfaceTint, alignItems: "center", gap: spacing.xs },
  kindText: { color: colors.primary, fontSize: type.micro, fontWeight: "600" },
  sectionHeading: { alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  ingredientList: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  ingredientRow: { alignItems: "center", gap: spacing.sm, minHeight: 64 },
  ingredientRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  ingredientCopy: { flex: 1, minWidth: 0, gap: 3 },
  ingredientName: { color: colors.ink, ...typography.input, fontWeight: "600" },
  ingredientStock: { color: colors.inkSubtle, fontSize: type.micro, fontWeight: "600" },
  quantityInput: { width: 108, minHeight: fieldHeight, paddingHorizontal: spacing.sm },
  quantityInputCompact: { width: 88, paddingHorizontal: spacing.xs },
  quantityValue: { ...typography.input, fontWeight: "500" },
  unitText: { color: colors.inkMuted, fontSize: type.micro },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.md },
  addButton: { minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceTint, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  addIngredientText: { color: colors.primary, ...typography.compactButton },
  emptyIngredients: { minHeight: 132, padding: spacing.md, borderWidth: 1, borderStyle: "dashed", borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.surfaceContainerLow, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  emptyIcon: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.surfaceTint, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: colors.inkMuted, fontSize: type.micro, lineHeight: 17, fontWeight: "600", textAlign: "center" },
  emptyAction: { minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceTint, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  choices: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.surface },
  choiceTabs: { padding: 4, backgroundColor: colors.surfaceContainerLow, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 4 },
  choiceTab: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.md },
  choiceTabSelected: { backgroundColor: colors.surface },
  choiceTabText: { color: colors.inkMuted, fontSize: type.micro, lineHeight: 17, fontWeight: "600" },
  choiceTabTextSelected: { color: colors.primary },
  choice: { minHeight: 56, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.line },
  choiceCopy: { flex: 1, minWidth: 0, gap: 3 },
  choiceAddIcon: { width: 32, height: 32, borderRadius: radius.pill, backgroundColor: colors.surfaceTint, alignItems: "center", justifyContent: "center" },
  noChoices: { padding: spacing.md, color: colors.inkMuted, fontSize: type.micro },
  stockPreview: { minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.md, alignItems: "center", justifyContent: "space-between" },
  stockPreviewReady: { backgroundColor: colors.successSoft },
  stockPreviewEmpty: { backgroundColor: colors.warningSoft },
  stockPreviewCopy: { alignItems: "center", gap: spacing.sm },
  stockPreviewLabel: { color: colors.ink, ...typography.label },
  stockPreviewValue: { fontSize: type.caption, fontWeight: "700" },
  stockPreviewValueReady: { color: colors.success },
  stockPreviewValueEmpty: { color: colors.warning },
  list: { gap: spacing.md },
  recipeSection: { gap: spacing.sm },
  recipeSectionTitle: { color: colors.ink, ...typography.label },
  createBlock: { gap: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.line },
  createActions: { gap: spacing.sm },
  createButton: { flex: 1, minHeight: 48, paddingHorizontal: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceTint, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  createText: { color: colors.primary, fontSize: type.micro, fontWeight: "600" },
  emptyRecipe: { minHeight: 88, padding: spacing.md, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.surfaceContainerLow, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  emptyRecipeIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.surfaceTint, alignItems: "center", justifyContent: "center" },
  emptyRecipeCopy: { flex: 1, gap: 3 },
  emptyRecipeTitle: { color: colors.ink, fontSize: type.caption, fontWeight: "600" },
  emptyRecipeText: { color: colors.inkMuted, fontSize: type.micro, lineHeight: 17 },
  recipeRow: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: spacing.sm },
  recipeMain: { alignItems: "center", gap: spacing.sm },
  recipeActions: { alignItems: "center", justifyContent: "flex-end", gap: spacing.xs },
  recipeName: { flex: 1, minWidth: 0, gap: 3 },
  rowName: { color: colors.ink, fontSize: type.caption, fontWeight: "600" },
  rowMeta: { color: colors.inkMuted, fontSize: type.micro },
  portionText: { fontSize: type.micro, fontWeight: "600" },
  recipeIcon: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.surfaceTint, alignItems: "center", justifyContent: "center" },
  portionBadge: { minHeight: 28, paddingHorizontal: spacing.sm, borderRadius: radius.sm, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  portionBadgeReady: { backgroundColor: colors.successSoft },
  portionBadgeEmpty: { backgroundColor: colors.warningSoft },
  portionTextReady: { color: colors.success },
  portionTextEmpty: { color: colors.warning },
  editButton: { minHeight: 44, paddingHorizontal: spacing.sm, borderRadius: radius.md, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  editText: { color: colors.primary, fontSize: type.micro, fontWeight: "600" },
  deleteButton: { minHeight: 44, paddingHorizontal: spacing.sm, borderRadius: radius.md, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  deleteActionText: { color: colors.danger, fontSize: type.micro, fontWeight: "600" },
  disabled: { opacity: 0.35 },
  confirmRow: { alignItems: "center", justifyContent: "flex-end", gap: spacing.sm },
  confirmText: { flex: 1, color: colors.ink, fontSize: type.micro },
  confirmButton: { minHeight: 44, paddingHorizontal: spacing.sm, justifyContent: "center" },
  cancel: { minHeight: 44, paddingHorizontal: spacing.md, justifyContent: "center" },
  cancelText: { color: colors.inkMuted, fontSize: type.caption, fontWeight: "600" },
  deleteText: { color: colors.danger, fontSize: type.micro, fontWeight: "600" },
  disabledText: { opacity: 0.5 },
  footer: { width: "100%", alignItems: "center", justifyContent: "flex-end", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.line },
  save: { minHeight: 44, borderRadius: radius.md, paddingHorizontal: spacing.lg, backgroundColor: colors.primary },
  saveText: { color: colors.white, ...typography.button },
});
