import { create } from "zustand";
import type { Recipe, RecipeIngredient, RecipeKind, StockItem, StockMovement } from "../types/stock";
import { canFulfillRecipes, defaultBaseRecipe, defaultRecipe, getRequiredStock, initialRecipeItems } from "../utils/standardRecipe";
import { getLocalDateKey } from "../utils/date";
import { demoStockMovements } from "../data/demoData";

type CollectionUpdate<T> = T[] | ((current: T[]) => T[]);

type StockState = {
  items: StockItem[];
  movements: StockMovement[];
  recipes: Recipe[];
  setItems: (update: CollectionUpdate<StockItem>) => void;
  setMovements: (update: CollectionUpdate<StockMovement>) => void;
  replaceRecipes: (recipes: Recipe[]) => void;
  addRecipe: (draft: { name: string; kind: RecipeKind; ingredients: RecipeIngredient[] }) => string | null;
  updateRecipe: (id: string, draft: { name: string; kind: RecipeKind; ingredients: RecipeIngredient[] }) => boolean;
  deleteRecipe: (id: string) => boolean;
  consumeForOrder: (selections: { recipeId: string; quantity: number }[], orderNumber: string) => boolean;
};

let nextRecipeId = 0;

function isValidRecipeDraft(
  draft: { name: string; kind: RecipeKind; ingredients: RecipeIngredient[] },
  items: StockItem[],
  recipes: Recipe[],
  editingId?: string,
): boolean {
  const name = draft.name.trim().toLowerCase();
  const availableIds = new Set(items.map((item) => item.id));
  const ingredientIds = draft.ingredients.map((part) =>
    part.type === "stock" ? `stock:${part.itemId}` : `base:${part.recipeId}`,
  );
  const validIngredients = draft.ingredients.every((part) => {
    if (!Number.isFinite(part.quantity) || part.quantity <= 0) return false;
    if (part.type === "stock") return availableIds.has(part.itemId);
    const base = recipes.find((recipe) => recipe.id === part.recipeId);
    return draft.kind === "menu" && base?.kind === "base";
  });
  const onlyStockInBase = draft.kind !== "base" || draft.ingredients.every((part) => part.type === "stock");
  return Boolean(name) &&
    !recipes.some((recipe) => recipe.id !== editingId && recipe.name.trim().toLowerCase() === name) &&
    ingredientIds.length > 0 &&
    new Set(ingredientIds).size === ingredientIds.length &&
    onlyStockInBase && validIngredients;
}

export const useStockStore = create<StockState>((set, get) => ({
  items: initialRecipeItems,
  movements: demoStockMovements,
  recipes: [defaultBaseRecipe, defaultRecipe],
  setItems: (update) =>
    set((state) => ({
      items: typeof update === "function" ? update(state.items) : update,
    })),
  setMovements: (update) =>
    set((state) => ({
      movements:
        typeof update === "function" ? update(state.movements) : update,
    })),
  replaceRecipes: (recipes) => set({ recipes }),
  addRecipe: (draft) => {
    if (!isValidRecipeDraft(draft, get().items, get().recipes)) return null;
    const id = `recipe-${Date.now()}-${++nextRecipeId}`;
    set((state) => ({
      recipes: [...state.recipes, {
        id,
        name: draft.name.trim(),
        kind: draft.kind,
        ingredients: draft.ingredients.map((part) => ({ ...part })),
      }],
    }));
    return id;
  },
  updateRecipe: (id, draft) => {
    const existing = get().recipes.find((recipe) => recipe.id === id);
    if (!existing || existing.kind !== draft.kind ||
      !isValidRecipeDraft(draft, get().items, get().recipes, id)) return false;
    set((state) => ({
      recipes: state.recipes.map((recipe) => recipe.id === id
        ? { ...recipe, name: draft.name.trim(), kind: draft.kind, ingredients: draft.ingredients.map((part) => ({ ...part })) }
        : recipe),
    }));
    return true;
  },
  deleteRecipe: (id) => {
    const recipes = get().recipes;
    if (
      !recipes.some((recipe) => recipe.id === id) ||
      recipes.some((recipe) => recipe.ingredients.some((part) => part.type === "base" && part.recipeId === id))
    ) return false;
    set((state) => ({ recipes: state.recipes.filter((recipe) => recipe.id !== id) }));
    return true;
  },
  consumeForOrder: (selections, orderNumber) => {
    const current = get();
    if (!canFulfillRecipes(current.items, current.recipes, selections)) return false;
    const required = getRequiredStock(selections, current.recipes);
    if (!required) return false;
    const now = new Date();
    const dateKey = getLocalDateKey(now);
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const consumed = current.items.filter((item) => required.has(item.id));
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        stock: item.stock - (required.get(item.id) ?? 0),
      })),
      movements: [
        ...consumed.map((item): StockMovement => ({
          id: `sale-${orderNumber}-${item.id}`,
          dateKey,
          time: `Hari ini, ${time} WIB`,
          itemId: item.id,
          item: item.name,
          type: "sale",
          quantity: -(required.get(item.id) ?? 0),
          unit: item.unit,
          note: `Penjualan ${orderNumber}`,
        })),
        ...state.movements,
      ],
    }));
    return true;
  },
}));
