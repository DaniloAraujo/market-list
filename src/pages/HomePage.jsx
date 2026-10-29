import { useAuth } from '@/auth/auth-context';
import ImportListsModal from '@/components/modals/ImportListsModal';
import ShoppingList from '@/ShoppingList';
import { useCloudStore } from '@/stores/useCloudStore';
import { useLocalStore } from '@/stores/useLocalStore';
import Logo from '@/components/Logo';

function GuestHome() {
  const store = useLocalStore();
  return <ShoppingList store={store} />;
}

function CloudHome({ user }) {
  const store = useCloudStore(user);
  return (
    <>
      <ShoppingList store={store} />
      <ImportListsModal userId={user.id} store={store} />
    </>
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
  // O key recria a tela ao trocar de conta/sair, recarregando as listas da fonte certa.
  return status === 'authed' ? <CloudHome key={user.id} user={user} /> : <GuestHome key="guest" />;
}
