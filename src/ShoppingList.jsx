import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import Sidebar, { Brand } from '@/components/Sidebar';
import Header from '@/components/Header';
import ListHeader from '@/components/ListHeader';
import AddProductForm from '@/components/AddProductForm';
import ProductList from '@/components/ProductList';
import EditProductDialog from '@/components/EditProductDialog';
import EmptyState from '@/components/EmptyState';
import TotalBar from '@/components/TotalBar';
import ClearCartModal from '@/components/modals/ClearCartModal';
import DeleteListsModal from '@/components/modals/DeleteListsModal';

const celebrate = async () => {
  const { default: confetti } = await import('canvas-confetti');
  const colors = ['#f97316', '#1e3a8a', '#22c55e', '#fbbf24'];
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors, disableForReducedMotion: true });
};

export default function ShoppingList() {
  const {
    lists,
    currentList,
    products,
    selectList,
    createList,
    renameList,
    commitListName,
    deleteLists,
    addProduct,
    updateProduct,
    toggleProduct,
    removeProduct,
    restoreProducts,
    setAllCollected,
    clearPrices,
    clearProducts,
  } = useShoppingLists();

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [deleteListsOpen, setDeleteListsOpen] = useState(false);
  const [listsToDelete, setListsToDelete] = useState([]);

  const collectedCount = products.filter((p) => p.collected).length;
  const allCollected = products.length > 0 && collectedCount === products.length;

  // Comemora quando o último item da lista é marcado
  const wasComplete = useRef(allCollected);
  const lastListId = useRef(currentList?.id);
  useEffect(() => {
    if (lastListId.current !== currentList?.id) {
      lastListId.current = currentList?.id;
      wasComplete.current = allCollected;
      return;
    }
    if (allCollected && !wasComplete.current) {
      celebrate();
      toast.success('Lista completa! Boas compras 🎉');
    }
    wasComplete.current = allCollected;
  }, [allCollected, currentList?.id]);

  // Executa uma ação sobre os produtos e oferece desfazer
  const withUndo = (message, action) => {
    const snapshot = products;
    action();
    toast(message, {
      action: { label: 'Desfazer', onClick: () => restoreProducts(snapshot) },
    });
  };

  const handleAdd = (product) => {
    addProduct(product);
    toast.success(`${product.name.trim()} adicionado`, { duration: 1800 });
  };

  const handleDelete = (product) => withUndo(`${product.name} removido`, () => removeProduct(product.id));

  const handleDeleteLists = () => {
    const count = listsToDelete.length;
    deleteLists(listsToDelete);
    setListsToDelete([]);
    toast(count === 1 ? 'Lista excluída' : `${count} listas excluídas`);
  };

  const sidebar = (onNavigate) => (
    <Sidebar
      lists={lists}
      currentListId={currentList?.id}
      onSelectList={selectList}
      onCreateList={createList}
      onDeleteLists={() => setDeleteListsOpen(true)}
      onNavigate={onNavigate}
    />
  );

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
          <ListHeader
            name={currentList?.name ?? ''}
            onRename={renameList}
            onCommit={commitListName}
          />

          <AddProductForm onAdd={handleAdd} />

          {products.length > 0 ? (
            <ProductList
              key={currentList?.id}
              products={products}
              onToggle={toggleProduct}
              onEdit={setEditing}
              onDelete={handleDelete}
              onCheckAll={() => withUndo('Todos os itens marcados', () => setAllCollected(true))}
              onUncheckAll={() => withUndo('Todos os itens desmarcados', () => setAllCollected(false))}
              onClearPrices={() => withUndo('Valores removidos', clearPrices)}
              onClear={() => setClearOpen(true)}
            />
          ) : (
            <EmptyState />
          )}

          <TotalBar products={products} />
        </main>
      </div>

      <EditProductDialog product={editing} onSave={updateProduct} onClose={() => setEditing(null)} />

      <ClearCartModal
        open={clearOpen}
        onOpenChange={setClearOpen}
        productsCount={products.length}
        onConfirm={() => withUndo('Lista esvaziada', clearProducts)}
      />

      <DeleteListsModal
        open={deleteListsOpen}
        onOpenChange={setDeleteListsOpen}
        lists={lists}
        selected={listsToDelete}
        onSelectedChange={setListsToDelete}
        onConfirm={handleDeleteLists}
      />
    </div>
  );
}
