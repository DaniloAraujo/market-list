import { useCallback, useEffect, useRef, useState } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TOKEN_WAIT_MS = 20000;
const CAPTCHA_ERROR = 'Não foi possível validar seu acesso. Recarregue a página e tente de novo.';

export const TURNSTILE_ENABLED = SITE_KEY !== '';

let scriptPromise;

function loadScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => {
      scriptPromise = undefined;
      reject(new Error(CAPTCHA_ERROR));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function useTurnstile() {
  const [container, setContainer] = useState(null);
  const widgetId = useRef(null);
  const token = useRef(null);
  const failed = useRef(false);
  const waiters = useRef([]);

  const flush = useCallback((error) => {
    const pending = waiters.current;
    waiters.current = [];
    pending.forEach(({ resolve, reject, timer }) => {
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(token.current);
    });
  }, []);

  useEffect(() => {
    if (!TURNSTILE_ENABLED || !container) return undefined;
    let cancelled = false;
    failed.current = false;

    loadScript()
      .then((turnstile) => {
        if (cancelled) return;
        widgetId.current = turnstile.render(container, {
          sitekey: SITE_KEY,
          appearance: 'interaction-only',
          theme: 'auto',
          language: 'pt-br',
          callback: (value) => {
            token.current = value;
            flush();
          },
          'expired-callback': () => {
            token.current = null;
          },
          'error-callback': () => {
            token.current = null;
            flush(new Error(CAPTCHA_ERROR));
            return true;
          },
        });
      })
      .catch((error) => {
        failed.current = true;
        flush(error);
      });

    return () => {
      cancelled = true;
      if (widgetId.current !== null) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
      token.current = null;
    };
  }, [container, flush]);

  const getToken = useCallback(() => {
    if (!TURNSTILE_ENABLED) return Promise.resolve(null);
    if (failed.current) return Promise.reject(new Error(CAPTCHA_ERROR));
    if (token.current) return Promise.resolve(token.current);
    return new Promise((resolve, reject) => {
      const entry = { resolve, reject };
      entry.timer = setTimeout(() => {
        waiters.current = waiters.current.filter((waiter) => waiter !== entry);
        reject(new Error(CAPTCHA_ERROR));
      }, TOKEN_WAIT_MS);
      waiters.current.push(entry);
    });
  }, []);

  const reset = useCallback(() => {
    token.current = null;
    if (widgetId.current !== null) window.turnstile?.reset(widgetId.current);
  }, []);

  const withToken = useCallback(
    async (action) => {
      const captcha = await getToken();
      try {
        return await action(captcha);
      } finally {
        reset();
      }
    },
    [getToken, reset]
  );

  return { containerRef: setContainer, withToken };
}
