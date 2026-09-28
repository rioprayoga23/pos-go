import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { memo, useState } from "react";
import { Image, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { AppIcon } from "../../ui";
import { DataTableActionButton, DataTableActions } from "../../data-table";
import { colors, radius, type } from "../../../theme";
import { Product } from "../../../types/pos";
import { formatCurrency } from "../../../utils/format";

const inlineCardBreakpoint = 480;
const profitPercentFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
});

export const MenuListItem = memo(function MenuListItem({
  product,
  hpp,
  selected,
  onEdit,
  onDelete,
}: {
  product: Product;
  hpp: number | null;
  selected: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  const [itemWidth, setItemWidth] = useState(0);
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);
  const isNarrow = itemWidth > 0 && itemWidth < inlineCardBreakpoint;
  const photoUrl =
    product.image && typeof product.image === "object" && !Array.isArray(product.image) && "uri" in product.image
      ? product.image.uri
      : undefined;
  const showPhoto = Boolean(product.image) && (!photoUrl || failedPhotoUrl !== photoUrl);
  const profit = hpp !== null && product.price > 0 ? product.price - hpp : null;
  const profitPercent = profit !== null ? (profit / product.price) * 100 : null;
  const profitLabel =
    profit === null
      ? "Laba —"
      : `Laba ${formatCurrency(profit)} (${profitPercentFormatter.format(profitPercent ?? 0)}%)`;
  const availabilityLabel = !product.isAvailable
    ? "Nonaktif"
    : product.stock > 0
      ? `${product.stock} porsi`
      : "Habis";
  const handleLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    setItemWidth((current) => (current === width ? current : width));
  };

  const thumbnail = (
    <View style={[styles.thumbnail, isNarrow && styles.thumbnailNarrow]}>
      {showPhoto ? (
        <Image
          source={product.image}
          style={styles.image}
          onError={() => setFailedPhotoUrl(photoUrl ?? "unreadable-local-photo")}
        />
      ) : (
        <AppIcon name="cup-outline" size={17} color={colors.primary} />
      )}
    </View>
  );

  const identity = (
    <VStack style={styles.identity}>
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <HStack style={styles.subtitle}>
        <Text style={styles.category} numberOfLines={1}>
          {product.categoryName}
        </Text>
        <View style={styles.metaDot} />
        <Text
          style={[
            styles.availability,
            (!product.isAvailable || product.stock <= 0) && styles.availabilityMuted,
          ]}
          numberOfLines={1}
        >
          {availabilityLabel}
        </Text>
      </HStack>
    </VStack>
  );

  const financialDetails = (
    <HStack style={styles.financialDetails}>
      <Text style={styles.cost} numberOfLines={1}>
        HPP {hpp === null ? "—" : formatCurrency(hpp)}
      </Text>
      <View style={styles.financialDivider} />
      <Text
        style={[
          styles.profit,
          profit === null
            ? styles.profitNeutral
            : profit >= 0
              ? styles.profitPositive
              : styles.profitNegative,
        ]}
        numberOfLines={1}
      >
        {profitLabel}
      </Text>
    </HStack>
  );

  const actions = (
    <DataTableActions compact>
      <DataTableActionButton compact action="edit" label={`Edit ${product.name}`} onPress={() => onEdit(product)} />
      <DataTableActionButton compact action="delete" label={`Hapus ${product.name}`} onPress={() => onDelete(product)} />
    </DataTableActions>
  );

  if (isNarrow) {
    return (
      <VStack
        onLayout={handleLayout}
        style={[styles.card, styles.cardNarrow, selected && styles.cardSelected]}
      >
        <HStack style={styles.narrowMain}>
          {thumbnail}
          {identity}
          <Text style={styles.price} numberOfLines={1}>
            {formatCurrency(product.price)}
          </Text>
          {actions}
        </HStack>
        <HStack style={styles.narrowMetrics}>{financialDetails}</HStack>
      </VStack>
    );
  }

  return (
    <HStack
      onLayout={handleLayout}
      style={[styles.card, styles.cardInline, selected && styles.cardSelected]}
    >
      {thumbnail}
      {identity}
      <VStack style={styles.financials}>
        <Text style={styles.price} numberOfLines={1}>
          {formatCurrency(product.price)}
        </Text>
        {financialDetails}
      </VStack>
      {actions}
    </HStack>
  );
});

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
    minWidth: 0,
    padding: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardInline: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  cardNarrow: { gap: 6 },
  cardSelected: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  thumbnail: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTint,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailNarrow: { width: 30, height: 30 },
  image: { width: "100%", height: "100%" },
  identity: { flex: 1, minWidth: 0, gap: 2 },
  name: {
    color: colors.ink,
    fontSize: type.bodySmall,
    lineHeight: 19,
    fontWeight: "600",
  },
  subtitle: { alignItems: "center", minWidth: 0, gap: 5 },
  category: { flexShrink: 1, minWidth: 0, color: colors.inkMuted, fontSize: type.micro, lineHeight: 16 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.inkMuted },
  availability: { flexShrink: 0, color: colors.success, fontSize: type.micro, lineHeight: 16, fontWeight: "600" },
  availabilityMuted: { color: colors.inkMuted },
  financials: {
    width: 226,
    minWidth: 0,
    flexShrink: 1,
    alignItems: "flex-end",
    gap: 2,
  },
  price: {
    flexShrink: 0,
    color: colors.ink,
    fontSize: type.bodySmall,
    lineHeight: 19,
    fontWeight: "600",
  },
  financialDetails: { alignItems: "center", justifyContent: "flex-end", gap: 5, minWidth: 0 },
  cost: { flexShrink: 1, color: colors.inkMuted, fontSize: type.overline, lineHeight: 14 },
  financialDivider: { width: 1, height: 12, backgroundColor: colors.line },
  profit: { flexShrink: 1, fontSize: type.overline, lineHeight: 14, fontWeight: "600" },
  profitNeutral: { color: colors.inkMuted },
  profitPositive: { color: colors.success },
  profitNegative: { color: colors.danger },
  narrowMain: { alignItems: "center", gap: 7, minWidth: 0 },
  narrowMetrics: { paddingLeft: 37, minWidth: 0 },
});
