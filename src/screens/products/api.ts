import type { Category, Product } from "../../types/pos";
import type { Recipe, RecipeKind, RecipeIngredient } from "../../types/stock";
import { apiClient, getApiBaseUrl } from "../../services/apiClient";
import type { ApiEnvelope } from "../../services/apiTypes";

export type ApiMenuCategory = Pick<Category, "id" | "name">;

export type MenuRecipeDraft = {
  name: string;
  kind: RecipeKind;
  ingredients: RecipeIngredient[];
};

export type MenuProductRecord = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  recipeId: string;
  price: number;
  isAvailable: boolean;
  photoUrl?: string;
  createdAt: string;
};

export type MenuProductDraft = Pick<
  Product,
  "name" | "description" | "categoryId" | "recipeId" | "price" | "isAvailable"
>;

export type MenuPhotoUpload = {
  uri: string;
  name: string;
  type: string;
  webFile?: Blob;
};

function apiPhotoUrl(path?: string) {
  if (!path) return undefined;
  return /^https?:\/\//i.test(path) ? path : `${getApiBaseUrl()}${path}`;
}

function recipeToApi(recipe: RecipeIngredient) {
  return recipe.type === "stock"
    ? { type: recipe.type, itemId: recipe.itemId, quantity: recipe.quantity }
    : { type: recipe.type, recipeId: recipe.recipeId, quantity: recipe.quantity };
}

function recipeFromApi(recipe: Recipe): Recipe {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) => ({ ...ingredient })),
  };
}

function productFromApi(product: MenuProductRecord): MenuProductRecord {
  return { ...product, photoUrl: apiPhotoUrl(product.photoUrl) };
}

export async function listMenuCategories(signal?: AbortSignal) {
  const result = await apiClient.get<ApiEnvelope<ApiMenuCategory[]>>("/menu-categories", signal);
  return result.data;
}

export async function createMenuCategory(name: string) {
  const result = await apiClient.post<ApiEnvelope<ApiMenuCategory>>("/menu-categories", { name });
  return result.data;
}

export async function listMenuRecipes(signal?: AbortSignal) {
  const result = await apiClient.get<ApiEnvelope<Recipe[]>>("/recipes", signal);
  return result.data.map(recipeFromApi);
}

export async function createMenuRecipe(draft: MenuRecipeDraft) {
  const result = await apiClient.post<ApiEnvelope<Recipe>>("/recipes", {
    name: draft.name,
    kind: draft.kind,
    ingredients: draft.ingredients.map(recipeToApi),
  });
  return recipeFromApi(result.data);
}

export async function updateMenuRecipe(id: string, draft: Pick<MenuRecipeDraft, "name" | "ingredients">) {
  const result = await apiClient.patch<ApiEnvelope<Recipe>>(`/recipes/${id}`, {
    name: draft.name,
    ingredients: draft.ingredients.map(recipeToApi),
  });
  return recipeFromApi(result.data);
}

export async function deleteMenuRecipe(id: string) {
  return apiClient.delete(`/recipes/${id}`);
}

export async function listMenuProducts(signal?: AbortSignal) {
  const result = await apiClient.get<ApiEnvelope<MenuProductRecord[]>>("/menu-products", signal);
  return result.data.map(productFromApi);
}

export async function createMenuProduct(draft: MenuProductDraft) {
  const result = await apiClient.post<ApiEnvelope<MenuProductRecord>>("/menu-products", draft);
  return productFromApi(result.data);
}

export async function updateMenuProduct(id: string, draft: MenuProductDraft) {
  const result = await apiClient.patch<ApiEnvelope<MenuProductRecord>>(`/menu-products/${id}`, draft);
  return productFromApi(result.data);
}

export async function deleteMenuProduct(id: string) {
  return apiClient.delete(`/menu-products/${id}`);
}

export async function uploadMenuProductPhoto(id: string, photo: MenuPhotoUpload) {
  const form = new FormData();
  if (photo.webFile) {
    form.append("file", photo.webFile, photo.name);
  } else {
    form.append("file", {
      uri: photo.uri,
      name: photo.name,
      type: photo.type,
    } as unknown as Blob);
  }
  const result = await apiClient.postMultipart<ApiEnvelope<MenuProductRecord>>(
    `/menu-products/${id}/photo`,
    form,
  );
  return productFromApi(result.data);
}

export async function deleteMenuProductPhoto(id: string) {
  return apiClient.delete(`/menu-products/${id}/photo`);
}
