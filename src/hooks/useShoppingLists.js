import { useCallback, useEffect, useMemo, useState } from 'react';

export const STORAGE_KEY = 'shoppingLists';

const newId = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

const makeList = (name, products = []) => ({ id: newId(), name, products, createdAt: Date.now() });

const loadLists = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch {
    // dado corrompido: começa uma lista nova
  }
  return [makeList('Lista 1')];
};

// Lista vinda de um link compartilhado (?list=...), se houver
const readSharedList = () => {
  const shared = new URLSearchParams(window.location.search).get('list');
  if (!shared) return null;
  try {
    const data = JSON.parse(atob(shared));
    return makeList(
      data.name,
      data.products.map((p) => ({ ...p, id: newId() }))
    );
  } catch (e) {
    console.error('Erro ao importar lista compartilhada:', e);
    return null;
  }
};

const init = () => {
  const saved = loadLists();
  const imported = readSharedList();
  if (!imported) return { lists: saved, currentId: saved[0].id };
  return { lists: [...saved, imported], currentId: imported.id };
};

/** Listas salvas neste navegador (modo sem login). */
export const readStoredLists = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

/** Remove listas do armazenamento local, por exemplo depois de importá-las para a conta. */
export const removeStoredLists = (ids) => {
  const remaining = readStoredLists().filter((list) => !ids.includes(list.id));
  if (remaining.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  else localStorage.removeItem(STORAGE_KEY);
};

const mapList = (lists, listId, fn) => lists.map((l) => (l.id === listId ? fn(l) : l));

export function useShoppingLists() {
  const [initial] = useState(init);
  const [lists, setLists] = useState(initial.lists);
  const [currentListId, setCurrentListId] = useState(initial.currentId);

  useEffect(() => {
    if (lists.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists]);

  // A lista compartilhada já foi importada na inicialização; limpa o parâmetro da URL
  useEffect(() => {
    if (window.location.search.includes('list=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const currentList = lists.find((l) => l.id === currentListId) ?? lists[0];
  const products = useMemo(() => currentList?.products ?? [], [currentList]);
  const listId = currentList?.id;

  const updateProducts = useCallback(
    (fn) => setLists((prev) => mapList(prev, listId, (l) => ({ ...l, products: fn(l.products) }))),
    [listId]
  );

  const createList = useCallback(() => {
    const list = makeList(`Lista ${lists.length + 1}`);
    setLists((prev) => [...prev, list]);
    setCurrentListId(list.id);
  }, [lists.length]);

  const renameList = useCallback(
    (name) => setLists((prev) => mapList(prev, listId, (l) => ({ ...l, name }))),
    [listId]
  );

  // Se o nome ficar vazio ao sair do campo, volta para "Lista N"
  const commitListName = useCallback(() => {
    setLists((prev) =>
      prev.map((l, i) => (l.id === listId && l.name.trim() === '' ? { ...l, name: `Lista ${i + 1}` } : l))
    );
  }, [listId]);

  const deleteLists = useCallback(
    (ids) => {
      const remaining = lists.filter((l) => !ids.includes(l.id));
      if (remaining.length === 0) return;
      setLists(remaining);
      if (ids.includes(currentListId)) setCurrentListId(remaining[0].id);
    },
    [lists, currentListId]
  );

  const addProduct = useCallback(
    ({ name, category, quantity, unitPrice }) =>
      updateProducts((items) => [
        ...items,
        {
          id: newId(),
          name: name.trim(),
          category: category || 'outros',
          quantity: quantity > 0 ? quantity : 1,
          unitPrice: unitPrice || 0,
          collected: false,
          timestamp: Date.now(),
        },
      ]),
    [updateProducts]
  );

  const updateProduct = useCallback(
    (id, data) => updateProducts((items) => items.map((p) => (p.id === id ? { ...p, ...data } : p))),
    [updateProducts]
  );

  const toggleProduct = useCallback(
    (id) => updateProducts((items) => items.map((p) => (p.id === id ? { ...p, collected: !p.collected } : p))),
    [updateProducts]
  );

  const removeProduct = useCallback(
    (id) => updateProducts((items) => items.filter((p) => p.id !== id)),
    [updateProducts]
  );

  const restoreProducts = useCallback(
    (snapshot) => updateProducts(() => snapshot),
    [updateProducts]
  );

  const setAllCollected = useCallback(
    (collected) => updateProducts((items) => items.map((p) => ({ ...p, collected }))),
    [updateProducts]
  );

  const clearPrices = useCallback(
    () => updateProducts((items) => items.map((p) => ({ ...p, unitPrice: 0 }))),
    [updateProducts]
  );

  const clearProducts = useCallback(() => updateProducts(() => []), [updateProducts]);

  return {
    lists,
    currentList,
    products,
    selectList: setCurrentListId,
    createList,
    renameList,
    commitListName,
    deleteLists,
    addProduct,
    updateProduct,
    toggleProduct,
    removeProduct,
    restoreProducts,
    setAllCollected,
    clearPrices,
    clearProducts,
  };
}
