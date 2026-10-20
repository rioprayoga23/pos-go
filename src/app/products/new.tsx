import { router } from "expo-router";
import { ProductsScreen } from "../../screens/products/index";

export default function NewMenu() {
  return (
    <ProductsScreen
      initialEditor={{ kind: "new" }}
      onEditorClose={() => router.replace("/products")}
    />
  );
}
