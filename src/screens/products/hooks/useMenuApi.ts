import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { colors } from "../../../theme";
import { useProductStore } from "../../../store/productStore";
import { useStockStore } from "../../../store/stockStore";
import type { Category, Product } from "../../../types/pos";
import { getAvailablePortions } from "../../../utils/standardRecipe";
import { listAllStockItems } from "../../stock/api";
import { stockQueryKeys } from "../../stock/hooks/useStockApi";
import {
  createMenuCategory,
  createMenuProduct,
  createMenuRecipe,
  deleteMenuProduct,
  deleteMenuProductPhoto,
  deleteMenuRecipe,
  listMenuCategories,
  listMenuProducts,
  listMenuRecipes,
  updateMenuProduct,
  updateMenuRecipe,
  uploadMenuProductPhoto,
  type MenuProductDraft,
  type MenuProductRecord,
  type MenuRecipeDraft,
} from "../api";

export const menuQueryKeys = {
  all: ["menu"] as const,
  categories: ["menu", "categories"] as const,
  recipes: ["menu", "recipes"] as const,
  products: ["menu", "products"] as const,
  searchProducts: (search: string) => ["menu", "products", "search", search] as const,
};

const menuCacheOptions = {
  staleTime: Infinity,
  gcTime: Infinity,
} as const;

const allCategory: Category = { id: "all", name: "Semua", count: 0, tint: colors.surfaceTint };

export function menuProductToProduct(
  product: MenuProductRecord,
  categories: Category[],
  stockItems: ReturnType<typeof useStockStore.getState>["items"],
  recipes: ReturnType<typeof useStockStore.getState>["recipes"],
): Product {
  const recipe = recipes.find((entry) => entry.id === product.recipeId);
  return {
    ...product,
    stock: getAvailablePortions(stockItems, recipe, recipes) ?? 0,
    accent: colors.cyan,
    icon: "cup-outline",
    image: product.photoUrl ? { uri: product.photoUrl } : undefined,
    categoryName: categories.find((category) => category.id === product.categoryId)?.name ?? product.categoryName,
  };
}

export function useMenuData(enabled = true) {
  const categoriesQuery = useQuery({
    queryKey: menuQueryKeys.categories,
    queryFn: ({ signal }) => listMenuCategories(signal),
    enabled,
    ...menuCacheOptions,
  });
  const recipesQuery = useQuery({
    queryKey: menuQueryKeys.recipes,
    queryFn: ({ signal }) => listMenuRecipes(signal),
    enabled,
    ...menuCacheOptions,
  });
  const productsQuery = useQuery({
    queryKey: menuQueryKeys.products,
    queryFn: ({ signal }) => listMenuProducts(signal),
    enabled,
    ...menuCacheOptions,
  });
  const stockQuery = useQuery({
    queryKey: stockQueryKeys.allItems,
    queryFn: ({ signal }) => listAllStockItems(signal),
    enabled,
    staleTime: 0,
  });

  const rawCategories = categoriesQuery.data;
  const recipes = recipesQuery.data;
  const productRecords = productsQuery.data;
  const stockItems = stockQuery.data;
  const categories = useMemo<Category[]>(() => {
    const counts = new Map<string, number>();
    (productRecords ?? []).forEach((product) => counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1));
    return [
      { ...allCategory, count: productRecords?.length ?? 0 },
      ...(rawCategories ?? []).map((category) => ({
        ...category,
        count: counts.get(category.id) ?? 0,
        tint: colors.surfaceTint,
      })),
    ];
  }, [rawCategories, productRecords]);
  const products = useMemo(
    () => (productRecords ?? []).map((product) => menuProductToProduct(product, categories, stockItems ?? [], recipes ?? [])),
    [productRecords, categories, stockItems, recipes],
  );
  const hasData = rawCategories !== undefined && recipes !== undefined && productRecords !== undefined && stockItems !== undefined;
  const hasError = categoriesQuery.isError || recipesQuery.isError || productsQuery.isError || stockQuery.isError;

  useEffect(() => {
    if (!hasData) {
      if (hasError) {
        useStockStore.getState().setItems([]);
        useStockStore.getState().replaceRecipes([]);
        useProductStore.getState().setCatalog([], []);
      }
      return;
    }
    useStockStore.getState().setItems(stockItems);
    useStockStore.getState().replaceRecipes(recipes);
    useProductStore.getState().setCatalog(products, categories);
  }, [hasData, hasError, stockItems, recipes, products, categories]);

  return {
    categories,
    recipes: recipes ?? [],
    products,
    stockItems: stockItems ?? [],
    isLoading: categoriesQuery.isFetching || recipesQuery.isFetching || productsQuery.isFetching || stockQuery.isFetching,
    isError: !hasData && hasError,
    refetch: () => Promise.all([
      ...(categoriesQuery.isError ? [categoriesQuery.refetch()] : []),
      ...(recipesQuery.isError ? [recipesQuery.refetch()] : []),
      ...(productsQuery.isError ? [productsQuery.refetch()] : []),
      ...(stockQuery.isError ? [stockQuery.refetch()] : []),
    ]),
  };
}

export function useMenuMutations() {
  const queryClient = useQueryClient();
  const refreshRecipes = () => queryClient.invalidateQueries({ queryKey: menuQueryKeys.recipes });
  const refreshProducts = () => queryClient.invalidateQueries({ queryKey: menuQueryKeys.products });
  return {
    refreshProducts,
    createCategory: useMutation({ mutationFn: createMenuCategory, onSuccess: () => queryClient.invalidateQueries({ queryKey: menuQueryKeys.categories }) }),
    createRecipe: useMutation({ mutationFn: createMenuRecipe, onSuccess: refreshRecipes }),
    updateRecipe: useMutation({ mutationFn: ({ id, draft }: { id: string; draft: Pick<MenuRecipeDraft, "name" | "ingredients"> }) => updateMenuRecipe(id, draft), onSuccess: refreshRecipes }),
    deleteRecipe: useMutation({ mutationFn: deleteMenuRecipe, onSuccess: refreshRecipes }),
    createProduct: useMutation({
      mutationFn: ({ draft }: { draft: MenuProductDraft; refresh?: boolean }) => createMenuProduct(draft),
      onSuccess: (_, variables) => variables.refresh === false ? undefined : refreshProducts(),
    }),
    updateProduct: useMutation({
      mutationFn: ({ id, draft }: { id: string; draft: MenuProductDraft; refresh?: boolean }) => updateMenuProduct(id, draft),
      onSuccess: (_, variables) => variables.refresh === false ? undefined : refreshProducts(),
    }),
    deleteProduct: useMutation({ mutationFn: deleteMenuProduct, onSuccess: refreshProducts }),
    uploadPhoto: useMutation({
      mutationFn: ({ id, photo }: { id: string; photo: Parameters<typeof uploadMenuProductPhoto>[1]; refresh?: boolean }) => uploadMenuProductPhoto(id, photo),
      onSuccess: (_, variables) => variables.refresh === false ? undefined : refreshProducts(),
    }),
    deletePhoto: useMutation({
      mutationFn: ({ id }: { id: string; refresh?: boolean }) => deleteMenuProductPhoto(id),
      onSuccess: (_, variables) => variables.refresh === false ? undefined : refreshProducts(),
    }),
  };
}
