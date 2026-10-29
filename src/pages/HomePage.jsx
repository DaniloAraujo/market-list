import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/auth-context';
import { CategoriesContext } from '@/categories/categories-context';
import BottomNav from '@/components/BottomNav';
import ImportListsModal from '@/components/modals/ImportListsModal';
import Logo from '@/components/Logo';
import { StoreContext } from '@/stores/store-context';
import { useCloudStore } from '@/stores/useCloudStore';
import { useLocalStore } from '@/stores/useLocalStore';

function Frame({ store, children }) {
  const { limits } = store;

  const categoriesValue = useMemo(
    () => ({
      custom: store.categories,
      create: store.createCategory,
      remove: store.deleteCategory,
      maxCustom: limits?.maxCategoriesPerList ?? 20,
    }),
    [store.categories, store.createCategory, store.deleteCategory, limits]
  );

  return (
    <StoreContext.Provider value={store}>
      <CategoriesContext.Provider value={categoriesValue}>
        <div className="min-h-dvh pb-[calc(var(--nav-h)+1rem)]">
          <Outlet />
        </div>
        <BottomNav pending={store.products.filter((product) => !product.collected).length} />
        {children}
      </CategoriesContext.Provider>
    </StoreContext.Provider>
  );
}

function GuestHome() {
  const store = useLocalStore();
  return <Frame store={store} />;
}

function CloudHome({ user }) {
  const store = useCloudStore(user);
  return (
    <Frame store={store}>
      <ImportListsModal userId={user.id} store={store} />
    </Frame>
  );
}

export default function HomePage() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="grid min-h-dvh place-content-center">
        <Logo title="Carregando" className="h-16 w-16 animate-pulse" />
      </div>
    );
  }
  return status === 'authed' ? <CloudHome key={user.id} user={user} /> : <GuestHome key="guest" />;
}
