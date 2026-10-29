import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/auth/auth-context';
import Sidebar, { Brand } from '@/components/Sidebar';
import Header from '@/components/Header';
import ListHeader from '@/components/ListHeader';
import AddProductForm from '@/components/AddProductForm';
import ProductList from '@/components/ProductList';
import EditProductDialog from '@/components/EditProductDialog';
import EmptyState from '@/components/EmptyState';
import ShareDialog from '@/components/ShareDialog';
import TotalBar from '@/components/TotalBar';
import { Button } from '@/components/ui/button';
import ClearCartModal from '@/components/modals/ClearCartModal';
import DeleteListsModal from '@/components/modals/DeleteListsModal';
import LoginRequiredModal from '@/components/modals/LoginRequiredModal';
import DeleteAccountModal from '@/components/modals/DeleteAccountModal';

const celebrate = async () => {
  const { default: confetti } = await import('canvas-confetti');
  const colors = ['#f97316', '#1e3a8a', '#22c55e', '#fbbf24'];
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors, disableForReducedMotion: true });
};

/**
 * Tela principal. Não sabe de onde vêm as listas: recebe um `store`, que é o armazenamento local
 * (sem login) ou o da nuvem (com login), ambos com a mesma interface.
 */
export default function ShoppingList({ store }) {
  const { user, enabled: authEnabled, logout, deleteAccount } = useAuth();
  const { owned, shared, currentList, products, limits, mode } = store;

  const role = currentList?.role ?? 'owner';
  const canEdit = role !== 'viewer';
  const isOwner = role === 'owner';
  const listFull = limits && products.length >= limits.maxItemsPerList;

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [deleteListsOpen, setDeleteListsOpen] = useState(false);
  const [listsToDelete, setListsToDelete] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const collectedCount = products.filter((p) => p.collected).length;
  const allCollected = products.length > 0 && collectedCount === products.length;

  // Comemora quando o último item da lista é marcado (e não quando uma lista cheia acabou de carregar)
  const wasComplete = useRef(allCollected);
  const lastListId = useRef(currentList?.id);
  const lastCount = useRef(products.length);
  useEffect(() => {
    const sameList = lastListId.current === currentList?.id;
    const sameSize = lastCount.current === products.length;
    lastListId.current = currentList?.id;
    lastCount.current = products.length;
    if (!sameList || !sameSize) {
      wasComplete.current = allCollected;
      return;
    }
    if (allCollected && !wasComplete.current) {
      celebrate();
      toast.success('Lista completa! Boas compras 🎉');
    }
    wasComplete.current = allCollected;
  }, [allCollected, currentList?.id, products.length]);

  // Executa uma ação sobre os produtos e oferece desfazer
  const withUndo = (message, action) => {
    const snapshot = products;
    action();
    toast(message, {
      action: { label: 'Desfazer', onClick: () => store.restoreProducts(snapshot) },
    });
  };

  const handleAdd = async (product) => {
    try {
      await store.addProduct(product);
      toast.success(`${product.name.trim()} adicionado`, { duration: 1800 });
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const handleDelete = (product) => withUndo(`${product.name} removido`, () => store.removeProduct(product.id));

  const handleCreateList = async () => {
    try {
      await store.createList();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteLists = async () => {
    const count = listsToDelete.length;
    await store.deleteLists(listsToDelete);
    setListsToDelete([]);
    toast(count === 1 ? 'Lista excluída' : `${count} listas excluídas`);
  };

  const handleShare = () => {
    if (!authEnabled) return toast('O compartilhamento estará disponível em breve.');
    if (!user) return setLoginPromptOpen(true);
    if (currentList) setShareOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    toast('Você saiu da conta.');
  };

  const handleDeleteAccount = async (confirmEmail) => {
    await deleteAccount(confirmEmail);
    toast('Conta excluída. Você pode reativá-la cadastrando o mesmo e-mail.');
  };

  const sidebar = (onNavigate) => (
    <Sidebar
      owned={owned}
      shared={shared}
      currentId={currentList?.id}
      limits={limits}
      authEnabled={authEnabled}
      user={user}
      onSelectList={store.selectList}
      onCreateList={handleCreateList}
      onDeleteLists={() => setDeleteListsOpen(true)}
      onLogout={handleLogout}
      onDeleteAccount={() => setDeleteAccountOpen(true)}
      onNavigate={onNavigate}
    />
  );

  const blockedReason = !canEdit
    ? `Você tem acesso somente para leitura nesta lista. Só ${currentList?.owner?.name ?? 'o dono'} pode permitir edições.`
    : listFull
      ? `Esta lista atingiu o limite de ${limits.maxItemsPerList} itens. Remova algum item para adicionar outro.`
      : null;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-card lg:flex">
        <div className="border-b p-4">
          <Brand />
        </div>
        <div className="min-h-0 flex-1">{sidebar()}</div>
      </aside>

      <div className="min-w-0">
        <Header open={menuOpen} onOpenChange={setMenuOpen}>
          {sidebar(() => setMenuOpen(false))}
        </Header>

        <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-4 pt-6 sm:pt-12">
          {!store.ready ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Carregando suas listas...</p>
          ) : !currentList ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">Você ainda não tem listas.</p>
              <Button className="mt-4" onClick={handleCreateList}>
                Criar minha primeira lista
              </Button>
            </div>
          ) : (
            <>
              <ListHeader
                list={currentList}
                readOnlyTitle={!isOwner}
                connection={store.connection}
                onRename={store.renameList}
                onCommit={store.commitListName}
                onShare={handleShare}
              />

              <AddProductForm
                key={currentList.id}
                onAdd={handleAdd}
                blockedReason={blockedReason}
                count={products.length}
                max={limits?.maxItemsPerList}
              />

              {products.length > 0 ? (
                <ProductList
                  key={currentList.id}
                  products={products}
                  readOnly={!canEdit}
                  currentUserId={user?.id}
                  onToggle={store.toggleProduct}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                  onCheckAll={() => withUndo('Todos os itens marcados', () => store.setAllCollected(true))}
                  onUncheckAll={() => withUndo('Todos os itens desmarcados', () => store.setAllCollected(false))}
                  onClearPrices={() => withUndo('Valores removidos', store.clearPrices)}
                  onClear={() => setClearOpen(true)}
                />
              ) : (
                <EmptyState />
              )}

              <TotalBar products={products} />
            </>
          )}
        </main>
      </div>

      <EditProductDialog product={editing} onSave={store.updateProduct} onClose={() => setEditing(null)} />

      <ClearCartModal
        open={clearOpen}
        onOpenChange={setClearOpen}
        productsCount={products.length}
        onConfirm={() => withUndo('Lista esvaziada', store.clearProducts)}
      />

      <DeleteListsModal
        open={deleteListsOpen}
        onOpenChange={setDeleteListsOpen}
        lists={owned}
        lockFirst={mode === 'local'}
        selected={listsToDelete}
        onSelectedChange={setListsToDelete}
        onConfirm={handleDeleteLists}
      />

      <LoginRequiredModal open={loginPromptOpen} onOpenChange={setLoginPromptOpen} />

      {user && (
        <DeleteAccountModal
          open={deleteAccountOpen}
          onOpenChange={setDeleteAccountOpen}
          email={user.email}
          onConfirm={handleDeleteAccount}
        />
      )}

      {user && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          list={currentList}
          user={user}
          membersVersion={store.membersVersion}
          onLeft={() => {
            toast('Você saiu da lista.');
            store.refresh();
          }}
        />
      )}
    </div>
  );
}
