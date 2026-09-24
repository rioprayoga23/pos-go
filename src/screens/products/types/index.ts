import { ScrollView } from "react-native";
import { Category, HppComponent, Product } from "../../../types/pos";

export type ProductForm = {
  name: string;
  price: string;
  stock: string;
  hppComponents: HppComponent[];
  description: string;
  categoryId: string;
  isAvailable: boolean;
  accent: string;
  icon: string;
  image?: Product["image"];
};

export type ProductEditorModel = {
  categories: Category[];
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
    icon: string;
    setIcon: (value: string) => void;
    error: string;
  };
  hppModal: {
    open: () => void;
    close: () => void;
    save: (price: string, components: HppComponent[]) => void;
    visible: boolean;
  };
  financials: {
    hppTotal: number;
    salePrice: number;
    estimatedProfit: number;
    estimatedMargin: number;
  };
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
