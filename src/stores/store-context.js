import { createContext, useContext } from 'react';

export const StoreContext = createContext(null);

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore precisa estar dentro do layout do app');
  return store;
}
