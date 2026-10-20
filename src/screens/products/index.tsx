import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useCallback, useState } from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { useIsFocused } from "expo-router/react-navigation";
import { AppShell } from "../../components/app-shell";
import { AppIcon, AppInput, EmptyState } from "../../components/ui";
import { DropdownFilter } from "../../components/dropdown-filter";
import {
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableFilterBar,
  DataTableFilterGrid,
  DataTableSection,
  type DataTableColumn,
} from "../../components/data-table";
import { ActionButton, SectionState, ui } from "../../components/management";
import { useMenuData, useMenuMutations } from "./hooks/useMenuApi";
import { MenuEditorModal, type MenuEditorTarget } from "./editor";
import { DeleteMenuProductModal } from "./components/DeleteMenuProductModal";
import { useAppToast } from "../../components/toast/useAppToast";
import {
  colors,
  radius,
  spacing,
  tableChipMinWidth,
  type,
  typography,
} from "../../theme";
import { formatCurrency } from "../../utils/format";
import type { Product } from "../../types/pos";

function MenuThumbnail({ image }: { image: Product["image"] }) {
  const [failed, setFailed] = useState(false);
  return image && !failed ? (
    <Image
      source={image}
      style={styles.image}
      onError={() => setFailed(true)}
      accessibilityLabel="Foto menu"
    />
  ) : (
    <View style={[styles.image, styles.placeholder]}>
      <AppIcon name="coffee-outline" size={20} color={colors.inkMuted} />
    </View>
  );
}

export function ProductsScreen({
  initialEditor,
  onEditorClose,
}: {
  initialEditor?: MenuEditorTarget;
  onEditorClose?: () => void;
} = {}) {
  const menu = useMenuData(useIsFocused());
  const mutations = useMenuMutations();
  const toast = useAppToast();
  const compact = useWindowDimensions().width < 620;
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [page, setPage] = useState(1);
  const [editorTarget, setEditorTarget] = useState<MenuEditorTarget | null>(
    initialEditor ?? null,
  );
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const closeEditor = useCallback(() => {
    setEditorTarget(null);
    onEditorClose?.();
  }, [onEditorClose]);
  const products = menu.products.filter(
    (product) =>
      (categoryId === "all" || product.categoryId === categoryId) &&
      product.name
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
  );
  const thumbnail = (product: Product) => (
    <MenuThumbnail key={JSON.stringify(product.image)} image={product.image} />
  );
  const menuName = (product: Product) => (
    <Text style={styles.name} numberOfLines={1}>
      {product.name}
    </Text>
  );
  const category = (product: Product) => (
    <Text style={ui.muted} numberOfLines={1}>
      {product.categoryName}
    </Text>
  );
  const compactIdentity = (product: Product) => (
    <HStack style={{ gap: spacing.md, alignItems: "center" }}>
      {thumbnail(product)}
      <VStack style={{ flex: 1, minWidth: 0, gap: 2 }}>
        {menuName(product)}
        {category(product)}
      </VStack>
    </HStack>
  );
  const status = (product: Product) => (
    <Text style={ui.muted}>
      {!product.isAvailable
        ? "Disembunyikan"
        : product.stock > 0
          ? `${product.stock} porsi tersedia`
          : "Stok habis"}
    </Text>
  );
  const recommendation = (product: Product) => {
    const recommended = product.isRecommended;
    return (
      <HStack
        style={[
          styles.recommendationChip,
          recommended
            ? styles.recommendationChipYes
            : styles.recommendationChipNo,
        ]}
      >
        <Text
          style={[
            styles.recommendationChipText,
            recommended
              ? styles.recommendationChipTextYes
              : styles.recommendationChipTextNo,
          ]}
        >
          {recommended ? "Ya" : "Tidak"}
        </Text>
      </HStack>
    );
  };
  const actions = (product: Product) => (
    <DataTableActions>
      <DataTableActionButton
        action="edit"
        label={`Edit menu ${product.name}`}
        onPress={() => setEditorTarget({ kind: "edit", id: product.id })}
      />
      <DataTableActionButton
        action="delete"
        label={`Hapus menu ${product.name}`}
        onPress={() => setDeletingProduct(product)}
      />
    </DataTableActions>
  );
  const columns: DataTableColumn<Product>[] = [
    {
      key: "thumbnail",
      title: "THUMBNAIL",
      width: 96,
      align: "center",
      render: thumbnail,
    },
    {
      key: "name",
      title: "NAMA MENU",
      flex: 2,
      minWidth: 150,
      render: menuName,
    },
    {
      key: "category",
      title: "KATEGORI",
      flex: 1.2,
      minWidth: 120,
      render: category,
    },
    {
      key: "price",
      title: "HARGA JUAL",
      width: 150,
      align: "right",
      render: (product) => (
        <Text style={styles.name}>{formatCurrency(product.price)}</Text>
      ),
    },
    {
      key: "status",
      title: "KETERSEDIAAN",
      flex: 1.4,
      minWidth: 160,
      render: status,
    },
    {
      key: "recommendation",
      title: "REKOMENDASI",
      width: 110,
      render: recommendation,
    },
    {
      key: "actions",
      title: "AKSI",
      width: 96,
      align: "center",
      render: actions,
    },
  ];
  return (
    <AppShell active="Products">
      <VStack style={ui.page}>
        <HStack
          style={[
            ui.header,
            compact && { alignItems: "stretch", flexDirection: "column" },
          ]}
        >
          <VStack style={{ flex: 1, gap: spacing.xs }}>
            <Text style={ui.title}>Kelola Menu</Text>
            <Text style={ui.muted}>Atur menu, bahan, dan harga jual.</Text>
          </VStack>
          <ActionButton
            label="Tambah Menu"
            icon="plus"
            tone="primary"
            onPress={() => setEditorTarget({ kind: "new" })}
          />
        </HStack>
        <DataTableSection>
          <DataTableFilterBar>
            <DataTableFilterGrid>
              <AppInput
                value={search}
                onChangeText={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                variant="search"
                placeholder="Cari menu"
                accessibilityLabel="Cari menu"
                leading={
                  <AppIcon name="magnify" size={16} color={colors.inkSubtle} />
                }
              />
              <DropdownFilter
                value={categoryId}
                onChange={(value) => {
                  setCategoryId(value);
                  setPage(1);
                }}
                options={menu.categories.map((category) => ({
                  key: category.id,
                  label: category.name,
                  count: category.count,
                }))}
                accessibilityLabel="Filter kategori"
                fullWidth
              />
            </DataTableFilterGrid>
          </DataTableFilterBar>
          <SectionState
            error={menu.isError ? "Menu gagal dimuat." : undefined}
            onRetry={() => void menu.refetch()}
          >
            <DataTable
              rows={products}
              columns={columns}
              keyExtractor={(product) => product.id}
              minWidth={900}
              loading={menu.isLoading}
              pagination={{
                page,
                pageSize: 10,
                onPageChange: setPage,
                itemLabel: "menu",
              }}
              emptyState={
                <EmptyState
                  icon="coffee-outline"
                  title={
                    search || categoryId !== "all"
                      ? "Menu tidak ditemukan"
                      : "Belum ada menu"
                  }
                  description={
                    search || categoryId !== "all"
                      ? undefined
                      : "Tambah menu pertama."
                  }
                  compact
                />
              }
              renderCompactRow={(product) => (
                <VStack style={{ width: "100%", gap: spacing.sm }}>
                  {compactIdentity(product)}
                  <VStack
                    style={{
                      gap: spacing.sm,
                    }}
                  >
                    <Text style={styles.name}>
                      {formatCurrency(product.price)}
                    </Text>
                    <HStack
                      style={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: spacing.sm,
                      }}
                    >
                      <HStack
                        style={{
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: spacing.sm,
                        }}
                      >
                        {status(product)}
                        {recommendation(product)}
                      </HStack>
                      {actions(product)}
                    </HStack>
                  </VStack>
                </VStack>
              )}
            />
          </SectionState>
        </DataTableSection>
      </VStack>
      {editorTarget ? (
        <MenuEditorModal
          id={editorTarget.kind === "edit" ? editorTarget.id : undefined}
          menu={menu}
          onClose={closeEditor}
        />
      ) : null}
      {deletingProduct ? (
        <DeleteMenuProductModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onDelete={async (product) => {
            await mutations.deleteProduct.mutateAsync(product.id);
            toast.success("Menu dihapus", `${product.name} berhasil dihapus.`);
          }}
        />
      ) : null}
    </AppShell>
  );
}
const styles = StyleSheet.create({
  image: { width: 40, height: 40, borderRadius: radius.md },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
  name: { color: colors.ink, ...typography.label },
  recommendationChip: {
    minWidth: tableChipMinWidth,
    minHeight: 22,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  recommendationChipYes: { backgroundColor: colors.successSoft },
  recommendationChipNo: { backgroundColor: colors.dangerSoft },
  recommendationChipText: {
    fontSize: type.micro,
    lineHeight: 17,
    fontWeight: "600",
  },
  recommendationChipTextYes: { color: colors.successText },
  recommendationChipTextNo: { color: colors.dangerText },
});
