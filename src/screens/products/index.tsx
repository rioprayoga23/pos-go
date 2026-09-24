import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HStack, VStack } from "@gluestack-ui/themed";
import { useWindowDimensions } from "react-native";
import { AppShell } from "../../components/app-shell";
import { RootStackParamList } from "../../navigation/types";
import { ProductCatalog } from "./components/ProductCatalog";
import { ProductEditor } from "./components/ProductEditor";
import { styles } from "./styles";
import { useProductsManager } from "./hooks/useProductsManager";

type Props = NativeStackScreenProps<RootStackParamList, "Products">;

export function ProductsScreen(_props: Props) {
  const { width } = useWindowDimensions();
  const { formScrollRef, editor, catalog } = useProductsManager();
  const isWide = width >= 1024;

  return (
    <AppShell active="Products" scrollable={false}>
      <VStack style={styles.page}>
        <HStack style={[styles.layout, !isWide && styles.layoutStack]}>
          <ProductEditor model={editor} formScrollRef={formScrollRef} />
          <ProductCatalog model={catalog} />
        </HStack>
      </VStack>
    </AppShell>
  );
}
