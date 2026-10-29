import { useMemo } from 'react';
import { useShoppingLists } from '@/hooks/useShoppingLists';

const summarize = (list) => ({
  id: list.id,
  name: list.name,
  role: 'owner',
  owner: null,
  itemCount: list.products.length,
  collectedCount: list.products.filter((p) => p.collected).length,
});

export function useLocalStore() {
  const local = useShoppingLists();

  const owned = useMemo(() => local.lists.map(summarize), [local.lists]);
  const currentList = useMemo(
    () => (local.currentList ? summarize(local.currentList) : null),
    [local.currentList]
  );

  return {
    mode: 'local',
    ready: true,
    connection: null,
    owned,
    shared: [],
    limits: null,
    categories: local.categories,
    createCategory: async (input) => local.addCategory(input),
    deleteCategory: async (id) => local.removeCategory(id),
    membersVersion: 0,
    currentList,
    products: local.products,
    selectList: local.selectList,
    createList: async () => local.createList(),
    renameList: local.renameList,
    commitListName: local.commitListName,
    deleteLists: async (ids) => local.deleteLists(ids),
    addProduct: async (product) => local.addProduct(product),
    updateProduct: local.updateProduct,
    toggleProduct: local.toggleProduct,
    removeProduct: local.removeProduct,
    restoreProducts: local.restoreProducts,
    setAllCollected: local.setAllCollected,
    clearPrices: local.clearPrices,
    clearProducts: local.clearProducts,
    refresh: async () => {},
  };
}
