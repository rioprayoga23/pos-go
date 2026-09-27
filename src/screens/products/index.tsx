import { HStack, VStack } from "@gluestack-ui/themed";
import { useRef } from "react";
import { useWindowDimensions, type ScrollView } from "react-native";
import { AppShell } from "../../components/app-shell";
import { ProductCatalog } from "./components/ProductCatalog";
import { ProductEditor } from "./components/ProductEditor";
import { styles } from "./styles";
import { useProductsManager } from "./hooks/useProductsManager";

export function ProductsScreen() {
  const { width } = useWindowDimensions();
  const { formScrollRef, editor, catalog } = useProductsManager();
  const pageScrollRef = useRef<ScrollView>(null);
  const isWide = width >= 1024;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const catalogModel = {
    ...catalog,
    openEdit: (product: Parameters<typeof catalog.openEdit>[0]) => {
      catalog.openEdit(product);
      pageScrollRef.current?.scrollTo({ y: 0, animated: true });
    },
  };

  return (
    <AppShell
      active="Products"
      scrollRef={pageScrollRef}
      scrollable={isMobile}
    >
      <VStack style={[styles.page, isMobile && styles.pageMobile]}>
        <HStack
          style={[
            styles.layout,
            !isWide && styles.layoutStack,
            isMobile && styles.layoutMobile,
          ]}
        >
          <ProductEditor
            model={editor}
            formScrollRef={formScrollRef}
            isMobile={isMobile}
            isTablet={isTablet}
          />
          <ProductCatalog model={catalogModel} isMobile={isMobile} isTablet={isTablet} />
        </HStack>
      </VStack>
    </AppShell>
  );
}
