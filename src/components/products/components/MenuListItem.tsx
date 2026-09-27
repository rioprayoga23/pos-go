import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { memo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { AppIcon, AppPressable as Pressable } from "../../ui";
import { colors, radius, type } from "../../../theme";
import { Product } from "../../../types/pos";
import { formatCurrency } from "../../../utils/format";

const profitPercentFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
});

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
  const profitPerPortion =
    hpp !== null && product.price > 0 ? product.price - hpp : null;
  const profitPercent =
    profitPerPortion !== null && product.price > 0
      ? (profitPerPortion / product.price) * 100
      : null;
  const profitLabel =
    profitPerPortion === null
      ? "Laba —"
      : `Laba ${formatCurrency(profitPerPortion)} (${profitPercentFormatter.format(profitPercent ?? 0)}%)`;
  const compactAvailabilityLabel = !product.isAvailable
    ? "Nonaktif"
    : product.stock > 0
      ? `${product.stock} porsi`
      : "Habis";

  if (isMobile) {
    return (
      <VStack
        style={[styles.menuItemMobile, selected && styles.menuItemActive]}
      >
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
            <Text style={styles.menuNameMobile} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.menuMetaMobile} numberOfLines={1}>
              {product.categoryName}
            </Text>
          </VStack>
          <VStack style={styles.menuPriceMobile}>
            <Text style={styles.priceTextMobile} numberOfLines={1}>
              {formatCurrency(product.price)}
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
            {compactAvailabilityLabel}
          </Text>
          <HStack style={styles.menuMetricsMobile}>
            <Text style={styles.costTextMobile} numberOfLines={1}>
              {hpp === null ? "HPP —" : `HPP ${formatCurrency(hpp)}`}
            </Text>
            <View style={styles.mobileMetricDivider} />
            <Text
              style={[
                styles.profitTextMobile,
                profitPerPortion === null
                  ? styles.profitNeutral
                  : profitPerPortion >= 0
                    ? styles.profitPositive
                    : styles.profitNegative,
              ]}
              numberOfLines={1}
            >
              {profitLabel}
            </Text>
          </HStack>
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
        <Text
          style={[styles.menuName, isTablet && styles.menuNameTablet]}
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <HStack style={styles.menuMetaRow}>
          <Text
            style={[styles.menuMeta, isTablet && styles.menuMetaTablet]}
            numberOfLines={1}
          >
            {product.categoryName}
          </Text>
          <Text
            style={[
              styles.availablePill,
              isTablet && styles.availablePillTablet,
              !product.isAvailable && styles.inactivePill,
            ]}
            numberOfLines={1}
          >
            {!product.isAvailable
              ? "Nonaktif"
              : product.stock > 0
                ? `${product.stock} porsi`
                : "Habis"}
          </Text>
        </HStack>
      </VStack>
      <VStack style={styles.menuFinancials}>
        <Text style={styles.priceText} numberOfLines={1}>
          {formatCurrency(product.price)}
        </Text>
        <HStack style={styles.menuFinancialDetails}>
          <Text style={styles.costText} numberOfLines={1}>
            HPP {hpp === null ? "—" : formatCurrency(hpp)}
          </Text>
          <View style={styles.financialDivider} />
          <Text
            style={[
              styles.menuMetricValue,
              profitPerPortion === null
                ? styles.profitNeutral
                : profitPerPortion >= 0
                  ? styles.profitPositive
                  : styles.profitNegative,
            ]}
            numberOfLines={1}
          >
            {profitLabel}
          </Text>
        </HStack>
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
    minHeight: 58,
    paddingHorizontal: 9,
    paddingVertical: 6,
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
    gap: 5,
  },
  menuMainMobile: { alignItems: "center", gap: 8 },
  menuThumbMobile: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  menuInfoMobile: { flex: 1, minWidth: 0, gap: 1 },
  menuNameMobile: {
    color: colors.ink,
    fontSize: type.bodySmall,
    lineHeight: 21,
    fontWeight: "600",
  },
  menuMetaMobile: {
    color: colors.inkMuted,
    fontSize: type.micro,
    lineHeight: 17,
  },
  menuMetaPriceMobile: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingLeft: 48,
  },
  availabilityMobile: {
    flexShrink: 0,
    color: colors.success,
    backgroundColor: colors.successSoft,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: type.micro,
    lineHeight: 15,
    fontWeight: "600",
  },
  availabilityMobileMuted: {
    color: colors.inkMuted,
    backgroundColor: colors.line,
  },
  menuPriceMobile: { alignItems: "flex-end", flexShrink: 0 },
  priceTextMobile: {
    color: colors.ink,
    fontSize: type.bodySmall,
    lineHeight: 21,
    fontWeight: "600",
  },
  costTextMobile: {
    flexShrink: 1,
    color: colors.inkMuted,
    fontSize: type.micro,
    lineHeight: 15,
  },
  profitTextMobile: {
    flexShrink: 1,
    fontSize: type.micro,
    lineHeight: 15,
    fontWeight: "600",
  },
  menuMetricsMobile: { minWidth: 0, alignItems: "center", gap: 6 },
  mobileMetricDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.line,
  },
  menuThumb: {
    width: 43,
    height: 43,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  menuImage: { width: "100%", height: "100%" },
  menuInfo: { flex: 1, minWidth: 0, gap: 5 },
  menuName: {
    color: colors.ink,
    fontSize: type.bodySmall,
    lineHeight: 21,
    fontWeight: "600",
  },
  menuNameTablet: { fontSize: type.bodySmall, lineHeight: 21 },
  menuMetaRow: { alignItems: "center", gap: 6 },
  menuMeta: { flexShrink: 1, minWidth: 0, color: colors.inkMuted, fontSize: type.micro },
  menuMetaTablet: { fontSize: type.micro },
  availablePill: {
    color: colors.success,
    backgroundColor: colors.successSoft,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 3,
    fontSize: type.micro,
    fontWeight: "600",
  },
  inactivePill: {
    color: colors.inkMuted,
    backgroundColor: colors.surfaceContainerLow,
  },
  menuFinancials: {
    width: 250,
    flexShrink: 0,
    alignItems: "flex-end",
    gap: 2,
  },
  menuFinancialDetails: {
    alignItems: "center",
    gap: 5,
  },
  menuMetricValue: {
    color: colors.inkMuted,
    fontSize: type.overline,
    lineHeight: 14,
    fontWeight: "600",
  },
  financialDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.line,
  },
  availablePillTablet: { fontSize: type.micro },
  priceText: {
    color: colors.ink,
    fontSize: type.bodySmall,
    lineHeight: 18,
    fontWeight: "600",
  },
  costText: { color: colors.inkMuted, fontSize: type.overline, lineHeight: 14 },
  profitNeutral: { color: colors.inkMuted },
  profitPositive: { color: colors.success },
  profitNegative: { color: colors.danger },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonMobile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
