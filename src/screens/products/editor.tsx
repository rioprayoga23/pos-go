import { Text } from "@gluestack-ui/themed";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Switch,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { AppInput, ModalFormActions } from "../../components/ui";
import {
  ActionButton,
  Field,
  FormDialog,
  ui,
} from "../../components/management";
import { DropdownSelect } from "../../components/dropdown-select";
import { useMenuData, useMenuMutations } from "./hooks/useMenuApi";
import { useMenuEditor } from "./hooks/useMenuEditor";
import { useUnsavedMenu } from "./hooks/useUnsavedMenu";
import { getMenuProduct, type MenuProductRecord } from "./api";
import { PhotoField } from "./components/PhotoField";
import { MenuIngredientsField } from "./components/MenuIngredientsField";
import { MenuPricingPanel } from "./components/MenuPricingPanel";
import { editorStyles as styles, menuEditorMaxWidth } from "./editorStyles";
import { colors, spacing } from "../../theme";
import { useAppToast } from "../../components/toast/useAppToast";

export type MenuEditorTarget = { kind: "new" } | { kind: "edit"; id: string };

export function MenuEditorModal({
  id,
  menu,
  onClose,
}: {
  id?: string;
  menu: ReturnType<typeof useMenuData>;
  onClose: () => void;
}) {
  const detail = useQuery({
    queryKey: ["menu", "detail", id],
    queryFn: ({ signal }) => getMenuProduct(id!, signal),
    enabled: Boolean(id),
  });
  const loading = menu.isLoading || Boolean(id && detail.isPending);
  const loadError = menu.isError || Boolean(id && detail.isError);
  if (loading || (loadError && (!id || !detail.data)))
    return (
      <FormDialog
        title={id ? "Edit Menu" : "Tambah Menu"}
        onClose={onClose}
        footer={
          <ModalFormActions
            primaryLabel={loadError ? "Coba lagi" : "Tutup"}
            onPrimary={() => {
              if (loadError) {
                void menu.refetch();
                if (id) void detail.refetch();
              } else {
                onClose();
              }
            }}
            onSecondary={loadError ? onClose : undefined}
          />
        }
      >
        {loadError ? (
          <Text style={ui.error} accessibilityRole="alert">
            Data menu gagal dimuat. Periksa koneksi lalu coba lagi.
          </Text>
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={ui.muted}>Menyiapkan form menu…</Text>
          </View>
        )}
      </FormDialog>
    );
  return (
    <MenuEditorForm
      key={id ?? "new"}
      product={detail.data}
      menu={menu}
      onClose={onClose}
    />
  );
}

function MenuEditorForm({
  product,
  menu,
  onClose,
}: {
  product?: MenuProductRecord;
  menu: ReturnType<typeof useMenuData>;
  onClose: () => void;
}) {
  const editor = useMenuEditor(product, menu.stockItems, menu.categories);
  const { draft, setDraft, summary } = editor;
  const mutations = useMenuMutations();
  const guard = useUnsavedMenu(editor.dirty, editor.busy);
  const toast = useAppToast();
  const { width } = useWindowDimensions();
  const compact = width < 768;
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const handledFinish = useRef(false);
  useEffect(() => {
    if (!editor.finished || handledFinish.current) return;
    handledFinish.current = true;
    toast.success(
      product ? "Menu diperbarui" : "Menu ditambahkan",
      "Menu dan komposisi berhasil disimpan.",
    );
    onClose();
  }, [editor.finished, product, toast, onClose]);
  function update<K extends keyof typeof draft>(
    key: K,
    value: (typeof draft)[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  async function addCategory() {
    if (!categoryName.trim() || mutations.createCategory.isPending) {
      setCategoryError("Isi nama kategori.");
      return;
    }
    try {
      const category = await mutations.createCategory.mutateAsync(
        categoryName.trim(),
      );
      update("categoryId", category.id);
      setCategoryOpen(false);
      setCategoryName("");
      setCategoryError("");
    } catch (failure) {
      setCategoryError(
        failure instanceof Error ? failure.message : "Kategori gagal disimpan.",
      );
    }
  }
  const back = () => guard.requestLeave(onClose);
  return (
    <>
      <FormDialog
        title={product ? "Edit Menu" : "Tambah Menu"}
        onClose={back}
        busy={editor.busy}
        maxWidth={menuEditorMaxWidth}
        dense
        footer={
          <View style={{ gap: spacing.sm }}>
            <View style={styles.footerMessage}>
              {editor.error ? (
                <Text accessibilityRole="alert" style={ui.error}>
                  {editor.error}
                </Text>
              ) : editor.photoPending ? (
                <Text accessibilityRole="alert" style={ui.error}>
                  Foto belum tersimpan: {editor.photoError}
                </Text>
              ) : null}
            </View>
            <ModalFormActions
              primaryLabel={editor.photoPending ? "Coba lagi" : "Simpan"}
              onPrimary={() => {
                setShowErrors(true);
                void editor.save();
              }}
              primaryBusy={editor.busy}
              primaryDisabled={
                mutations.createCategory.isPending || editor.picking
              }
              onSecondary={back}
              secondaryDisabled={editor.busy}
            />
          </View>
        }
      >
        {menu.isError ? (
          <View style={ui.notice}>
            <Text style={ui.error}>Data stok gagal diperbarui.</Text>
            <ActionButton
              label="Coba lagi"
              onPress={() => void menu.refetch()}
            />
          </View>
        ) : null}
        <View style={styles.layout}>
          <View style={styles.main}>
            <View
              style={[
                styles.identityFields,
                compact && { flexDirection: "column" },
              ]}
            >
              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                  width: compact ? "100%" : undefined,
                }}
              >
                <Field
                  label="Nama menu"
                  required
                  error={showErrors ? editor.errors.name : undefined}
                >
                  <AppInput
                    value={draft.name}
                    onChangeText={(value) => update("name", value)}
                    placeholder="Contoh: Kopi Susu"
                    accessibilityLabel="Nama menu minuman"
                  />
                </Field>
              </View>
              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                  width: compact ? "100%" : undefined,
                }}
              >
                <Field
                  label="Kategori"
                  required
                  error={showErrors ? editor.errors.categoryId : undefined}
                >
                  <DropdownSelect
                    value={draft.categoryId}
                    onChange={(value) =>
                      value === "__new_category__"
                        ? setCategoryOpen(true)
                        : update("categoryId", value)
                    }
                    options={[
                      ...menu.categories
                        .filter((category) => category.id !== "all")
                        .map((category) => ({
                          value: category.id,
                          label: category.name,
                        })),
                      { value: "__new_category__", label: "Kategori baru…" },
                    ]}
                    placeholder="Pilih kategori"
                    accessibilityLabel="Kategori menu"
                  />
                </Field>
              </View>
            </View>
            <View style={ui.divider} />
            <MenuIngredientsField
              ingredients={draft.ingredients}
              items={menu.stockItems}
              lines={summary.lines}
              viewportWidth={width}
              errors={showErrors ? editor.errors : undefined}
              onChange={(next) =>
                setDraft((current) => ({
                  ...current,
                  ingredients:
                    typeof next === "function"
                      ? next(current.ingredients)
                      : next,
                }))
              }
              onManageStock={() =>
                guard.requestLeave(() => router.navigate("/stock"))
              }
            />
            <MenuPricingPanel
              price={draft.price}
              onPriceChange={(value) => update("price", value)}
              summary={summary}
              compact={compact}
              error={showErrors ? editor.errors.price : undefined}
            />
            <View style={styles.optionalFields}>
              <PhotoField
                form={{ name: draft.name, image: editor.image }}
                error={editor.photoError}
                isPickingImage={editor.picking}
                isMobile={compact}
                isTablet={width >= 768 && width < 1024}
                onPick={editor.pickPhoto}
                onClear={editor.clearPhoto}
              />
              <Field label="Deskripsi" error={editor.errors.description}>
                <AppInput
                  value={draft.description}
                  onChangeText={(value) => update("description", value)}
                  placeholder="Keterangan menu"
                  accessibilityLabel="Deskripsi menu"
                  multiline
                  numberOfLines={4}
                />
              </Field>
              <View style={styles.settingRow}>
                <Text style={ui.label}>Rekomendasi</Text>
                <Switch
                  value={draft.isRecommended}
                  onValueChange={(value) => update("isRecommended", value)}
                  accessibilityLabel="Menu rekomendasi"
                  thumbColor={colors.white}
                  {...(Platform.OS === "web"
                    ? { activeThumbColor: colors.white }
                    : {})}
                  trackColor={{
                    true: colors.primary,
                    false: colors.lineStrong,
                  }}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={ui.label}>Tampilkan di Kasir</Text>
                <Switch
                  value={draft.isAvailable}
                  onValueChange={(value) => update("isAvailable", value)}
                  accessibilityLabel="Tampilkan di Kasir"
                  thumbColor={colors.white}
                  {...(Platform.OS === "web"
                    ? { activeThumbColor: colors.white }
                    : {})}
                  trackColor={{
                    true: colors.primary,
                    false: colors.lineStrong,
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </FormDialog>
      {categoryOpen ? (
        <FormDialog
          title="Kategori Baru"
          onClose={() => setCategoryOpen(false)}
          busy={mutations.createCategory.isPending}
          footer={
            <ModalFormActions
              primaryLabel="Simpan Kategori"
              onPrimary={() => void addCategory()}
              primaryBusy={mutations.createCategory.isPending}
              onSecondary={() => setCategoryOpen(false)}
              secondaryDisabled={mutations.createCategory.isPending}
            />
          }
        >
          <Field label="Nama kategori" required error={categoryError}>
            <AppInput
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Contoh: Kopi"
              accessibilityLabel="Nama kategori baru"
            />
          </Field>
        </FormDialog>
      ) : null}
      {guard.pending ? (
        <FormDialog
          title="Tinggalkan perubahan?"
          onClose={guard.cancelLeave}
          footer={
            <ModalFormActions
              primaryLabel="Lanjutkan Edit"
              onPrimary={guard.cancelLeave}
              onSecondary={guard.discard}
              secondaryLabel="Tinggalkan"
              secondaryTone="danger"
            />
          }
        >
          <Text style={ui.muted}>
            Perubahan yang belum disimpan akan dibuang.
          </Text>
        </FormDialog>
      ) : null}
    </>
  );
}
