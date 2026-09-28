import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import {
  AppIcon,
  AppInput,
  AppPressable as Pressable,
  EmptyState,
  Panel,
} from "../../../components/ui";
import { MenuListItem } from "../../../components/products/components/MenuListItem";
import { useStockStore } from "../../../store/stockStore";
import { colors, spacing } from "../../../theme";
import { getRecipeHpp } from "../../../utils/standardRecipe";
import { ProductCatalogModel } from "../types";
import { styles } from "../styles";
import { DeleteMenuProductModal } from "./DeleteMenuProductModal";
import type { Product } from "../../../types/pos";

export function ProductCatalog({
  model,
  isMobile,
  isTablet,
}: {
  model: ProductCatalogModel;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const inventoryItems = useStockStore((state) => state.items);
  const recipes = useStockStore((state) => state.recipes);
  const menuItems = model.filteredProducts.map((product) => (
    <MenuListItem
      key={product.id}
      product={product}
      hpp={getRecipeHpp(inventoryItems, recipes.find((recipe) => recipe.id === product.recipeId), recipes)}
      selected={model.editing?.id === product.id}
      isMobile={isMobile}
      isTablet={isTablet}
      onEdit={model.openEdit}
      onDelete={setDeleteTarget}
    />
  ));

  return (
    <VStack style={[styles.listColumn, isMobile && styles.listColumnMobile]}>
      <Panel
        style={[styles.listCard, isMobile && styles.listCardMobile]}
        padding={spacing.md}
      >
        <HStack style={styles.listHeader}>
          <HStack style={{ alignItems: "center", gap: 8 }}>
            <HStack style={styles.listTitleIcon}>
              <AppIcon
                name="format-list-bulleted"
                size={21}
                color={colors.primary}
              />
            </HStack>
            <Text style={styles.sectionTitle}>Daftar Menu</Text>
          </HStack>
          <Text style={[styles.menuCount, (isMobile || isTablet) && styles.menuCountAdaptive, isTablet && styles.menuCountTablet]}>
            {model.productCounts.total} Menu Terdaftar
          </Text>
        </HStack>
        <AppInput
          variant="search"
          value={model.query}
          onChangeText={model.setQuery}
          placeholder="Cari menu"
          accessibilityLabel="Cari menu"
          leading={<AppIcon name="magnify" size={18} color={colors.inkMuted} />}
          style={styles.listSearch}
          inputStyle={[styles.inputText, isMobile && styles.inputTextMobile, isTablet && styles.inputTextTablet]}
        />
        <ScrollView
          horizontal
          style={styles.filterScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {model.categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => model.setSelectedCategory(category.id)}
              style={[
                styles.filterChip,
                model.selectedCategory === category.id &&
                  styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isMobile && styles.filterChipTextMobile,
                  isTablet && styles.filterChipTextTablet,
                  model.selectedCategory === category.id &&
                    styles.filterChipTextActive,
                ]}
              >
                {category.name} ({category.count})
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {menuItems.length === 0 ? (
          <EmptyState
            icon={model.productCounts.total === 0 ? "coffee-outline" : "magnify-close"}
            title={model.productCounts.total === 0 ? "Belum ada menu" : "Menu tidak ditemukan"}
            compact
          />
        ) : isMobile ? (
          <VStack style={styles.mobileMenuList}>{menuItems}</VStack>
        ) : (
          <ScrollView
            style={styles.menuListScroll}
            contentContainerStyle={styles.menuList}
            showsVerticalScrollIndicator={false}
          >
            {menuItems}
          </ScrollView>
        )}
        <HStack style={styles.listFooter}>
          <HStack style={{ alignItems: "center", gap: 5 }}>
            <View style={styles.greenDot} />
            <Text style={[styles.footerStrong, (isMobile || isTablet) && styles.footerStrongAdaptive, isTablet && styles.footerStrongTablet]}>
              Total {model.productCounts.active} Menu Aktif
            </Text>
          </HStack>
        </HStack>
      </Panel>
      {deleteTarget ? (
        <DeleteMenuProductModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={(product) => model.deleteProduct(product)}
        />
      ) : null}
    </VStack>
  );
}
