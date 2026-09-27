import * as ImagePicker from "expo-image-picker";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { useProductStore } from "../../../store/productStore";
import { parseWholeNumber } from "../../../utils/format";
import { useStockStore } from "../../../store/stockStore";
import { colors } from "../../../theme";
import { Product } from "../../../types/pos";
import { emptyForm } from "../constants";
import { ProductForm } from "../types";
import { getAvailablePortions, getRecipeCostBreakdown } from "../../../utils/standardRecipe";

export function useProductsManager() {
  const products = useProductStore((state) => state.products);
  const recipes = useStockStore((state) => state.recipes);
  const inventoryItems = useStockStore((state) => state.items);
  const categories = useProductStore((state) => state.categories);
  const addProduct = useProductStore((state) => state.addProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const addCategory = useProductStore((state) => state.addCategory);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const selectedRecipe = recipes.find((recipe) => recipe.id === form.recipeId);
  const availableStock = getAvailablePortions(inventoryItems, selectedRecipe, recipes);
  const recipeCostLines = getRecipeCostBreakdown(inventoryItems, selectedRecipe, recipes);
  const [formError, setFormError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const formScrollRef = useRef<ScrollView>(null);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          (selectedCategory === "all" ||
            product.categoryId === selectedCategory) &&
          `${product.name} ${product.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [products, query, selectedCategory],
  );
  const productCounts = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.isAvailable).length,
    }),
    [products],
  );

  const pickProductImage = async () => {
    setPhotoError("");
    setIsPickingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) {
        setPhotoError("Gambar tidak dapat dibaca. Silakan pilih ulang.");
        return;
      }

      const supportedExtensions = ["png", "jpg", "jpeg", "webp"];
      const supportedMimeTypes = ["image/png", "image/jpeg", "image/webp"];
      const fileName = asset.fileName?.toLowerCase();
      const extension = fileName?.includes(".")
        ? fileName.split(".").pop()
        : undefined;
      const mimeType = asset.mimeType?.toLowerCase();
      if (
        (extension && !supportedExtensions.includes(extension)) ||
        (mimeType && !supportedMimeTypes.includes(mimeType))
      ) {
        setPhotoError("Gunakan gambar berformat PNG, JPG, atau WEBP.");
        return;
      }

      setForm((current) => ({ ...current, image: { uri: asset.uri } }));
    } catch {
      setPhotoError("Gambar gagal dibuka. Silakan coba pilih kembali.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const clearPhoto = () => {
    setForm((current) => ({ ...current, image: undefined }));
    setPhotoError("");
  };

  const openEdit = useCallback((product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      price: String(product.price),
      recipeId: product.recipeId,
      description: product.description,
      categoryId: product.categoryId,
      isAvailable: product.isAvailable,
      accent: product.accent,
      icon: product.icon,
      image: product.image,
    });
    setFormError("");
    setPhotoError("");
    formScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setPhotoError("");
  };

  const openCategoryModal = () => {
    setCategoryName("");
    setCategoryError("");
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setCategoryName("");
    setCategoryError("");
  };

  const save = () => {
    const price = parseWholeNumber(form.price);
    if (!form.name.trim() || !price) {
      setFormError("Nama menu dan harga wajib diisi.");
      return;
    }
    const category = categories.find((item) => item.id === form.categoryId);
    if (!category) {
      setFormError("Pilih kategori menu terlebih dahulu.");
      return;
    }
    if (!recipes.some((recipe) => recipe.id === form.recipeId && recipe.kind === "menu")) {
      setFormError("Pilih bahan menu yang tersedia.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      price,
      recipeId: form.recipeId,
      description: form.description.trim() || "Menu minuman pilihan",
      categoryId: category.id,
      categoryName: category.name,
      isAvailable: form.isAvailable,
      accent: form.accent,
      icon: form.icon,
      image: form.image,
    };
    if (editing) updateProduct(editing.id, payload);
    else addProduct(payload);
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setPhotoError("");
  };

  const saveCategory = () => {
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setCategoryError("Nama kategori wajib diisi.");
      return;
    }
    if (
      categories.some(
        (category) => category.name.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      setCategoryError("Kategori ini sudah tersedia.");
      return;
    }
    addCategory({ name: trimmedName, tint: colors.surfaceTint });
    const addedCategory = useProductStore.getState().categories.at(-1);
    if (addedCategory) {
      setForm((current) => ({ ...current, categoryId: addedCategory.id }));
    }
    closeCategoryModal();
  };

  return {
    formScrollRef,
    catalog: {
      categories,
      filteredProducts,
      productCounts,
      query,
      setQuery,
      selectedCategory,
      setSelectedCategory,
      editing,
      openEdit,
    },
    editor: {
      categories,
      recipes,
      inventoryItems,
      availableStock,
      editing,
      form,
      setForm,
      formError,
      photoError,
      isPickingImage,
      categoryModal: {
        open: openCategoryModal,
        close: closeCategoryModal,
        save: saveCategory,
        visible: showCategoryModal,
        name: categoryName,
        setName: (value: string) => {
          setCategoryName(value);
          if (categoryError) setCategoryError("");
        },
        error: categoryError,
      },
      recipeCostLines,
      pickProductImage,
      clearPhoto,
      save,
      reset: resetForm,
    },
  };
}
