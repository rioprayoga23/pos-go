import { ScrollView } from "react-native";
import { Category, Product } from "../../../types/pos";
import type { Recipe, StockItem } from "../../../types/stock";
import type { RecipeCostLine } from "../../../utils/standardRecipe";

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
  availableStock: number;
  editing: Product | null;
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
  formError: string;
  photoError: string;
  isPickingImage: boolean;
  categoryModal: {
    open: () => void;
    close: () => void;
    save: () => void;
    visible: boolean;
    name: string;
    setName: (value: string) => void;
    error: string;
  };
  recipeCostLines: RecipeCostLine[] | null;
  pickProductImage: () => Promise<void>;
  clearPhoto: () => void;
  save: () => void;
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
};
