import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGIN = 'https://app.test';
const SOURCE = readFileSync(join(process.cwd(), 'public', 'sw.js'), 'utf8');

const keyOf = (input) => (typeof input === 'string' ? new URL(input, ORIGIN).href : input.url);

function createCaches() {
  const stores = new Map();
  const open = async (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name);
    return {
      match: async (input) => store.get(keyOf(input))?.clone(),
      put: async (input, response) => {
        store.set(keyOf(input), response);
      },
      add: async (input) => {
        store.set(keyOf(input), new Response('shell'));
      },
    };
  };
  return {
    open,
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
    stores,
  };
}

function loadWorker(fetchImpl) {
  const listeners = {};
  const caches = createCaches();
  const worker = {
    addEventListener: (type, handler) => {
      listeners[type] = handler;
    },
    location: { origin: ORIGIN },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
  };
  new Function('self', 'caches', 'fetch', SOURCE)(worker, caches, fetchImpl);

  const dispatch = async (request) => {
    let response;
    let handled = false;
    listeners.fetch({
      request,
      respondWith: (value) => {
        handled = true;
        response = value;
      },
    });
    return handled ? await response : undefined;
  };

  return { caches, dispatch, listeners };
}

const page = (path = '/') => {
  const request = new Request(`${ORIGIN}${path}`);
  Object.defineProperty(request, 'mode', { value: 'navigate' });
  return request;
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('service worker', () => {
  it('abre o app sem internet com a última versão guardada', async () => {
    let online = true;
    const fetchImpl = vi.fn(async () => {
      if (!online) throw new TypeError('offline');
      return new Response('<html>app</html>');
    });
    const { dispatch } = loadWorker(fetchImpl);

    expect(await (await dispatch(page('/'))).text()).toBe('<html>app</html>');

    online = false;
    const offline = await dispatch(page('/graficos'));
    expect(await offline.text()).toBe('<html>app</html>');
  });

  it('usa a versão guardada quando a rede demora demais', async () => {
    const { dispatch, caches } = loadWorker(() => new Promise(() => {}));
    const shell = await caches.open('shell-v2');
    await shell.put('/', new Response('guardado'));

    const pending = dispatch(page('/'));
    await vi.advanceTimersByTimeAsync(4100);
    expect(await (await pending).text()).toBe('guardado');
  });

  it('guarda arquivos versionados e não pede de novo à rede', async () => {
    const fetchImpl = vi.fn(async () => new Response('codigo'));
    const { dispatch } = loadWorker(fetchImpl);
    const asset = () => new Request(`${ORIGIN}/assets/index-abc.js`);

    expect(await (await dispatch(asset())).text()).toBe('codigo');
    expect(await (await dispatch(asset())).text()).toBe('codigo');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('não mexe em chamadas da API, em outros domínios nem em escritas', async () => {
    const { dispatch } = loadWorker(vi.fn());

    expect(await dispatch(new Request('https://api.tanalistaapp.com/v1/lists'))).toBeUndefined();
    expect(await dispatch(new Request(`${ORIGIN}/v1/lists`, { method: 'POST', body: '{}' }))).toBeUndefined();
    expect(await dispatch(new Request(`${ORIGIN}/sw.js`))).toBeUndefined();
  });

  it('apaga caches de versões antigas ao ativar', async () => {
    const { listeners, caches } = loadWorker(vi.fn());
    await caches.open('shell-v1');
    await caches.open('shell-v2');

    let done;
    listeners.activate({ waitUntil: (promise) => (done = promise) });
    await done;

    expect(await caches.keys()).toEqual(['shell-v2']);
  });
});
