import { ButtonText, HStack, Text, VStack } from "@gluestack-ui/themed";
import { ScrollView } from "react-native";
import {
  AppButton as Button,
  AppIcon,
  AppInput,
  AppPressable as Pressable,
  Panel,
} from "../../../components/ui";
import { CategoryModal } from "../../../components/products/components/CategoryModal";
import { HppModal } from "../../../components/products/components/HppModal";
import { productFormStyles } from "../../../components/products/styles/form";
import { colors, spacing } from "../../../theme";
import { CategoryField } from "./CategoryField";
import { FinanceOverview } from "./FinanceOverview";
import { ProductAvailabilityField } from "./ProductAvailabilityField";
import { PhotoField } from "./PhotoField";
import { StockField } from "./StockField";
import { emptyForm } from "../constants";
import { ProductEditorModel } from "../types";
import { styles } from "../styles";

export function ProductEditor({
  model,
  formScrollRef,
}: {
  model: ProductEditorModel;
  formScrollRef: React.RefObject<ScrollView | null>;
}) {
  const { editing, form, setForm } = model;
  const price = Number(form.price.replace(/\D/g, ""));
  const stock = Number(form.stock);
  const isHppComplete =
    form.hppComponents.length > 0 &&
    form.hppComponents.every(
      (component) =>
        component.name.trim().length > 0 &&
        component.detail.trim().length > 0 &&
        Number.isFinite(component.cost) &&
        component.cost > 0,
    );
  const isFormComplete =
    form.name.trim().length > 0 &&
    price > 0 &&
    form.stock.trim().length > 0 &&
    Number.isInteger(stock) &&
    stock >= 0 &&
    model.categories.some(
      (category) => category.id === form.categoryId && category.id !== "all",
    ) &&
    isHppComplete;
  const hasFormContent =
    editing !== null ||
    form.name.trim().length > 0 ||
    (form.price.trim().length > 0 && form.price !== emptyForm.price) ||
    form.stock.trim().length > 0 ||
    form.description.trim().length > 0 ||
    form.categoryId !== emptyForm.categoryId ||
    form.hppComponents.length > 0 ||
    form.isAvailable !== emptyForm.isAvailable ||
    form.accent !== emptyForm.accent ||
    form.icon !== emptyForm.icon ||
    form.image !== undefined;

  return (
    <VStack style={styles.formColumn}>
      <Panel style={styles.formCard} padding={spacing.lg}>
        <HStack style={styles.formHeader}>
          <VStack style={{ flex: 1, gap: 3 }}>
            <Text style={styles.sectionTitle}>
              {editing ? "Edit Menu Minuman" : "Input Menu Minuman Baru"}
            </Text>
            <Text style={productFormStyles.description}>
              {editing
                ? `Perbarui detail ${editing.name}.`
                : "Konfigurasikan item menu, harga, margin, dan kustomisasi varian."}
            </Text>
          </VStack>
          {hasFormContent ? (
            <Pressable
              onPress={model.reset}
              style={styles.resetButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Kosongkan formulir menu"
            >
              <AppIcon name="refresh" size={15} color={colors.danger} />
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          ) : null}
        </HStack>
        <ScrollView
          ref={formScrollRef}
          style={styles.formScroll}
          contentContainerStyle={styles.formScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <VStack style={productFormStyles.formGap}>
            <VStack>
              <Text style={productFormStyles.fieldLabel}>
                Nama Menu Minuman{" "}
                <Text style={productFormStyles.required}>*</Text>
              </Text>
              <AppInput
                value={form.name}
                onChangeText={(name) => setForm({ ...form, name })}
                placeholder="Contoh: Brown Sugar Pearl Milk Tea"
                accessibilityLabel="Nama menu minuman"
                inputStyle={styles.inputText}
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
              onSelect={(categoryId) => setForm({ ...form, categoryId })}
              onAdd={model.categoryModal.open}
            />
            <StockField form={form} setForm={setForm} />
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
              onPick={model.pickProductImage}
              onClear={model.clearPhoto}
            />
            <FinanceOverview
              financials={model.financials}
              onOpen={model.hppModal.open}
            />
            {model.formError ? (
              <Text style={productFormStyles.errorText}>{model.formError}</Text>
            ) : null}
            <VStack style={styles.formActions}>
              <Button
                onPress={model.save}
                isDisabled={!isFormComplete}
                style={[
                  styles.formPublishButton,
                  !isFormComplete && { opacity: 0.45 },
                ]}
              >
                <AppIcon name="check-circle" size={19} color={colors.white} />
                <ButtonText style={productFormStyles.publishText}>
                  {editing ? "Simpan Perubahan" : "Simpan & Publikasikan Menu"}
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </ScrollView>
      </Panel>
      <CategoryModal
        visible={model.categoryModal.visible}
        name={model.categoryModal.name}
        setName={model.categoryModal.setName}
        icon={model.categoryModal.icon}
        setIcon={model.categoryModal.setIcon}
        error={model.categoryModal.error}
        onClose={model.categoryModal.close}
        onSave={model.categoryModal.save}
      />
      {model.hppModal.visible ? (
        <HppModal
          initialPrice={form.price}
          initialComponents={form.hppComponents}
          onClose={model.hppModal.close}
          onSave={model.hppModal.save}
        />
      ) : null}
    </VStack>
  );
}
