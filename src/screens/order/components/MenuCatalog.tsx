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
  filteredProducts: Product[];
  onAddProduct: (product: Product) => void;
  onLayout: (width: number) => void;
  onQueryChange: (query: string) => void;
  onSelectCategory: (category: string) => void;
  query: string;
  selectedCategory: string;
  wide: boolean;
};

export const MenuCatalog = memo(function MenuCatalog({
  categories,
  cardWidth,
  filteredProducts,
  onAddProduct,
  onLayout,
  onQueryChange,
  onSelectCategory,
  query,
  selectedCategory,
  wide,
}: Props) {
  const menuContent =
    filteredProducts.length === 0 ? (
      <Panel>
        <EmptyState
          icon="magnify-close"
          title="Menu tidak ditemukan"
          description="Coba gunakan kata kunci lain atau pilih kategori berbeda."
        />
      </Panel>
    ) : (
      <VStack style={styles.productGrid}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cardWidth={cardWidth}
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
              placeholder="Cari nama minuman"
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
            ) : (
              <AppIcon name="barcode-scan" size={19} color={colors.inkMuted} />
            )}
          </Input>
          <Pressable style={styles.bestSeller}>
            <AppIcon name="star" size={17} color={colors.primary} />
            <Text style={styles.bestSellerText}>Best Seller</Text>
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

const productMeta: Record<string, { badge?: string }> = {
  "p-01": { badge: "Best Seller" },
  "p-02": { badge: "Favorit" },
};

const ProductCard = memo(function ProductCard({
  product,
  cardWidth,
  onAddProduct,
}: {
  product: Product;
  cardWidth?: number;
  onAddProduct: (product: Product) => void;
}) {
  const meta = productMeta[product.id] ?? {};
  const size = cardWidth
    ? { width: cardWidth, flexBasis: cardWidth }
    : styles.productCardFallback;

  return (
    <Pressable
      onPress={() => onAddProduct(product)}
      style={[styles.productCard, size]}
      accessibilityRole="button"
      accessibilityLabel={`Tambah ${product.name}`}
    >
      <View style={styles.productImageWrap}>
        {product.image ? (
          <Image
            source={product.image}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.productPlaceholder,
              { backgroundColor: `${product.accent}18` },
            ]}
          >
            <AppIcon
              name={product.icon as never}
              size={36}
              color={product.accent}
            />
          </View>
        )}
        {meta.badge ? (
          <View style={styles.featureBadge}>
            <Text style={styles.featureText}>{meta.badge}</Text>
          </View>
        ) : null}
        <View style={styles.stockBadge}>
          <View
            style={[
              styles.stockDot,
              product.stock <= 0 && styles.stockDotEmpty,
            ]}
          />
          <Text
            style={[
              styles.stockText,
              product.stock <= 0 && styles.stockTextEmpty,
            ]}
          >
            {product.stock > 0 ? `${product.stock} stok` : "Habis"}
          </Text>
        </View>
      </View>
      <VStack style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productDescription} numberOfLines={1}>
          {product.description}
        </Text>
        <HStack style={styles.productBottom}>
          <Text style={styles.productPrice}>
            {formatCurrency(product.price)}
          </Text>
          <HStack style={styles.plusButton}>
            <AppIcon name="plus" size={20} color={colors.primary} />
          </HStack>
        </HStack>
      </VStack>
    </Pressable>
  );
});
