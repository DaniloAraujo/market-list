import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useListSocket } from './useListSocket';

const currentKey = (userId) => `cloud:current:${userId}`;

/** Item da API (centavos) -> produto da tela (reais). */
const toProduct = (item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  quantity: item.quantity,
  unitPrice: item.unitPriceCents / 100,
  collected: item.collected,
  createdBy: item.createdBy,
  updatedBy: item.updatedBy,
});

const toCents = (reais) => Math.round((reais || 0) * 100);

/** Campos editáveis do produto -> corpo da API. */
const toApiFields = (fields) => {
  const body = {};
  if ('name' in fields) body.name = fields.name;
  if ('category' in fields) body.category = fields.category;
  if ('quantity' in fields) body.quantity = fields.quantity;
  if ('unitPrice' in fields) body.unitPriceCents = toCents(fields.unitPrice);
  if ('collected' in fields) body.collected = fields.collected;
  return body;
};

const EDITABLE = ['name', 'category', 'quantity', 'unitPrice', 'collected'];

const readSavedCurrent = (userId) => {
  try {
    return localStorage.getItem(currentKey(userId));
  } catch {
    return null;
  }
};

const GONE_MESSAGES = {
  removed: 'Você não tem mais acesso a esta lista.',
  deleted: 'Esta lista foi excluída pelo dono.',
};

/**
 * Store do modo com login: listas na API, atualizadas em tempo real por WebSocket.
 * Mesma interface do store local (useLocalStore), com `mode: 'cloud'`, papéis e limites.
 */
export function useCloudStore(user) {
  const [lists, setLists] = useState({ owned: [], shared: [] });
  const [limits, setLimits] = useState({ maxLists: 3, maxItemsPerList: 150 });
  const [ready, setReady] = useState(false);
  const [preferredId, setPreferredId] = useState(() => readSavedCurrent(user.id));
  const [itemsByList, setItemsByList] = useState({});
  const [connection, setConnection] = useState('connecting');
  const [membersVersion, setMembersVersion] = useState(0);

  // Lista aberta: a preferida se ainda existir, senão a primeira disponível.
  const allLists = useMemo(() => [...lists.owned, ...lists.shared], [lists]);
  const currentId = allLists.some((l) => l.id === preferredId) ? preferredId : (allLists[0]?.id ?? null);

  // Cópias "vivas" para callbacks assíncronos (evitam ler estado velho).
  const latest = useRef({ itemsByList, lists, currentId });
  useEffect(() => {
    latest.current = { itemsByList, lists, currentId };
  });
  const savedNames = useRef({});

  // --- Carregamento ---------------------------------------------------------

  const patchSummary = useCallback((summary) => {
    savedNames.current[summary.id] = summary.name;
    const replace = (arr) => arr.map((l) => (l.id === summary.id ? { ...l, ...summary } : l));
    setLists((prev) => ({ owned: replace(prev.owned), shared: replace(prev.shared) }));
  }, []);

  const refreshLists = useCallback(async () => {
    const data = await api('/v1/lists');
    for (const l of [...data.owned, ...data.shared]) savedNames.current[l.id] = l.name;
    setLists({ owned: data.owned, shared: data.shared });
    setLimits(data.limits);
    setReady(true);
  }, []);

  const dropList = useCallback((listId, reason) => {
    const remove = (arr) => arr.filter((l) => l.id !== listId);
    const name = [...latest.current.lists.owned, ...latest.current.lists.shared].find((l) => l.id === listId)?.name;
    setLists((prev) => ({ owned: remove(prev.owned), shared: remove(prev.shared) }));
    setItemsByList(({ [listId]: _removed, ...rest }) => rest);
    if (reason) toast(name ? `${GONE_MESSAGES[reason]} (${name})` : GONE_MESSAGES[reason]);
  }, []);

  const loadList = useCallback(
    async (listId) => {
      try {
        const { list, items } = await api(`/v1/lists/${listId}`);
        setItemsByList((prev) => ({ ...prev, [listId]: items.map(toProduct) }));
        patchSummary(list);
      } catch (error) {
        if (error.status === 404) dropList(listId, 'removed');
        else toast.error(error.message);
      }
    },
    [patchSummary, dropList]
  );

  useEffect(() => {
    refreshLists().catch((error) => {
      toast.error(error.message);
      setReady(true);
    });
  }, [refreshLists]);

  useEffect(() => {
    if (!currentId) return;
    try {
      localStorage.setItem(currentKey(user.id), currentId);
    } catch {
      // sem storage: a lista aberta não é lembrada
    }
    loadList(currentId);
  }, [currentId, user.id, loadList]);

  // --- Tempo real -------------------------------------------------------------

  const upsert = useCallback((listId, product) => {
    setItemsByList((prev) => {
      const current = prev[listId] ?? [];
      const exists = current.some((p) => p.id === product.id);
      const next = exists ? current.map((p) => (p.id === product.id ? product : p)) : [...current, product];
      return { ...prev, [listId]: next };
    });
  }, []);

  const setItems = useCallback((listId, items) => setItemsByList((prev) => ({ ...prev, [listId]: items })), []);

  const handleEvent = useCallback(
    (event, listId) => {
      switch (event.type) {
        case 'item.created':
        case 'item.updated':
          upsert(listId, toProduct(event.item));
          break;
        case 'item.deleted':
          setItemsByList((prev) => ({ ...prev, [listId]: (prev[listId] ?? []).filter((p) => p.id !== event.itemId) }));
          break;
        case 'items.bulk':
          setItems(listId, event.items.map(toProduct));
          break;
        case 'list.updated': {
          // Não sobrescreve o nome enquanto a própria pessoa o está digitando.
          const typing = document.activeElement?.getAttribute?.('aria-label') === 'Nome da lista';
          if (!typing) patchSummary({ id: listId, name: event.list.name });
          break;
        }
        case 'member.added':
        case 'member.updated':
        case 'member.removed':
          setMembersVersion((v) => v + 1);
          // Se o meu próprio papel mudou, recarrega para liberar/bloquear a edição.
          if (event.type === 'member.updated' && event.member.userId === user.id) loadList(listId);
          break;
        default:
          break;
      }
    },
    [upsert, setItems, patchSummary, loadList, user.id]
  );

  useListSocket(currentId, {
    onEvent: handleEvent,
    onStatus: setConnection,
    onResync: (listId) => {
      refreshLists().catch(() => {});
      loadList(listId);
    },
    onTerminal: (reason, listId) => {
      dropList(listId, reason);
      refreshLists().catch(() => {});
    },
  });

  // Ao voltar para a aba, atualiza os totais das outras listas.
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && refreshLists().catch(() => {});
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshLists]);

  // --- Ações sobre itens (otimistas: mudam a tela na hora e desfazem se a API recusar) ---------

  const itemsOf = (listId) => latest.current.itemsByList[listId] ?? [];

  const addProduct = useCallback(
    async (product) => {
      const listId = latest.current.currentId;
      const { item } = await api(`/v1/lists/${listId}/items`, {
        method: 'POST',
        // Sem categoria escolhida, vai como "outros" (igual ao modo local).
        body: toApiFields({ ...product, category: product.category || 'outros' }),
      });
      upsert(listId, toProduct(item));
    },
    [upsert]
  );

  const patchItem = useCallback(
    async (itemId, fields) => {
      const listId = latest.current.currentId;
      const before = itemsOf(listId).find((p) => p.id === itemId);
      if (!before) return;
      upsert(listId, { ...before, ...fields });
      try {
        const { item } = await api(`/v1/lists/${listId}/items/${itemId}`, {
          method: 'PATCH',
          body: toApiFields(fields),
        });
        upsert(listId, toProduct(item));
      } catch (error) {
        upsert(listId, before);
        toast.error(error.message);
      }
    },
    [upsert]
  );

  const toggleProduct = useCallback(
    (itemId) => {
      const current = itemsOf(latest.current.currentId).find((p) => p.id === itemId);
      if (current) patchItem(itemId, { collected: !current.collected });
    },
    [patchItem]
  );

  const removeProduct = useCallback(
    async (itemId) => {
      const listId = latest.current.currentId;
      setItemsByList((prev) => ({ ...prev, [listId]: (prev[listId] ?? []).filter((p) => p.id !== itemId) }));
      try {
        await api(`/v1/lists/${listId}/items/${itemId}`, { method: 'DELETE' });
      } catch (error) {
        toast.error(error.message);
        loadList(listId);
      }
    },
    [loadList]
  );

  const bulk = useCallback(
    async (action, optimistic) => {
      const listId = latest.current.currentId;
      setItemsByList((prev) => ({ ...prev, [listId]: optimistic(prev[listId] ?? []) }));
      try {
        const { items } = await api(`/v1/lists/${listId}/items/actions`, { method: 'POST', body: { action } });
        setItems(listId, items.map(toProduct));
      } catch (error) {
        toast.error(error.message);
        loadList(listId);
      }
    },
    [setItems, loadList]
  );

  const setAllCollected = useCallback(
    (collected) =>
      bulk(collected ? 'check_all' : 'uncheck_all', (items) => items.map((p) => ({ ...p, collected }))),
    [bulk]
  );
  const clearPrices = useCallback(() => bulk('clear_prices', (items) => items.map((p) => ({ ...p, unitPrice: 0 }))), [bulk]);
  const clearProducts = useCallback(() => bulk('clear_all', () => []), [bulk]);

  /**
   * Desfazer: leva a lista de volta ao estado do `snapshot` recriando, corrigindo ou removendo
   * só o que for diferente (itens apagados voltam com ids novos, o autor passa a ser quem desfez).
   */
  const restoreProducts = useCallback(
    async (snapshot) => {
      const listId = latest.current.currentId;
      const current = itemsOf(listId);
      setItems(listId, snapshot);

      const currentById = new Map(current.map((p) => [p.id, p]));
      const snapshotIds = new Set(snapshot.map((p) => p.id));
      const requests = [];

      for (const item of current) {
        if (!snapshotIds.has(item.id)) {
          requests.push(api(`/v1/lists/${listId}/items/${item.id}`, { method: 'DELETE' }));
        }
      }
      for (const item of snapshot) {
        const existing = currentById.get(item.id);
        if (!existing) {
          requests.push(
            api(`/v1/lists/${listId}/items`, { method: 'POST', body: toApiFields(item) }).then(({ item: created }) =>
              item.collected
                ? api(`/v1/lists/${listId}/items/${created.id}`, { method: 'PATCH', body: { collected: true } })
                : null
            )
          );
          continue;
        }
        const changed = Object.fromEntries(EDITABLE.filter((key) => existing[key] !== item[key]).map((key) => [key, item[key]]));
        if (Object.keys(changed).length > 0) {
          requests.push(api(`/v1/lists/${listId}/items/${item.id}`, { method: 'PATCH', body: toApiFields(changed) }));
        }
      }

      try {
        await Promise.all(requests);
      } catch (error) {
        toast.error(error.message);
      } finally {
        await loadList(listId);
      }
    },
    [setItems, loadList]
  );

  // --- Ações sobre listas ---------------------------------------------------------------

  const createList = useCallback(async () => {
    const name = `Lista ${latest.current.lists.owned.length + 1}`;
    const { list } = await api('/v1/lists', { method: 'POST', body: { name } });
    savedNames.current[list.id] = list.name;
    setLists((prev) => ({ ...prev, owned: [...prev.owned, list] }));
    setItems(list.id, []);
    setPreferredId(list.id);
    return list;
  }, [setItems]);

  const renameList = useCallback(
    (name) => {
      const id = latest.current.currentId;
      setLists((prev) => ({ ...prev, owned: prev.owned.map((l) => (l.id === id ? { ...l, name } : l)) }));
    },
    []
  );

  const commitListName = useCallback(async () => {
    const id = latest.current.currentId;
    const { owned } = latest.current.lists;
    const index = owned.findIndex((l) => l.id === id);
    if (index < 0) return;

    const typed = owned[index].name.trim();
    const name = typed === '' ? `Lista ${index + 1}` : typed;
    if (name !== owned[index].name) renameList(name);
    if (name === savedNames.current[id]) return;

    try {
      await api(`/v1/lists/${id}`, { method: 'PATCH', body: { name } });
      savedNames.current[id] = name;
    } catch (error) {
      toast.error(error.message);
      patchSummary({ id, name: savedNames.current[id] });
    }
  }, [renameList, patchSummary]);

  const deleteLists = useCallback(
    async (ids) => {
      const results = await Promise.allSettled(ids.map((id) => api(`/v1/lists/${id}`, { method: 'DELETE' })));
      const failed = results.find((r) => r.status === 'rejected');
      if (failed) toast.error(failed.reason.message);
      for (const [index, result] of results.entries()) {
        if (result.status === 'fulfilled') dropList(ids[index]);
      }
    },
    [dropList]
  );

  const withCounts = useCallback(
    (list) => {
      const items = itemsByList[list.id];
      if (!items) return list;
      return { ...list, itemCount: items.length, collectedCount: items.filter((p) => p.collected).length };
    },
    [itemsByList]
  );

  const owned = useMemo(() => lists.owned.map(withCounts), [lists.owned, withCounts]);
  const shared = useMemo(() => lists.shared.map(withCounts), [lists.shared, withCounts]);
  const currentList = useMemo(() => [...owned, ...shared].find((l) => l.id === currentId) ?? null, [owned, shared, currentId]);

  return {
    mode: 'cloud',
    ready,
    connection,
    owned,
    shared,
    limits,
    membersVersion,
    currentList,
    products: itemsByList[currentId] ?? [],
    selectList: setPreferredId,
    createList,
    renameList,
    commitListName,
    deleteLists,
    addProduct,
    updateProduct: patchItem,
    toggleProduct,
    removeProduct,
    restoreProducts,
    setAllCollected,
    clearPrices,
    clearProducts,
    refresh: refreshLists,
  };
}
