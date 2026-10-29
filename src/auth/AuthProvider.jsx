import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { API_ENABLED, api, onUnauthorized, tokenStorage } from '@/lib/api';
import { AuthContext } from './auth-context';

export default function AuthProvider({ children }) {
  const [state, setState] = useState(() => ({
    status: API_ENABLED && tokenStorage.get() ? 'loading' : 'guest',
    user: null,
  }));

  useEffect(() => {
    if (state.status !== 'loading') return;
    let cancelled = false;
    api('/v1/me')
      .then(({ user }) => !cancelled && setState({ status: 'authed', user }))
      .catch((error) => {
        if (cancelled) return;
        if (error.status === 401) tokenStorage.clear();
        setState({ status: 'guest', user: null });
      });
    return () => {
      cancelled = true;
    };
  }, [state.status]);

  useEffect(
    () =>
      onUnauthorized(() => {
        tokenStorage.clear();
        setState((current) => {
          if (current.status === 'authed') toast.error('Sua sessão expirou. Entre de novo.');
          return { status: 'guest', user: null };
        });
      }),
    []
  );

  const startSession = useCallback(({ token, user }) => {
    tokenStorage.set(token);
    setState({ status: 'authed', user });
  }, []);

  const login = useCallback(
    async (email, password, captcha) =>
      startSession(await api('/v1/auth/login', { method: 'POST', body: { email, password }, token: null, captcha })),
    [startSession]
  );

  const exchangeCode = useCallback(
    async (code) => startSession(await api('/v1/auth/exchange', { method: 'POST', body: { code }, token: null })),
    [startSession]
  );

  const logout = useCallback(async () => {
    try {
      await api('/v1/auth/logout', { method: 'POST', body: {} });
    } catch {
    }
    tokenStorage.clear();
    setState({ status: 'guest', user: null });
  }, []);

  const deleteAccount = useCallback(async (confirmEmail) => {
    await api('/v1/me', { method: 'DELETE', body: { confirmEmail } });
    tokenStorage.clear();
    setState({ status: 'guest', user: null });
  }, []);

  const updateUser = useCallback((user) => setState((current) => (current.status === 'authed' ? { ...current, user } : current)), []);

  const value = useMemo(
    () => ({ ...state, enabled: API_ENABLED, login, exchangeCode, logout, deleteAccount, updateUser }),
    [state, login, exchangeCode, logout, deleteAccount, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
