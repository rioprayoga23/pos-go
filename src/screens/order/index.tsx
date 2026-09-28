import { router } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import { HStack, VStack } from '@gluestack-ui/themed';
import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { AppShell } from '../../components/app-shell';
import { LoadingScreen } from '../../components/loading-screen';
import { QueryErrorNotice } from '../../components/query-error-notice';
import { useCartStore } from '../../store/cartStore';
import { CartPanel } from './components/CartPanel';
import { MenuCatalog } from './components/MenuCatalog';
import { styles } from './styles';
import { useOrderCatalog } from './hooks/useOrderCatalog';

export function OrderScreen() {
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const {
    categories,
    cardWidth,
    mobile,
    filteredProducts,
    handleCatalogLayout,
    onSelectCategory,
    onQueryChange,
    query,
    selectedCategory,
    isLoading,
    isError,
    retry,
  } = useOrderCatalog(isFocused);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const isWide = width >= 1024;
  const handleCheckout = useCallback(
    () => router.navigate('/payment'),
    [],
  );

  return (
    <>
    <AppShell active="Order" scrollable={!isWide}>
      <VStack style={[styles.page, isWide && styles.pageFixed]}>
        {isError ? <QueryErrorNotice onRetry={() => { void retry(); }} /> : null}
        <HStack style={[styles.workspace, !isWide && styles.workspaceStack]}>
          <MenuCatalog
            categories={categories}
            cardWidth={cardWidth}
            mobile={mobile}
            filteredProducts={filteredProducts}
            onAddProduct={addItem}
            onLayout={handleCatalogLayout}
            onQueryChange={onQueryChange}
            onSelectCategory={onSelectCategory}
            query={query}
            selectedCategory={selectedCategory}
            wide={isWide}
          />
          <CartPanel
            items={items}
            onCheckout={handleCheckout}
            onClear={clearCart}
            onQuantity={setQuantity}
            onRemove={removeItem}
            compact={!isWide}
            isScreenFocused={isFocused}
          />
        </HStack>
      </VStack>
    </AppShell>
    <LoadingScreen visible={isLoading} />
    </>
  );
}
