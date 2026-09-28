import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { spacing } from '../../../theme';
import { useMenuData } from '../../products/hooks/useMenuApi';

export function useOrderCatalog() {
  const { width } = useWindowDimensions();
  const menu = useMenuData();
  const categories = menu.categories;
  const products = menu.products;
  const [query, onQueryChange] = useState('');
  const [selectedCategory, onSelectCategory] = useState('all');
  const [catalogWidth, setCatalogWidth] = useState(0);
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.isAvailable &&
          product.stock > 0 &&
          (selectedCategory === 'all' || product.categoryId === selectedCategory) &&
          `${product.name} ${product.categoryName}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [products, query, selectedCategory],
  );
  const mobile = width < 768;
  const columns = catalogWidth > 0
    ? catalogWidth >= 600 ? 3 : 2
    : width >= 1280 ? 3 : 2;
  const cardWidth = catalogWidth > 0
    ? Math.max(0, (catalogWidth - spacing.md * (columns - 1)) / columns)
    : undefined;
  const handleCatalogLayout = useCallback(
    (nextWidth: number) => setCatalogWidth(nextWidth),
    [],
  );

  return {
    categories,
    cardWidth,
    mobile,
    filteredProducts,
    isLoading: menu.isLoading,
    isError: menu.isError,
    retry: menu.refetch,
    handleCatalogLayout,
    onQueryChange,
    onSelectCategory,
    query,
    selectedCategory,
  };
}
