import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWindowDimensions } from 'react-native';
import { spacing } from '../../../theme';
import { debounce } from '../../../utils/debounce';
import {
  menuProductToProduct,
  menuQueryKeys,
  useMenuData,
} from '../../products/hooks/useMenuApi';
import { searchMenuProducts } from '../../products/api';

export function useOrderCatalog(enabled = true) {
  const { width } = useWindowDimensions();
  const menu = useMenuData(enabled);
  const categories = menu.categories;
  const products = menu.products;
  const [query, onQueryChange] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, onSelectCategory] = useState('all');
  const [catalogWidth, setCatalogWidth] = useState(0);
  const scheduleSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    [],
  );
  useEffect(() => {
    scheduleSearch(query.trim());
    return scheduleSearch.cancel;
  }, [query, scheduleSearch]);

  const searchQuery = useQuery({
    queryKey: menuQueryKeys.searchProducts(searchTerm),
    queryFn: ({ signal }) => searchMenuProducts(searchTerm, signal),
    enabled: enabled && searchTerm.length > 0,
  });
  const filteredProducts = useMemo(
    () => {
      const sourceProducts = searchTerm
        ? (searchQuery.data ?? []).map((product) =>
            menuProductToProduct(product, menu.categories, menu.stockItems, menu.recipes),
          )
        : products;
      return sourceProducts.filter((product) =>
        selectedCategory === 'all' || product.categoryId === selectedCategory,
      );
    },
    [
      menu.categories,
      menu.recipes,
      menu.stockItems,
      products,
      searchQuery.data,
      searchTerm,
      selectedCategory,
    ],
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
    isLoading: menu.isLoading || searchQuery.isFetching,
    isError: menu.isError || Boolean(searchTerm && searchQuery.isError),
    retry: () => (searchTerm ? searchQuery.refetch() : menu.refetch()),
    handleCatalogLayout,
    onQueryChange,
    onSelectCategory,
    query,
    selectedCategory,
  };
}
