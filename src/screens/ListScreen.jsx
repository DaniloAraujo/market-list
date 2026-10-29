import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/auth/auth-context';
import ListSwitcher from '@/components/ListSwitcher';
import NewListDialog from '@/components/NewListDialog';
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
import { DeleteListModal, LeaveListModal } from '@/components/modals/ListConfirmModals';
import { api } from '@/lib/api';
import { useStore } from '@/stores/store-context';

const celebrate = async () => {
  const { default: confetti } = await import('canvas-confetti');
  const colors = ['#f97316', '#1e3a8a', '#22c55e', '#fbbf24'];
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors, disableForReducedMotion: true });
};

export default function ListScreen() {
  const store = useStore();
  const { user, enabled: authEnabled } = useAuth();
  const { owned, shared, currentList, products, limits, mode } = store;

  const role = currentList?.role ?? 'owner';
  const canEdit = role !== 'viewer';
  const isOwner = role === 'owner';
  const listFull = limits && products.length >= limits.maxItemsPerList;

  const [editing, setEditing] = useState(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [deleteListsOpen, setDeleteListsOpen] = useState(false);
  const [listsToDelete, setListsToDelete] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [newListOpen, setNewListOpen] = useState(false);
  const [deleteOneOpen, setDeleteOneOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const collectedCount = products.filter((p) => p.collected).length;
  const allCollected = products.length > 0 && collectedCount === products.length;

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

  const createBlankList = async () => {
    try {
      await store.createList();
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const createTemplateList = async (template) => {
    try {
      await store.createListFromTemplate(template);
      toast.success(`Lista “${template.name}” criada`);
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const handleDeleteCurrent = async () => {
    const { id, name } = currentList;
    await store.deleteLists([id]);
    toast(`Lista “${name}” excluída`);
  };

  const handleLeaveCurrent = async () => {
    try {
      await api(`/v1/lists/${currentList.id}/members/${user.id}`, { method: 'DELETE' });
      toast('Você saiu da lista.');
      await store.refresh();
    } catch (error) {
      toast.error(error.message);
      throw error;
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

  const blockedReason = !canEdit
    ? `Você tem acesso somente para leitura nesta lista. Só ${currentList?.owner?.name ?? 'o dono'} pode permitir edições.`
    : listFull
      ? `Esta lista atingiu o limite de ${limits.maxItemsPerList} itens. Remova algum item para adicionar outro.`
      : null;

  return (
    <>
      <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-4 pt-5 sm:pt-10">
        {!store.ready ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Carregando suas listas...</p>
        ) : !currentList ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Você ainda não tem listas.</p>
            <Button className="mt-4" onClick={() => setNewListOpen(true)}>
              Criar minha primeira lista
            </Button>
          </div>
        ) : (
          <>
            <ListSwitcher
              owned={owned}
              shared={shared}
              currentId={currentList.id}
              limits={limits}
              canDelete={owned.length > (user ? 0 : 1)}
              onSelect={store.selectList}
              onCreate={() => setNewListOpen(true)}
              onDelete={() => setDeleteListsOpen(true)}
            />

            <ListHeader
              list={currentList}
              readOnlyTitle={!isOwner}
              connection={store.connection}
              canDelete={isOwner && (mode !== 'local' || owned.findIndex((entry) => entry.id === currentList.id) > 0)}
              onDelete={() => setDeleteOneOpen(true)}
              onLeave={() => setLeaveOpen(true)}
              onRename={store.renameList}
              onCommit={store.commitListName}
              onShare={handleShare}
            />

            <AddProductForm
              key={`form-${currentList.id}`}
              onAdd={handleAdd}
              blockedReason={blockedReason}
              count={products.length}
              max={limits?.maxItemsPerList}
            />

            {products.length > 0 ? (
              <ProductList
                key={`items-${currentList.id}`}
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

      <DeleteListModal
        open={deleteOneOpen}
        onOpenChange={setDeleteOneOpen}
        list={currentList}
        onConfirm={handleDeleteCurrent}
      />

      <LeaveListModal open={leaveOpen} onOpenChange={setLeaveOpen} list={currentList} onConfirm={handleLeaveCurrent} />

      <NewListDialog
        open={newListOpen}
        onOpenChange={setNewListOpen}
        onBlank={createBlankList}
        onTemplate={createTemplateList}
      />

      <LoginRequiredModal open={loginPromptOpen} onOpenChange={setLoginPromptOpen} />

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
    </>
  );
}
