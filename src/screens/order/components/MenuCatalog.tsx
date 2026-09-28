import { HStack, Input, InputField, Text, VStack } from "@gluestack-ui/themed";
import { memo } from "react";
import { Image, ScrollView, View } from "react-native";
import {
  AppIcon,
  AppPressable as Pressable,
  EmptyState,
  Panel,
} from "../../../components/ui";
import type { Category, Product } from "../../../types/pos";
import { formatCurrency } from "../../../utils/format";
import { colors } from "../../../theme";
import { styles } from "../styles";

type Props = {
  categories: Category[];
  cardWidth?: number;
  mobile: boolean;
  filteredProducts: Product[];
  onAddProduct: (product: Product) => void;
  onLayout: (width: number) => void;
  onQueryChange: (query: string) => void;
  onSelectCategory: (category: string) => void;
  recommendedOnly: boolean;
  onToggleRecommended: () => void;
  query: string;
  selectedCategory: string;
  wide: boolean;
};

export const MenuCatalog = memo(function MenuCatalog({
  categories,
  cardWidth,
  mobile,
  filteredProducts,
  onAddProduct,
  onLayout,
  onQueryChange,
  onSelectCategory,
  recommendedOnly,
  onToggleRecommended,
  query,
  selectedCategory,
  wide,
}: Props) {
  const hasAnyProducts = categories.find((category) => category.id === "all")?.count ?? 0;
  const menuContent =
    filteredProducts.length === 0 ? (
      <Panel>
        <EmptyState
          icon={hasAnyProducts ? "magnify-close" : "coffee-outline"}
          title={
            recommendedOnly && hasAnyProducts
              ? "Belum ada menu rekomendasi"
              : hasAnyProducts
                ? "Menu tidak ditemukan"
                : "Belum ada menu"
          }
          compact
        />
      </Panel>
    ) : (
      <VStack style={styles.productGrid}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cardWidth={cardWidth}
            mobile={mobile}
            onAddProduct={onAddProduct}
          />
        ))}
      </VStack>
    );

  return (
    <VStack
      onLayout={(event) => onLayout(event.nativeEvent.layout.width)}
      style={[styles.catalog, wide ? { flex: 1 } : { width: "100%" }]}
    >
      <VStack style={styles.functionalBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((category) => {
            const active = category.id === selectedCategory;
            const icon =
              category.id === "all"
                ? "apps"
                : category.id === "coffee"
                  ? "coffee-outline"
                  : category.id === "boba"
                    ? "chart-bubble"
                    : category.id === "tea"
                      ? "tea-outline"
                      : category.id === "snacks"
                        ? "food-croissant"
                        : "blender-outline";

            return (
              <Pressable
                key={category.id}
                onPress={() => onSelectCategory(category.id)}
                style={[
                  styles.categoryChip,
                  active && styles.categoryChipActive,
                ]}
                accessibilityLabel={`Filter ${category.name}`}
              >
                <AppIcon
                  name={icon}
                  size={17}
                  color={active ? colors.white : colors.ink}
                />
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
                <Text
                  style={[
                    styles.categoryCount,
                    active && styles.categoryCountActive,
                  ]}
                >
                  ({category.count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <HStack style={styles.searchRow}>
          <Input style={styles.searchInput}>
            <AppIcon name="magnify" size={20} color={colors.inkMuted} />
            <InputField
              value={query}
              onChangeText={onQueryChange}
              maxLength={100}
              placeholder="Cari menu"
              placeholderTextColor={colors.inkSubtle}
              style={styles.inputText}
              accessibilityLabel="Cari menu"
            />
            {query ? (
              <Pressable
                onPress={() => onQueryChange("")}
                style={styles.clearButton}
              >
                <AppIcon
                  name="close-circle"
                  size={18}
                  color={colors.inkSubtle}
                />
              </Pressable>
            ) : !mobile ? (
              <AppIcon name="barcode-scan" size={19} color={colors.inkMuted} />
            ) : null}
          </Input>
          <Pressable
            onPress={onToggleRecommended}
            style={[styles.recommendationFilter, recommendedOnly && styles.recommendationFilterActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: recommendedOnly }}
            accessibilityLabel={recommendedOnly ? "Matikan filter Rekomendasi" : "Filter Rekomendasi"}
          >
            <AppIcon
              name="star"
              size={17}
              color={recommendedOnly ? colors.white : colors.primary}
            />
            <Text style={[styles.recommendationFilterText, recommendedOnly && styles.recommendationFilterTextActive]}>
              Rekomendasi
            </Text>
          </Pressable>
        </HStack>
      </VStack>
      {wide ? (
        <ScrollView
          style={styles.productScroll}
          contentContainerStyle={styles.productScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {menuContent}
        </ScrollView>
      ) : (
        menuContent
      )}
    </VStack>
  );
});

const ProductCard = memo(function ProductCard({
  product,
  cardWidth,
  mobile,
  onAddProduct,
}: {
  product: Product;
  cardWidth?: number;
  mobile: boolean;
  onAddProduct: (product: Product) => void;
}) {
  const disabled = !product.isAvailable || product.stock <= 0;
  const size = cardWidth
    ? { width: cardWidth, flexBasis: cardWidth }
    : mobile
      ? styles.productCardFallbackMobile
      : styles.productCardFallback;

  return (
    <Pressable
      onPress={() => onAddProduct(product)}
      disabled={disabled}
      style={[styles.productCard, size, disabled && styles.productCardDisabled]}
      accessibilityRole="button"
      accessibilityLabel={
        disabled ? `${product.name}, tidak tersedia` : `Tambah ${product.name}`
      }
      accessibilityState={{ disabled }}
    >
      <View style={styles.productImageWrap}>
        {product.image ? (
          <Image
            source={product.image}
            style={[styles.productImage, disabled && styles.productImageDisabled]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.productPlaceholder,
              {
                backgroundColor: disabled
                  ? colors.surfaceContainerLow
                  : `${product.accent}18`,
              },
            ]}
          >
            <AppIcon
              name={product.icon as never}
              size={36}
              color={disabled ? colors.inkSubtle : product.accent}
            />
          </View>
        )}
        <View style={[styles.stockBadge, disabled && styles.stockBadgeDisabled]}>
          <View
            style={[
              styles.stockDot,
              disabled && styles.stockDotDisabled,
            ]}
          />
          <Text
            style={[
              styles.stockText,
              disabled && styles.stockTextDisabled,
            ]}
          >
            {product.stock <= 0
              ? "Habis"
              : product.isAvailable
                ? `${product.stock} stok`
                : "Nonaktif"}
          </Text>
        </View>
      </View>
      <VStack style={styles.productInfo}>
        <Text
          style={[styles.productName, disabled && styles.productTextDisabled]}
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <Text style={styles.productCategory} numberOfLines={1}>
          {product.categoryName}
        </Text>
        {product.description ? (
          <Text
            style={[styles.productDescription, disabled && styles.productTextDisabled]}
            numberOfLines={1}
          >
            {product.description}
          </Text>
        ) : null}
        <HStack style={styles.productBottom}>
          <Text style={[styles.productPrice, disabled && styles.productTextDisabled]}>
            {formatCurrency(product.price)}
          </Text>
          {!disabled ? (
            <HStack style={styles.plusButton}>
              <AppIcon name="plus" size={20} color={colors.white} />
            </HStack>
          ) : null}
        </HStack>
      </VStack>
    </Pressable>
  );
});
