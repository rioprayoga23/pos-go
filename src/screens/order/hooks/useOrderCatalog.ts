import { useCallback, useMemo, useState } from 'react';
import { useProductStore } from '../../../store/productStore';
import { spacing } from '../../../theme';

export function useOrderCatalog() {
  const categories = useProductStore((state) => state.categories);
  const products = useProductStore((state) => state.products);
  const [query, onQueryChange] = useState('');
  const [selectedCategory, onSelectCategory] = useState('all');
  const [catalogWidth, setCatalogWidth] = useState(0);
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.isAvailable &&
          (selectedCategory === 'all' || product.categoryId === selectedCategory) &&
          `${product.name} ${product.categoryName}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [products, query, selectedCategory],
  );
  const cardWidth =
    catalogWidth > 0
      ? Math.max(0, (catalogWidth - spacing.md * 2) / 3)
      : undefined;
  const handleCatalogLayout = useCallback(
    (nextWidth: number) => setCatalogWidth(nextWidth),
    [],
  );

  return {
    categories,
    cardWidth,
    filteredProducts,
    handleCatalogLayout,
    onQueryChange,
    onSelectCategory,
    query,
    selectedCategory,
  };
}
