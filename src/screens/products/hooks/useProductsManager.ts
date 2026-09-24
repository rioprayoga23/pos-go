import * as ImagePicker from "expo-image-picker";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { useProductStore } from "../../../store/productStore";
import { colors } from "../../../theme";
import { HppComponent, Product } from "../../../types/pos";
import { emptyForm, initialForm } from "../constants";
import { ProductForm } from "../types";

export function useProductsManager() {
  const products = useProductStore((state) => state.products);
  const categories = useProductStore((state) => state.categories);
  const addProduct = useProductStore((state) => state.addProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const addCategory = useProductStore((state) => state.addCategory);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showHppModal, setShowHppModal] = useState(false);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [formError, setFormError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("local_bar");
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
      stock: String(product.stock),
      hppComponents: product.hppComponents?.map((component) => ({ ...component })) ?? [
        {
          id: `hpp-base-${product.id}`,
          name: "Biaya bahan & kemasan",
          detail: "Modal pokok per porsi",
          icon: "cash-multiple",
          cost: product.hpp ?? 11500,
        },
      ],
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
    setCategoryIcon("local_bar");
    setCategoryError("");
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setCategoryName("");
    setCategoryIcon("local_bar");
    setCategoryError("");
  };

  const saveHpp = (price: string, hppComponents: HppComponent[]) => {
    setForm((current) => ({ ...current, price, hppComponents }));
    setFormError("");
    setShowHppModal(false);
  };

  const hppTotal = form.hppComponents.reduce(
    (total, component) => total + component.cost,
    0,
  );
  const salePrice = Number(form.price.replace(/\D/g, ""));
  const estimatedProfit = salePrice - hppTotal;
  const estimatedMargin = salePrice > 0
    ? Math.round((estimatedProfit / salePrice) * 100)
    : 0;

  const save = () => {
    const price = Number(form.price.replace(/\D/g, ""));
    if (!form.name.trim() || !price) {
      setFormError("Nama menu dan harga wajib diisi.");
      return;
    }
    const stock = Number(form.stock);
    if (!form.stock.trim() || !Number.isInteger(stock) || stock < 0) {
      setFormError("Stok harus berupa angka bulat nol atau lebih.");
      return;
    }
    const category = categories.find((item) => item.id === form.categoryId);
    if (!category) {
      setFormError("Pilih kategori menu terlebih dahulu.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      price,
      stock,
      hpp: form.hppComponents.reduce((total, component) => total + component.cost, 0),
      hppComponents: form.hppComponents,
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
        icon: categoryIcon,
        setIcon: setCategoryIcon,
        error: categoryError,
      },
      hppModal: {
        open: () => setShowHppModal(true),
        close: () => setShowHppModal(false),
        save: saveHpp,
        visible: showHppModal,
      },
      financials: { hppTotal, salePrice, estimatedProfit, estimatedMargin },
      pickProductImage,
      clearPhoto,
      save,
      reset: resetForm,
    },
  };
}
