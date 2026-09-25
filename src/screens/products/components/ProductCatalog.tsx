import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { ScrollView, View } from "react-native";
import {
  AppIcon,
  AppInput,
  AppPressable as Pressable,
  Panel,
} from "../../../components/ui";
import { MenuListItem } from "../../../components/products/components/MenuListItem";
import { colors, spacing } from "../../../theme";
import { ProductCatalogModel } from "../types";
import { styles } from "../styles";

export function ProductCatalog({
  model,
  isMobile,
  isTablet,
}: {
  model: ProductCatalogModel;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const menuItems = model.filteredProducts.map((product) => (
    <MenuListItem
      key={product.id}
      product={product}
      selected={model.editing?.id === product.id}
      isMobile={isMobile}
      isTablet={isTablet}
      onEdit={model.openEdit}
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
            <AppIcon
              name="format-list-bulleted"
              size={21}
              color={colors.primary}
            />
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
          placeholder="Cari nama minuman ..."
          accessibilityLabel="Cari nama minuman "
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
        {isMobile ? (
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
            <Text style={styles.footerBullet}>•</Text>
            <Text style={[styles.footerWarning, (isMobile || isTablet) && styles.footerWarningAdaptive, isTablet && styles.footerWarningTablet]}>2 Menu Menipis</Text>
          </HStack>
        </HStack>
      </Panel>
    </VStack>
  );
}
