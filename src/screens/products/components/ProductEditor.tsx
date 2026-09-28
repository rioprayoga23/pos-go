import { ButtonText, HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { ScrollView } from "react-native";
import {
  AppButton as Button,
  AppIcon,
  AppInput,
  AppPressable as Pressable,
  Panel,
} from "../../../components/ui";
import { CategoryModal } from "../../../components/products/components/CategoryModal";
import { productFormStyles } from "../../../components/products/styles/form";
import { colors, spacing } from "../../../theme";
import { parseWholeNumber } from "../../../utils/format";
import { CategoryField } from "./CategoryField";
import { PriceField } from "./PriceField";
import { ProductAvailabilityField } from "./ProductAvailabilityField";
import { PhotoField } from "./PhotoField";
import { RecipeField } from "./RecipeField";
import { RecipeManagerModal } from "./RecipeManagerModal";
import { emptyForm } from "../constants";
import { ProductEditorModel } from "../types";
import { styles } from "../styles";

export function ProductEditor({
  model,
  formScrollRef,
  isMobile,
  isTablet,
}: {
  model: ProductEditorModel;
  formScrollRef: React.RefObject<ScrollView | null>;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const { editing, form, setForm } = model;
  const [recipeManagerOpen, setRecipeManagerOpen] = useState(false);
  const price = parseWholeNumber(form.price);
  const isFormComplete =
    form.name.trim().length > 0 &&
    price > 0 &&
    model.categories.some(
      (category) => category.id === form.categoryId && category.id !== "all",
    ) &&
    model.recipes.some((recipe) => recipe.id === form.recipeId && recipe.kind === "menu");
  const hasFormContent =
    editing !== null ||
    form.name.trim().length > 0 ||
    (form.price.trim().length > 0 && form.price !== emptyForm.price) ||
    form.description.trim().length > 0 ||
    form.categoryId !== emptyForm.categoryId ||
    form.recipeId !== emptyForm.recipeId ||
    form.isAvailable !== emptyForm.isAvailable ||
    form.accent !== emptyForm.accent ||
    form.icon !== emptyForm.icon ||
    form.image !== undefined;
  const formFields = (
    <VStack style={productFormStyles.formGap}>
      <VStack>
        <Text style={[productFormStyles.fieldLabel, isMobile && productFormStyles.fieldLabelMobile, isTablet && productFormStyles.fieldLabelTablet]}>
          Nama Menu Minuman <Text style={productFormStyles.required}>*</Text>
        </Text>
        <AppInput
          value={form.name}
          onChangeText={(name) => setForm({ ...form, name })}
          placeholder="Contoh: Matcha Latte"
          accessibilityLabel="Nama menu minuman"
          inputStyle={[styles.inputText, isMobile && styles.inputTextMobile, isTablet && styles.inputTextTablet]}
          trailing={
            <AppIcon
              name="coffee-outline"
              size={19}
              color={colors.inkMuted}
            />
          }
        />
      </VStack>
      <CategoryField
        categories={model.categories}
        selectedId={form.categoryId}
        isMobile={isMobile}
        isTablet={isTablet}
        onSelect={(categoryId) => setForm({ ...form, categoryId })}
        onAdd={model.categoryModal.open}
      />
      <RecipeField
        recipes={model.recipes}
        items={model.inventoryItems}
        selectedId={form.recipeId}
        availableStock={model.availableStock}
        onSelect={(recipeId) => setForm((current) => ({ ...current, recipeId }))}
        onManage={() => setRecipeManagerOpen(true)}
      />
      <PriceField
        value={form.price}
        costLines={model.recipeCostLines}
        onChange={(priceValue) => setForm((current) => ({ ...current, price: priceValue }))}
      />
      <ProductAvailabilityField
        isActive={form.isAvailable}
        onChange={(isAvailable) =>
          setForm((current) => ({ ...current, isAvailable }))
        }
      />
      <PhotoField
        form={form}
        error={model.photoError}
        isPickingImage={model.isPickingImage}
        isMobile={isMobile}
        isTablet={isTablet}
        onPick={model.pickProductImage}
        onClear={model.clearPhoto}
      />
    </VStack>
  );
  const formFooter = (
    <VStack style={styles.formFooter}>
      {model.formError ? (
        <Text style={productFormStyles.errorText}>{model.formError}</Text>
      ) : null}
      <VStack style={styles.formActions}>
        <Button
          onPress={() => { void model.save(); }}
          isDisabled={!isFormComplete || model.isSaving}
          style={[
            styles.formPublishButton,
            (!isFormComplete || model.isSaving) && styles.formPublishButtonDisabled,
          ]}
        >
          <AppIcon
            name="check-circle"
            size={19}
            color={isFormComplete ? colors.white : colors.inkSubtle}
          />
          <ButtonText
            style={[
              productFormStyles.publishText,
              isMobile && productFormStyles.publishTextMobile,
              isTablet && productFormStyles.publishTextTablet,
              (!isFormComplete || model.isSaving) && styles.formPublishButtonTextDisabled,
            ]}
          >
            {model.isSaving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan & Publikasikan Menu"}
          </ButtonText>
        </Button>
      </VStack>
    </VStack>
  );

  return (
    <VStack style={[styles.formColumn, isMobile && styles.formColumnMobile]}>
      <Panel
        style={[styles.formCard, isMobile && styles.formCardMobile]}
        padding={spacing.lg}
      >
        <HStack style={styles.formHeader}>
          <HStack style={styles.formTitleGroup}>
            <HStack style={styles.formTitleIcon}>
              <AppIcon name="coffee-outline" size={18} color={colors.primary} />
            </HStack>
            <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
              {editing ? "Edit Menu Minuman" : "Input Menu Minuman Baru"}
            </Text>
          </HStack>
          {hasFormContent ? (
            <Pressable
              onPress={model.reset}
              style={styles.resetButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Kosongkan formulir menu"
            >
              <AppIcon name="refresh" size={15} color={colors.danger} />
              <Text style={[styles.resetText, isMobile && styles.resetTextMobile, isTablet && styles.resetTextTablet]}>Reset</Text>
            </Pressable>
          ) : null}
        </HStack>
        {isMobile ? (
          <VStack style={styles.mobileFormContent}>{formFields}</VStack>
        ) : (
          <ScrollView
            ref={formScrollRef}
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {formFields}
          </ScrollView>
        )}
        {formFooter}
      </Panel>
      <CategoryModal
        visible={model.categoryModal.visible}
        name={model.categoryModal.name}
        setName={model.categoryModal.setName}
        error={model.categoryModal.error}
        isSaving={model.categoryModal.isSaving}
        onClose={model.categoryModal.close}
        onSave={() => { void model.categoryModal.save(); }}
      />
      {recipeManagerOpen ? (
        <RecipeManagerModal
          recipes={model.recipes}
          inventoryItems={model.inventoryItems}
          products={model.products}
          onCreateRecipe={model.recipeActions.create}
          onUpdateRecipe={model.recipeActions.update}
          onDeleteRecipe={model.recipeActions.delete}
          onClose={() => setRecipeManagerOpen(false)}
          onCreate={(recipeId) => setForm((current) => ({ ...current, recipeId }))}
          selectedRecipeId={form.recipeId}
          onSelectedDeleted={() => setForm((current) => ({ ...current, recipeId: "" }))}
        />
      ) : null}
    </VStack>
  );
}
