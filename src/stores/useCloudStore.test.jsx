import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { useCloudStore } from './useCloudStore';

vi.mock('@/lib/api', () => ({ api: vi.fn(), ApiError: class ApiError extends Error {} }));
vi.mock('./useListSocket', () => ({ useListSocket: () => {} }));
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }) }));

const LIST = { id: 'l1', name: 'Mercado', role: 'owner', owner: { id: 'u1', name: 'Ana' }, itemCount: 1, collectedCount: 0 };

const apiItem = (overrides = {}) => ({
  id: 'i1',
  name: 'Arroz',
  category: 'alimentos',
  quantity: 1,
  unitPriceCents: 0,
  note: '',
  collected: false,
  createdBy: null,
  updatedBy: null,
  ...overrides,
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setupApi({ items = [apiItem()], onPatch, onAction } = {}) {
  api.mockImplementation((path, options = {}) => {
    const method = options.method ?? 'GET';
    if (path === '/v1/lists') {
      return Promise.resolve({ owned: [LIST], shared: [], limits: { maxLists: 3, maxItemsPerList: 150 } });
    }
    if (path === '/v1/lists/l1' && method === 'GET') {
      return Promise.resolve({ list: LIST, items, categories: [] });
    }
    if (method === 'PATCH') return onPatch(path, options);
    if (path.endsWith('/items/actions')) return onAction(path, options);
    return Promise.resolve({});
  });
}

async function mountStore() {
  const hook = renderHook(() => useCloudStore({ id: 'u1' }));
  await waitFor(() => expect(hook.result.current.products).toHaveLength(1));
  return hook;
}

const collectedOf = (hook) => hook.result.current.products.find((p) => p.id === 'i1').collected;

beforeEach(() => {
  api.mockReset();
  localStorage.clear();
});

afterEach(cleanup);

describe('edições otimistas', () => {
  it('marca o item na hora, antes da resposta da API', async () => {
    const pending = deferred();
    setupApi({ onPatch: () => pending.promise });
    const hook = await mountStore();

    act(() => hook.result.current.toggleProduct('i1'));
    expect(collectedOf(hook)).toBe(true);

    await act(async () => pending.resolve({ item: apiItem({ collected: true }) }));
    expect(collectedOf(hook)).toBe(true);
  });

  it('ignora a resposta antiga quando chega depois de uma edição mais nova', async () => {
    const first = deferred();
    const second = deferred();
    const queue = [first, second];
    setupApi({ onPatch: () => queue.shift().promise });
    const hook = await mountStore();

    act(() => hook.result.current.toggleProduct('i1'));
    act(() => hook.result.current.toggleProduct('i1'));
    expect(collectedOf(hook)).toBe(false);

    await act(async () => second.resolve({ item: apiItem({ collected: false }) }));
    await act(async () => first.resolve({ item: apiItem({ collected: true }) }));

    expect(collectedOf(hook)).toBe(false);
  });

  it('não desfaz a edição mais nova quando uma requisição antiga falha', async () => {
    const first = deferred();
    const second = deferred();
    const third = deferred();
    const queue = [first, second, third];
    setupApi({ onPatch: () => queue.shift().promise });
    const hook = await mountStore();

    act(() => hook.result.current.toggleProduct('i1'));
    act(() => hook.result.current.toggleProduct('i1'));
    act(() => {
      hook.result.current.updateProduct('i1', { name: 'Arroz integral' });
    });

    await act(async () => first.reject(new Error('sem sinal')));
    expect(hook.result.current.products[0].name).toBe('Arroz integral');

    await act(async () => {
      second.resolve({ item: apiItem() });
      third.resolve({ item: apiItem({ name: 'Arroz integral' }) });
    });
    expect(hook.result.current.products[0].name).toBe('Arroz integral');
  });

  it('volta ao valor anterior quando a última edição falha', async () => {
    const pending = deferred();
    setupApi({ onPatch: () => pending.promise });
    const hook = await mountStore();

    act(() => hook.result.current.toggleProduct('i1'));
    expect(collectedOf(hook)).toBe(true);

    await act(async () => pending.reject(new Error('sem sinal')));
    expect(collectedOf(hook)).toBe(false);
  });

  it('não deixa a resposta de uma ação em massa apagar uma edição feita depois', async () => {
    const bulk = deferred();
    const patch = deferred();
    setupApi({ onAction: () => bulk.promise, onPatch: () => patch.promise });
    const hook = await mountStore();

    act(() => {
      hook.result.current.setAllCollected(true);
    });
    act(() => hook.result.current.toggleProduct('i1'));
    expect(collectedOf(hook)).toBe(false);

    await act(async () => bulk.resolve({ items: [apiItem({ collected: true })] }));
    await act(async () => patch.resolve({ item: apiItem({ collected: false }) }));

    expect(collectedOf(hook)).toBe(false);
  });
});

describe('uso sem internet', () => {
  it('mostra as últimas listas salvas quando a API não responde', async () => {
    localStorage.setItem(
      'cloud:snapshot:u1',
      JSON.stringify({
        lists: { owned: [LIST], shared: [] },
        limits: { maxLists: 3, maxItemsPerList: 150 },
        itemsByList: { l1: [{ id: 'i1', name: 'Arroz', category: 'alimentos', quantity: 1, unitPrice: 0, note: '', collected: false }] },
        categoriesByList: { l1: [] },
      })
    );
    api.mockImplementation(() => Promise.reject(new Error('Não foi possível falar com o servidor.')));

    const hook = renderHook(() => useCloudStore({ id: 'u1' }));

    expect(hook.result.current.ready).toBe(true);
    expect(hook.result.current.currentList?.name).toBe('Mercado');
    expect(hook.result.current.products.map((product) => product.name)).toEqual(['Arroz']);
  });

  it('guarda as listas sincronizadas para a próxima vez', async () => {
    setupApi({ onPatch: () => Promise.resolve({}) });
    await mountStore();

    await waitFor(() => expect(localStorage.getItem('cloud:snapshot:u1')).not.toBeNull());
    const saved = JSON.parse(localStorage.getItem('cloud:snapshot:u1'));
    expect(saved.lists.owned[0].name).toBe('Mercado');
    expect(saved.itemsByList.l1[0].name).toBe('Arroz');
  });

  it('sem dados salvos e sem internet, abre vazio em vez de travar', async () => {
    api.mockImplementation(() => Promise.reject(new Error('Não foi possível falar com o servidor.')));
    const hook = renderHook(() => useCloudStore({ id: 'u1' }));

    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(hook.result.current.products).toEqual([]);
    expect(localStorage.getItem('cloud:snapshot:u1')).toBeNull();
  });
});
