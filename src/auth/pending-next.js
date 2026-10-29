const NEXT_KEY = 'auth:next';

/** Guarda para onde voltar depois do login (sobrevive à ida e volta pelo e-mail de confirmação). */
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
      // sem storage: o usuário volta para a página inicial
    }
  },
  clear() {
    try {
      localStorage.removeItem(NEXT_KEY);
    } catch {
      // nada a limpar
    }
  },
};
