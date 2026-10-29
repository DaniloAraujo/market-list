import { useCallback, useEffect, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'theme';
const MODES = ['system', 'light', 'dark'];
const listeners = new Set();

const readMode = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
};

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const subscribe = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export function useTheme() {
  const mode = useSyncExternalStore(subscribe, readMode, () => 'system');
  const resolvedTheme = mode === 'system' ? (prefersDark() ? 'dark' : 'light') : mode;

  useEffect(() => {
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && prefersDark());
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    if (mode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [mode]);

  const setMode = useCallback((next) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage indisponível: o tema vale só nesta sessão
    }
    listeners.forEach((l) => l());
  }, []);

  return { mode, resolvedTheme, setMode };
}
