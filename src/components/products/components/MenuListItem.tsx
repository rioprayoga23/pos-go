import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { memo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { AppIcon, AppPressable as Pressable } from "../../ui";
import { colors, radius } from "../../../theme";
import { Product } from "../../../types/pos";
import { formatCurrency } from "../../../utils/format";

export const MenuListItem = memo(function MenuListItem({
  product,
  selected,
  onEdit,
}: {
  product: Product;
  selected: boolean;
  onEdit: (product: Product) => void;
}) {
  return (
    <HStack style={[styles.menuItem, selected && styles.menuItemActive]}>
      <View style={styles.menuThumb}>
        {product.image ? (
          <Image source={product.image} style={styles.menuImage} />
        ) : (
          <AppIcon
            name={product.icon as never}
            size={20}
            color={product.accent}
          />
        )}
      </View>
      <VStack style={styles.menuInfo}>
        <Text style={styles.menuName} numberOfLines={1}>
          {product.name}
        </Text>
        <HStack style={styles.menuMetaRow}>
          <Text style={styles.menuMeta}>
            {product.categoryName} • SKU-
            {product.id.replace("p-", "").toUpperCase()}
          </Text>
          <Text
            style={[
              styles.availablePill,
              !product.isAvailable && styles.inactivePill,
            ]}
          >
            {!product.isAvailable
              ? "Nonaktif"
              : product.stock > 0
                ? `Tersedia: ${product.stock} Porsi`
                : "Habis"}
          </Text>
        </HStack>
      </VStack>
      <VStack style={styles.menuPrice}>
        <Text style={styles.priceText}>{formatCurrency(product.price)}</Text>
        <Text style={styles.costText}>
          Modal: {formatCurrency(product.hpp ?? 11500)}
        </Text>
      </VStack>
      <Pressable
        onPress={() => onEdit(product)}
        style={styles.editButton}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${product.name}`}
      >
        <AppIcon name="pencil-outline" size={16} color={colors.primary} />
      </Pressable>
    </HStack>
  );
});

const styles = StyleSheet.create({
  menuItem: {
    minHeight: 70,
    padding: 9,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    gap: 8,
  },
  menuItemActive: { backgroundColor: colors.surfaceTint },
  menuThumb: {
    width: 43,
    height: 43,
    borderRadius: 10,
    backgroundColor: colors.surface,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  menuImage: { width: "100%", height: "100%" },
  menuInfo: { flex: 1, minWidth: 0, gap: 5 },
  menuName: { color: colors.ink, fontSize: 11, fontWeight: "900" },
  menuMetaRow: { alignItems: "center", gap: 6 },
  menuMeta: { color: colors.inkMuted, fontSize: 9 },
  availablePill: {
    color: "#166534",
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 5,
    paddingVertical: 3,
    fontSize: 8,
    fontWeight: "900",
  },
  inactivePill: {
    color: colors.inkMuted,
    backgroundColor: colors.surfaceContainerLow,
  },
  menuPrice: { alignItems: "flex-end", gap: 3 },
  priceText: { color: colors.success, fontSize: 11, fontWeight: "900" },
  costText: { color: colors.inkMuted, fontSize: 8 },
  editButton: {
    width: 31,
    height: 31,
    borderRadius: 31,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
