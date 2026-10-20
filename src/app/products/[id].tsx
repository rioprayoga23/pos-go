import { router, useLocalSearchParams } from "expo-router";
import { ProductsScreen } from "../../screens/products/index";

export default function EditMenu() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ProductsScreen
      initialEditor={{ kind: "edit", id }}
      onEditorClose={() => router.replace("/products")}
    />
  );
}
