const NEXT_KEY = 'auth:next';

export const pendingNext = {
  get() {
    try {
      return localStorage.getItem(NEXT_KEY);
    } catch {
      return null;
    }
  },
  set(next) {
    try {
      if (next) localStorage.setItem(NEXT_KEY, next);
    } catch {
    }
  },
  clear() {
    try {
      localStorage.removeItem(NEXT_KEY);
    } catch {
    }
  },
};
