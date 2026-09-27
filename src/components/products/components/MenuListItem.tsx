import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { memo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { AppIcon, AppPressable as Pressable } from "../../ui";
import { colors, radius } from "../../../theme";
import { Product } from "../../../types/pos";
import { formatCurrency } from "../../../utils/format";

export const MenuListItem = memo(function MenuListItem({
  product,
  hpp,
  selected,
  isMobile,
  isTablet,
  onEdit,
}: {
  product: Product;
  hpp: number | null;
  selected: boolean;
  isMobile: boolean;
  isTablet: boolean;
  onEdit: (product: Product) => void;
}) {
  const availabilityLabel = !product.isAvailable
    ? "Nonaktif"
    : product.stock > 0
      ? `Tersedia · ${product.stock} porsi`
      : "Stok habis";

  if (isMobile) {
    return (
      <VStack style={[styles.menuItemMobile, selected && styles.menuItemActive]}>
        <HStack style={styles.menuMainMobile}>
          <View style={styles.menuThumbMobile}>
            {product.image ? (
              <Image source={product.image} style={styles.menuImage} />
            ) : (
              <AppIcon
                name={product.icon as never}
                size={19}
                color={product.accent}
              />
            )}
          </View>
          <VStack style={styles.menuInfoMobile}>
            <Text style={styles.menuNameMobile} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.menuMetaMobile} numberOfLines={1}>
              {product.categoryName} · SKU-
              {product.id.replace("p-", "").toUpperCase()}
            </Text>
          </VStack>
          <Pressable
            onPress={() => onEdit(product)}
            style={styles.editButtonMobile}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${product.name}`}
          >
            <AppIcon name="pencil-outline" size={16} color={colors.primary} />
          </Pressable>
        </HStack>
        <HStack style={styles.menuMetaPriceMobile}>
          <Text
            style={[
              styles.availabilityMobile,
              (!product.isAvailable || product.stock <= 0) &&
                styles.availabilityMobileMuted,
            ]}
            numberOfLines={1}
          >
            {availabilityLabel}
          </Text>
          <VStack style={styles.menuPriceMobile}>
            <Text style={styles.priceTextMobile}>
              {formatCurrency(product.price)}
            </Text>
            <Text style={styles.costTextMobile}>
              {hpp === null ? "HPP —" : `HPP ${formatCurrency(hpp)}`}
            </Text>
          </VStack>
        </HStack>
      </VStack>
    );
  }

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
        <Text style={[styles.menuName, isTablet && styles.menuNameTablet]} numberOfLines={1}>
          {product.name}
        </Text>
        <HStack style={styles.menuMetaRow}>
          <Text style={[styles.menuMeta, isTablet && styles.menuMetaTablet]}>
            {product.categoryName} • SKU-
            {product.id.replace("p-", "").toUpperCase()}
          </Text>
          <Text
            style={[
              styles.availablePill,
              isTablet && styles.availablePillTablet,
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
        <Text style={[styles.priceText, isTablet && styles.priceTextTablet]}>{formatCurrency(product.price)}</Text>
        <Text style={[styles.costText, isTablet && styles.costTextTablet]}>
          {hpp === null ? "HPP —" : `HPP: ${formatCurrency(hpp)}`}
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
  menuItemMobile: {
    padding: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    gap: 7,
  },
  menuMainMobile: { alignItems: "center", gap: 8 },
  menuThumbMobile: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: colors.surface,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  menuInfoMobile: { flex: 1, minWidth: 0, gap: 3 },
  menuNameMobile: { color: colors.ink, fontSize: 12, lineHeight: 15, fontWeight: "800" },
  menuMetaMobile: { color: colors.inkMuted, fontSize: 12, lineHeight: 14 },
  menuMetaPriceMobile: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    paddingLeft: 48,
  },
  availabilityMobile: {
    flex: 1,
    minWidth: 0,
    color: "#166534",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "700",
  },
  availabilityMobileMuted: { color: colors.inkMuted },
  menuPriceMobile: { alignItems: "flex-end", gap: 1 },
  priceTextMobile: { color: colors.success, fontSize: 12, lineHeight: 15, fontWeight: "800" },
  costTextMobile: { color: colors.inkMuted, fontSize: 12, lineHeight: 14 },
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
  menuName: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  menuNameTablet: { fontSize: 13 },
  menuMetaRow: { alignItems: "center", gap: 6 },
  menuMeta: { color: colors.inkMuted, fontSize: 11 },
  menuMetaTablet: { fontSize: 12 },
  availablePill: {
    color: "#166534",
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 5,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: "900",
  },
  inactivePill: {
    color: colors.inkMuted,
    backgroundColor: colors.surfaceContainerLow,
  },
  menuPrice: { alignItems: "flex-end", gap: 3 },
  availablePillTablet: { fontSize: 12 },
  priceText: { color: colors.success, fontSize: 12, fontWeight: "900" },
  priceTextTablet: { fontSize: 13 },
  costText: { color: colors.inkMuted, fontSize: 11 },
  costTextTablet: { fontSize: 12 },
  editButton: {
    width: 31,
    height: 31,
    borderRadius: 31,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonMobile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
