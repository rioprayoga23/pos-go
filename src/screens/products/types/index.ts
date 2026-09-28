import { ScrollView } from "react-native";
import { Category, Product } from "../../../types/pos";
import type { Recipe, StockItem } from "../../../types/stock";
import type { RecipeCostLine } from "../../../utils/standardRecipe";
import type { MenuRecipeDraft } from "../api";

export type ProductForm = {
  name: string;
  price: string;
  recipeId: string;
  description: string;
  categoryId: string;
  isAvailable: boolean;
  accent: string;
  icon: string;
  image?: Product["image"];
};

export type ProductEditorModel = {
  categories: Category[];
  recipes: Recipe[];
  inventoryItems: StockItem[];
  products: Product[];
  availableStock: number;
  editing: Product | null;
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
  formError: string;
  isSaving: boolean;
  photoError: string;
  isPickingImage: boolean;
  categoryModal: {
    open: () => void;
    close: () => void;
    save: () => Promise<void>;
    isSaving: boolean;
    visible: boolean;
    name: string;
    setName: (value: string) => void;
    error: string;
  };
  recipeActions: {
    create: (draft: MenuRecipeDraft) => Promise<Recipe>;
    update: (id: string, draft: Pick<MenuRecipeDraft, "name" | "ingredients">) => Promise<Recipe>;
    delete: (id: string) => Promise<void>;
  };
  recipeCostLines: RecipeCostLine[] | null;
  pickProductImage: () => Promise<void>;
  clearPhoto: () => void;
  save: () => Promise<void>;
  reset: () => void;
};

export type ProductManagerModel = {
  formScrollRef: React.RefObject<ScrollView | null>;
  editor: ProductEditorModel;
  catalog: ProductCatalogModel;
};

export type ProductCatalogModel = {
  categories: Category[];
  filteredProducts: Product[];
  productCounts: { total: number; active: number };
  query: string;
  setQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  editing: Product | null;
  openEdit: (product: Product) => void;
  deleteProduct: (product: Product) => Promise<void>;
};
