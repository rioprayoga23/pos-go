import type { Recipe, RecipeIngredient, StockItem } from "../types/stock";

export type RecipeCostLine = {
  itemId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
};

export const defaultBaseRecipeId = "recipe-base-drink";
export const defaultRecipeId = "recipe-default";

export const standardBaseIngredients: RecipeIngredient[] = [
  { type: "stock", itemId: "recipe-water", quantity: 200 },
  { type: "stock", itemId: "recipe-ice", quantity: 200 },
  { type: "stock", itemId: "recipe-container", quantity: 1 },
  { type: "stock", itemId: "recipe-straw", quantity: 1 },
  { type: "stock", itemId: "recipe-bag", quantity: 1 },
];

export const defaultBaseRecipe: Recipe = {
  id: defaultBaseRecipeId,
  name: "Bahan Utama Minuman",
  kind: "base",
  ingredients: standardBaseIngredients,
};

export const defaultRecipe: Recipe = {
  id: defaultRecipeId,
  name: "Matcha Latte",
  kind: "menu",
  ingredients: [
    { type: "base", recipeId: defaultBaseRecipeId, quantity: 1 },
    { type: "stock", itemId: "recipe-powder-matcha", quantity: 1 },
  ],
};

const initialStockCatalog = [
  { id: "recipe-powder-matcha", name: "Bubuk Matcha", unit: "sachet", stock: 10, avgPrice: 6500 },
  { id: "recipe-powder-taro", name: "Bubuk Taro", unit: "sachet", stock: 17, avgPrice: 5500 },
  { id: "recipe-water", name: "Air", unit: "ml", purchaseUnit: "galon", stockUnitsPerPurchaseUnit: 19000, stock: 6000, avgPrice: 23000 / 19000 },
  { id: "recipe-ice", name: "Es Batu", unit: "ml", stock: 6000, avgPrice: 2 },
  { id: "recipe-container", name: "Botol & Tutup", unit: "pcs", stock: 30, avgPrice: 1200 },
  { id: "recipe-straw", name: "Sedotan", unit: "pcs", stock: 30, avgPrice: 150 },
  { id: "recipe-bag", name: "Kantong Plastik", unit: "pcs", stock: 30, avgPrice: 200 },
] as const;

export const initialRecipeItems: StockItem[] = initialStockCatalog.map((item) => ({
  id: item.id,
  name: item.name,
  description: "",
  stock: item.stock,
  unit: item.unit,
  ...("purchaseUnit" in item ? { purchaseUnit: item.purchaseUnit } : {}),
  ...("stockUnitsPerPurchaseUnit" in item ? { stockUnitsPerPurchaseUnit: item.stockUnitsPerPurchaseUnit } : {}),
  avgPrice: item.avgPrice,
}));

/** Expand menu/base formulas into the raw stock items that are actually consumed. */
export function getRecipeStockRequirements(
  recipe: Recipe | undefined,
  recipes: Recipe[],
  multiplier = 1,
): Map<string, number> | null {
  if (!recipe || !recipe.ingredients.length || !Number.isSafeInteger(multiplier) || multiplier <= 0) return null;

  const recipesById = new Map(recipes.map((entry) => [entry.id, entry]));
  const required = new Map<string, number>();
  const expand = (current: Recipe, factor: number, ancestors: Set<string>): boolean => {
    if (!current.ingredients.length || ancestors.has(current.id)) return false;
    const nextAncestors = new Set(ancestors).add(current.id);
    for (const part of current.ingredients) {
      if (!Number.isSafeInteger(part.quantity) || part.quantity <= 0) return false;
      if (part.type === "stock") {
        required.set(part.itemId, (required.get(part.itemId) ?? 0) + part.quantity * factor);
      } else {
        const base = recipesById.get(part.recipeId);
        if (!base || base.kind !== "base" || current.kind !== "menu") return false;
        if (!expand(base, part.quantity * factor, nextAncestors)) return false;
      }
    }
    return true;
  };

  return expand(recipe, multiplier, new Set()) && required.size ? required : null;
}

export function getAvailablePortions(
  items: StockItem[],
  recipe?: Recipe,
  recipes: Recipe[] = recipe ? [recipe] : [],
): number {
  const required = getRecipeStockRequirements(recipe, recipes);
  if (!required) return 0;
  const byId = new Map(items.map((item) => [item.id, item.stock]));
  return Math.max(0, Math.min(...[...required].map(([itemId, quantity]) =>
    Math.floor((byId.get(itemId) ?? 0) / quantity),
  )));
}

export function getRecipeHpp(
  items: StockItem[],
  recipe?: Recipe,
  recipes: Recipe[] = recipe ? [recipe] : [],
): number | null {
  const breakdown = getRecipeCostBreakdown(items, recipe, recipes);
  return breakdown?.reduce((total, line) => total + line.total, 0) ?? null;
}

export function getRecipeCostBreakdown(
  items: StockItem[],
  recipe?: Recipe,
  recipes: Recipe[] = recipe ? [recipe] : [],
): RecipeCostLine[] | null {
  const required = getRecipeStockRequirements(recipe, recipes);
  if (!required) return null;
  const byId = new Map(items.map((item) => [item.id, item]));
  const lines: RecipeCostLine[] = [];
  for (const [itemId, quantity] of required) {
    const item = byId.get(itemId);
    if (!item || !Number.isFinite(item.avgPrice) || item.avgPrice <= 0) return null;
    lines.push({
      itemId: item.id,
      name: item.name,
      quantity,
      unit: item.unit,
      unitPrice: item.avgPrice,
      total: quantity * item.avgPrice,
    });
  }
  return lines;
}

export function getRequiredStock(
  selections: { recipeId: string; quantity: number }[],
  recipes: Recipe[],
): Map<string, number> | null {
  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const required = new Map<string, number>();
  if (!selections.length) return null;
  for (const selection of selections) {
    const recipe = byId.get(selection.recipeId);
    if (recipe?.kind !== "menu" || !Number.isSafeInteger(selection.quantity) || selection.quantity <= 0) return null;
    const recipeStock = getRecipeStockRequirements(recipe, recipes, selection.quantity);
    if (!recipeStock) return null;
    for (const [itemId, quantity] of recipeStock) {
      required.set(itemId, (required.get(itemId) ?? 0) + quantity);
    }
  }
  return required;
}

export function canFulfillRecipes(
  items: StockItem[],
  recipes: Recipe[],
  selections: { recipeId: string; quantity: number }[],
): boolean {
  const required = getRequiredStock(selections, recipes);
  if (!required) return false;
  const byId = new Map(items.map((item) => [item.id, item.stock]));
  return [...required].every(([itemId, quantity]) => (byId.get(itemId) ?? 0) >= quantity);
}
