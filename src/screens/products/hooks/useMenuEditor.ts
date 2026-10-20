import * as ImagePicker from "expo-image-picker";
import { useLayoutEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  createMenuProduct,
  updateMenuProduct,
  uploadMenuProductPhoto,
  deleteMenuProductPhoto,
  type MenuPhotoUpload,
  type MenuProductRecord,
} from "../api";
import {
  createEditorDraft,
  summarizeDraft,
  validateEditorDraft,
} from "../editorModel";
import type { StockItem } from "../../../types/stock";
import type { Category } from "../../../types/pos";

export function useMenuEditor(
  product: MenuProductRecord | undefined,
  items: StockItem[],
  categories: Category[],
) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => createEditorDraft(product));
  const [savedDraft, setSavedDraft] = useState(() =>
    JSON.stringify(createEditorDraft(product)),
  );
  const [savedId, setSavedId] = useState(product?.id);
  const [photo, setPhoto] = useState<MenuPhotoUpload | null>(null);
  const [image, setImage] = useState(
    product?.photoUrl ? { uri: product.photoUrl } : undefined,
  );
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [picking, setPicking] = useState(false);
  const pickingRef = useRef(false);
  const latestDraft = useRef(draft);
  useLayoutEffect(() => {
    latestDraft.current = draft;
  }, [draft]);
  const [finished, setFinished] = useState(false);
  const [photoPending, setPhotoPending] = useState(false);
  const dirty =
    !finished &&
    (JSON.stringify(draft) !== savedDraft || Boolean(photo) || removePhoto);
  const summary = summarizeDraft(draft, items);
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["menu"] }),
      queryClient.invalidateQueries({ queryKey: ["cashier", "inventory"] }),
    ]);
  async function pickPhoto() {
    if (busyRef.current || pickingRef.current) return;
    pickingRef.current = true;
    setPicking(true);
    setPhotoError("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset || (asset.fileSize && asset.fileSize > 5 * 1024 * 1024)) {
        setPhotoError("Pilih foto maksimal 5 MB.");
        return;
      }
      const type = asset.mimeType ?? "image/jpeg";
      if (!["image/jpeg", "image/png", "image/webp"].includes(type)) {
        setPhotoError("Gunakan foto PNG, JPG, atau WEBP.");
        return;
      }
      setPhoto({
        uri: asset.uri,
        name: asset.fileName ?? "menu.jpg",
        type,
        ...(asset.file ? { webFile: asset.file } : {}),
      });
      setImage({ uri: asset.uri });
      setRemovePhoto(false);
    } catch {
      setPhotoError("Foto gagal dibuka. Coba pilih kembali.");
    } finally {
      pickingRef.current = false;
      setPicking(false);
    }
  }
  async function save() {
    if (busyRef.current || pickingRef.current) return;
    const nextErrors = validateEditorDraft(
      draft,
      items,
      categories
        .filter((category) => category.id !== "all")
        .map((category) => category.id),
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setError("Periksa bagian yang ditandai sebelum menyimpan.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError("");
    setPhotoError("");
    let id = savedId;
    try {
      const snapshot = JSON.stringify(draft);
      if (!id || snapshot !== savedDraft) {
        const request = {
          ...draft,
          name: draft.name.trim(),
          description: draft.description.trim(),
          price: Number(draft.price),
          ingredients: draft.ingredients.map((part) => ({
            itemId: part.itemId,
            quantity: Number(part.quantity),
          })),
        };
        const record = id
          ? await updateMenuProduct(id, request)
          : await createMenuProduct(request);
        id = record.id;
        setSavedId(id);
        setSavedDraft(snapshot);
        queryClient.setQueryData(["menu", "detail", id], record);
      }
      try {
        if (photo) await uploadMenuProductPhoto(id!, photo);
        else if (removePhoto) await deleteMenuProductPhoto(id!);
      } catch (photoFailure) {
        setPhotoPending(true);
        setPhotoError(
          photoFailure instanceof Error
            ? photoFailure.message
            : "Foto gagal disimpan.",
        );
        await refresh();
        return;
      }
      setPhoto(null);
      setRemovePhoto(false);
      setPhotoPending(false);
      await refresh();
      // Fields remain editable during the request. Keep any newer draft open
      // instead of closing the form after saving an older snapshot.
      if (JSON.stringify(latestDraft.current) === snapshot) setFinished(true);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Menu gagal disimpan. Coba lagi.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return {
    draft,
    setDraft,
    summary,
    dirty,
    errors,
    error,
    busy,
    finished,
    save,
    image,
    photoError,
    photoPending,
    picking,
    pickPhoto,
    clearPhoto: () => {
      if (busyRef.current || pickingRef.current) return;
      setImage(undefined);
      setPhoto(null);
      setRemovePhoto(Boolean(product?.photoUrl));
      setPhotoError("");
      setPhotoPending(false);
    },
  };
}
