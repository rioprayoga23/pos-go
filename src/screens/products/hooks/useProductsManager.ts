import * as ImagePicker from "expo-image-picker";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { useAppToast } from "../../../components/toast/useAppToast";
import type { Product } from "../../../types/pos";
import { parseWholeNumber } from "../../../utils/format";
import { getAvailablePortions, getRecipeCostBreakdown } from "../../../utils/standardRecipe";
import { emptyForm } from "../constants";
import type { ProductForm } from "../types";
import type { MenuPhotoUpload, MenuRecipeDraft } from "../api";
import { menuProductToProduct, useMenuData, useMenuMutations } from "./useMenuApi";

export function useProductsManager(enabled = true) {
  const toast = useAppToast();
  const menu = useMenuData(enabled);
  const { refreshProducts, ...mutations } = useMenuMutations();
  const products = menu.products;
  const recipes = menu.recipes;
  const inventoryItems = menu.stockItems;
  const categories = menu.categories;

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [pendingPhoto, setPendingPhoto] = useState<MenuPhotoUpload | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const selectedRecipe = recipes.find((recipe) => recipe.id === form.recipeId);
  const availableStock = getAvailablePortions(inventoryItems, selectedRecipe, recipes) ?? 0;
  const recipeCostLines = getRecipeCostBreakdown(inventoryItems, selectedRecipe, recipes);
  const [formError, setFormError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const formScrollRef = useRef<ScrollView>(null);

  const filteredProducts = useMemo(
    () => products.filter((product) =>
      (selectedCategory === "all" || product.categoryId === selectedCategory) &&
      `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase()),
    ),
    [products, query, selectedCategory],
  );
  const productCounts = useMemo(() => ({
    total: products.length,
    active: products.filter((product) => product.isAvailable).length,
  }), [products]);

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
      const fileName = asset.fileName?.toLowerCase() ?? "";
      const extension = fileName.includes(".") ? fileName.split(".").pop() : undefined;
      const mimeType = asset.mimeType?.toLowerCase();
      if (
        (extension && !supportedExtensions.includes(extension)) ||
        (mimeType && !supportedMimeTypes.includes(mimeType))
      ) {
        setPhotoError("Gunakan gambar berformat PNG, JPG, atau WEBP.");
        return;
      }
      const name = asset.fileName || `menu.${extension || "jpg"}`;
      setPendingPhoto({
        uri: asset.uri,
        name,
        type: asset.mimeType || (extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "image/jpeg"),
        ...(asset.file ? { webFile: asset.file } : {}),
      });
      setRemovePhoto(false);
      setForm((current) => ({ ...current, image: { uri: asset.uri } }));
    } catch {
      setPhotoError("Gambar gagal dibuka. Silakan coba pilih kembali.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const clearPhoto = () => {
    setForm((current) => ({ ...current, image: undefined }));
    setRemovePhoto(Boolean(editing?.image));
    setPendingPhoto(null);
    setPhotoError("");
  };

  const openEdit = useCallback((product: Product) => {
    setEditing(product);
    setPendingPhoto(null);
    setRemovePhoto(false);
    setForm({
      name: product.name,
      price: String(product.price),
      recipeId: product.recipeId,
      description: product.description,
      categoryId: product.categoryId,
      isAvailable: product.isAvailable,
      isRecommended: product.isRecommended,
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
    setPendingPhoto(null);
    setRemovePhoto(false);
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

  const save = async () => {
    const price = parseWholeNumber(form.price);
    if (!form.name.trim() || !price) {
      setFormError("Nama menu dan harga wajib diisi.");
      return;
    }
    const category = categories.find((item) => item.id === form.categoryId && item.id !== "all");
    if (!category) {
      setFormError("Pilih kategori menu terlebih dahulu.");
      return;
    }
    if (!recipes.some((recipe) => recipe.id === form.recipeId && recipe.kind === "menu")) {
      setFormError("Pilih bahan menu yang tersedia.");
      return;
    }
    const draft = {
      name: form.name.trim(),
      price,
      recipeId: form.recipeId,
      description: form.description.trim(),
      categoryId: category.id,
      isAvailable: form.isAvailable,
      isRecommended: form.isRecommended,
    };
    setFormError("");
    let productSaved = false;
    try {
      const record = editing
        ? await mutations.updateProduct.mutateAsync({ id: editing.id, draft, refresh: false })
        : await mutations.createProduct.mutateAsync({ draft, refresh: false });
      productSaved = true;
      const savedProduct = menuProductToProduct(record, categories, inventoryItems, recipes);
      setEditing(savedProduct);
      if (pendingPhoto) {
        await mutations.uploadPhoto.mutateAsync({ id: record.id, photo: pendingPhoto, refresh: false });
      } else if (removePhoto) {
        await mutations.deletePhoto.mutateAsync({ id: record.id, refresh: false });
      }
      await refreshProducts();
      toast.success(
        editing ? "Menu diperbarui" : "Menu ditambahkan",
        `${draft.name} berhasil disimpan.`,
      );
      resetForm();
    } catch (error) {
      if (productSaved) {
        await refreshProducts();
        setPhotoError("Menu tersimpan, tetapi foto gagal disimpan. Pilih ulang foto lalu simpan kembali.");
      }
      setFormError("");
      toast.error(
        productSaved ? "Menu tersimpan, foto gagal diperbarui" : "Menu gagal disimpan",
        error instanceof Error ? error.message : "Periksa koneksi lalu coba lagi.",
      );
    }
  };

  const saveCategory = async () => {
    const name = categoryName.trim();
    if (!name) {
      setCategoryError("Nama kategori wajib diisi.");
      return;
    }
    setCategorySaving(true);
    setCategoryError("");
    try {
      const category = await mutations.createCategory.mutateAsync(name);
      setForm((current) => ({ ...current, categoryId: category.id }));
      closeCategoryModal();
      toast.success("Kategori ditambahkan", `${category.name} siap digunakan.`);
    } catch (error) {
      setCategoryError("");
      toast.error("Kategori gagal disimpan", error instanceof Error ? error.message : "Coba lagi.");
    } finally {
      setCategorySaving(false);
    }
  };

  const isMutating = Object.values(mutations).some((mutation) => mutation.isPending);
  const removeProduct = async (product: Product) => {
    await mutations.deleteProduct.mutateAsync(product.id);
    if (editing?.id === product.id) resetForm();
    toast.success("Menu dihapus", `${product.name} berhasil dihapus.`);
  };

  return {
    isLoading: menu.isLoading,
    isError: menu.isError,
    retry: () => { void menu.refetch(); },
    isMutating,
    mutations,
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
      deleteProduct: removeProduct,
    },
    editor: {
      categories,
      recipes,
      inventoryItems,
      products,
      availableStock,
      editing,
      form,
      setForm,
      formError,
      isSaving: isMutating,
      photoError,
      isPickingImage,
      categoryModal: {
        open: openCategoryModal,
        close: closeCategoryModal,
        save: saveCategory,
        isSaving: categorySaving,
        visible: showCategoryModal,
        name: categoryName,
        setName: (value: string) => {
          setCategoryName(value);
          if (categoryError) setCategoryError("");
        },
        error: categoryError,
      },
      recipeActions: {
        create: (draft: MenuRecipeDraft) => mutations.createRecipe.mutateAsync(draft),
        update: (id: string, draft: Pick<MenuRecipeDraft, "name" | "ingredients">) => mutations.updateRecipe.mutateAsync({ id, draft }),
        delete: (id: string) => mutations.deleteRecipe.mutateAsync(id),
      },
      recipeCostLines,
      pickProductImage,
      clearPhoto,
      save,
      reset: resetForm,
    },
  };
}
