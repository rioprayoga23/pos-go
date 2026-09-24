import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { HStack, VStack } from '@gluestack-ui/themed';
import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { AppShell } from '../../components/app-shell';
import { RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../store/cartStore';
import { CartPanel } from './components/CartPanel';
import { MenuCatalog } from './components/MenuCatalog';
import { styles } from './styles';
import { useOrderCatalog } from './hooks/useOrderCatalog';

type Props = NativeStackScreenProps<RootStackParamList, 'Order'>;

export function OrderScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const {
    categories,
    cardWidth,
    filteredProducts,
    handleCatalogLayout,
    onSelectCategory,
    onQueryChange,
    query,
    selectedCategory,
  } = useOrderCatalog();
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const isWide = width >= 1024;
  const handleCheckout = useCallback(
    () => navigation.navigate('Payment'),
    [navigation],
  );

  return (
    <AppShell active="Order" scrollable={!isWide}>
      <VStack style={[styles.page, isWide && styles.pageFixed]}>
        <HStack style={[styles.workspace, !isWide && styles.workspaceStack]}>
          <MenuCatalog
            categories={categories}
            cardWidth={cardWidth}
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
  );
}
