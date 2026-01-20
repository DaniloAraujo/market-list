import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AddProductForm from '@/components/AddProductForm';
import ProductList from '@/components/ProductList';
import ClearCartModal from '@/components/modals/ClearCartModal';
import DeleteListsModal from '@/components/modals/DeleteListsModal';
import ShareListModal from '@/components/modals/ShareListModal';
import { formatCurrency } from '@/utils/currencyUtils';

export default function ShoppingList() {
  const [lists, setLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [unitPriceDisplay, setUnitPriceDisplay] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [showClearModal, setShowClearModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDeleteListsModal, setShowDeleteListsModal] = useState(false);
  const [listsToDelete, setListsToDelete] = useState([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [selectAllLists, setSelectAllLists] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedLists = localStorage.getItem('shoppingLists');
    if (savedLists) {
      const parsed = JSON.parse(savedLists);
      setLists(parsed);
      if (parsed.length > 0) setCurrentListId(parsed[0].id);
    } else {
      createNewList();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('list');
    if (sharedData) {
      try {
        const decoded = atob(sharedData);
        const sharedList = JSON.parse(decoded);
        importSharedList(sharedList);
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Erro ao importar lista compartilhada:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (lists.length > 0) {
      localStorage.setItem('shoppingLists', JSON.stringify(lists));
    }
  }, [lists]);

  const currentList = lists.find(l => l.id === currentListId);
  const products = currentList?.products || [];

  const createNewList = () => {
    const newList = { id: Date.now().toString(), name: `Lista ${lists.length + 1}`, products: [], createdAt: Date.now() };
    setLists([...lists, newList]);
    setCurrentListId(newList.id);
    setMobileMenuOpen(false);
  };

  const updateListName = (n) => {
    setLists(lists.map(l => l.id === currentListId ? { ...l, name: n } : l));
  };

  const handleListNameBlur = () => {
    if (currentList && currentList.name.trim() === '') {
      const index = lists.findIndex(l => l.id === currentListId);
      setLists(lists.map(l => l.id === currentListId ? { ...l, name: `Lista ${index + 1}` } : l));
    }
  };

  const deleteSelectedLists = () => {
    const remaining = lists.filter(l => !listsToDelete.includes(l.id));
    setLists(remaining);
    if (listsToDelete.includes(currentListId)) setCurrentListId(remaining[0]?.id || null);
    if (remaining.length === 0) createNewList();
    setListsToDelete([]);
    setSelectAllLists(false);
    setShowDeleteListsModal(false);
  };

  const deleteAllLists = () => {
    const firstList = lists[0];
    setLists([firstList]);
    setCurrentListId(firstList.id);
    setListsToDelete([]);
    setSelectAllLists(false);
    setShowDeleteListsModal(false);
  };

  const handleSelectAll = (checked) => {
    setSelectAllLists(checked);
    if (checked) {
      setListsToDelete(lists.slice(1).map(l => l.id));
    } else {
      setListsToDelete([]);
    }
  };

  const handleListCheckbox = (listId, checked) => {
    if (checked) {
      setListsToDelete([...listsToDelete, listId]);
    } else {
      setListsToDelete(listsToDelete.filter(id => id !== listId));
      setSelectAllLists(false);
    }
  };

  const generateShareLink = () => {
    if (!currentList) return;
    
    const listData = {
      name: currentList.name,
      products: currentList.products
    };
    
    const encoded = btoa(JSON.stringify(listData));
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?list=${encoded}`;
    
    setShareLink(link);
    setShowShareModal(true);
    setCopied(false);
  };

  const importSharedList = (sharedList) => {
    const newList = {
      id: Date.now().toString(),
      name: sharedList.name,
      products: sharedList.products.map(p => ({ ...p, id: Date.now().toString() + Math.random() })),
      createdAt: Date.now()
    };
    
    setLists(prev => [...prev, newList]);
    setCurrentListId(newList.id);
  };

  const copyToClipboard = async () => {
    if (!shareLink || shareLink.trim() === '') {
      console.error('Share link está vazio');
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setShowShareModal(false);
        }, 2000);
        return;
      }
    } catch (err) {
      console.log('Clipboard API falhou, tentando fallback:', err);
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.setAttribute('readonly', '');
      
      document.body.appendChild(textArea);
      
      const selected = document.getSelection().rangeCount > 0 
        ? document.getSelection().getRangeAt(0) 
        : false;
      
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      
      let success = false;
      try {
        success = document.execCommand('copy');
      } catch (err) {
        console.error('Erro ao executar execCommand copy:', err);
      }
      
      document.body.removeChild(textArea);
      
      if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
      }
      
      if (success) {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setShowShareModal(false);
        }, 2000);
      } else {
        console.error('Falha ao copiar usando fallback');
      }
    } catch (err) {
      console.error('Erro no fallback de cópia:', err);
    }
  };

  const shareList = async () => {
    const shareData = {
      title: `Lista de Mercado: ${currentList?.name}`,
      text: `Confira minha lista de mercado "${currentList?.name}"!`,
      url: shareLink
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShowShareModal(false);
      } else {
        await copyToClipboard();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
        await copyToClipboard();
      }
    }
  };

  const handlePriceChange = (value) => {
    const numbers = value.replace(/\D/g, '');
    setUnitPrice(numbers);
    setUnitPriceDisplay(formatCurrency(numbers));
  };

  const addProduct = () => {
    if (!name.trim() || !currentListId) return;
    const priceValue = unitPrice ? parseInt(unitPrice) / 100 : 0;
    let quantityValue = 1;
    if (quantity !== '' && quantity !== null && quantity !== undefined) {
      const parsed = typeof quantity === 'string' ? parseInt(quantity) : quantity;
      quantityValue = (!isNaN(parsed) && parsed > 0) ? parsed : 1;
    }
    const newProduct = { 
      id: Date.now().toString(), 
      name: name.trim(), 
      category: category || 'outros', 
      quantity: quantityValue, 
      unitPrice: priceValue, 
      collected: false, 
      timestamp: Date.now() 
    };
    setLists(lists.map(l => l.id === currentListId ? { ...l, products: [...l.products, newProduct] } : l));
    setName(''); 
    setCategory(''); 
    setQuantity(1); 
    setUnitPrice(''); 
    setUnitPriceDisplay('');
  };

  const toggleCollected = (id) => 
    setLists(lists.map(l => l.id === currentListId ? { ...l, products: l.products.map(p => p.id === id ? { ...p, collected: !p.collected } : p) } : l));
  
  const updateProduct = (id, data) => 
    setLists(lists.map(l => l.id === currentListId ? { ...l, products: l.products.map(p => p.id === id ? { ...p, ...data } : p) } : l));
  
  const removeProduct = (id) => 
    setLists(lists.map(l => l.id === currentListId ? { ...l, products: l.products.filter(p => p.id !== id) } : l));
  
  const uncheckAll = () => 
    setLists(lists.map(l => l.id === currentListId ? { ...l, products: l.products.map(p => ({ ...p, collected: false })) } : l));
  
  const checkAll = () => 
    setLists(lists.map(l => l.id === currentListId ? { ...l, products: l.products.map(p => ({ ...p, collected: true })) } : l));
  
  const clearAllPrices = () => 
    setLists(lists.map(l => l.id === currentListId ? { ...l, products: l.products.map(p => ({ ...p, unitPrice: 0 })) } : l));
  
  const clearCart = () => { 
    setLists(lists.map(l => l.id === currentListId ? { ...l, products: [] } : l)); 
    setShowClearModal(false); 
  };

  const calculateTotal = () => products.reduce((t, p) => t + (p.unitPrice * p.quantity), 0);
  const availableCategories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex">
      <aside className="hidden lg:block w-80 bg-white border-r shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Tá na Lista</h1>
              <p className="text-xs text-muted-foreground">Sua lista de mercado</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar 
            lists={lists}
            currentListId={currentListId}
            onSelectList={setCurrentListId}
            onCreateList={createNewList}
            onDeleteLists={() => setShowDeleteListsModal(true)}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <Header 
          isMobile={true}
          currentList={currentList}
          productsCount={products.length}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuChange={setMobileMenuOpen}
        >
          <Sidebar 
            lists={lists}
            currentListId={currentListId}
            onSelectList={setCurrentListId}
            onCreateList={createNewList}
            onDeleteLists={() => setShowDeleteListsModal(true)}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
        </Header>

        <Header 
          isMobile={false}
          currentList={currentList}
          productsCount={products.length}
        />

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Label>
                  Nome da Lista <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    value={currentList?.name || ''} 
                    onChange={(e) => updateListName(e.target.value)} 
                    onBlur={handleListNameBlur} 
                    placeholder="Digite o nome da lista" 
                    className="flex-1" 
                    maxLength="80"
                  />
                  {/* <Button 
                    onClick={generateShareLink} 
                    variant="outline" 
                    size="icon" 
                    title="Compartilhar lista"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button> */}
                </div>
              </CardContent>
            </Card>

            <AddProductForm
              name={name}
              category={category}
              quantity={quantity}
              unitPriceDisplay={unitPriceDisplay}
              onNameChange={setName}
              onCategoryChange={setCategory}
              onQuantityChange={setQuantity}
              onPriceChange={handlePriceChange}
              onSubmit={addProduct}
            />

            {products.length > 0 && (
              <ProductList
                products={products}
                filterCategory={filterCategory}
                currentTab={currentTab}
                availableCategories={availableCategories}
                onFilterChange={setFilterCategory}
                onTabChange={setCurrentTab}
                onCheckAll={checkAll}
                onUncheckAll={uncheckAll}
                onClearPrices={clearAllPrices}
                onShowClearModal={() => setShowClearModal(true)}
                onToggleProduct={toggleCollected}
                onUpdateProduct={updateProduct}
                onDeleteProduct={removeProduct}
                calculateTotal={calculateTotal}
              />
            )}

            {products.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="text-muted-foreground mb-2">Lista vazia</CardTitle>
                  <CardDescription>Adicione produtos acima</CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <footer className="bg-white border-t p-4">
          <div className="max-w-4xl mx-auto flex justify-between text-sm text-muted-foreground">
            <span>
              <ShoppingCart className="w-4 h-4 inline mr-1" />
              Tá na Lista
            </span>
          </div>
        </footer>
      </div>

      <ClearCartModal
        open={showClearModal}
        onOpenChange={setShowClearModal}
        productsCount={products.length}
        onConfirm={clearCart}
      />

      <DeleteListsModal
        open={showDeleteListsModal}
        onOpenChange={setShowDeleteListsModal}
        lists={lists}
        listsToDelete={listsToDelete}
        selectAllLists={selectAllLists}
        onSelectAll={handleSelectAll}
        onListCheckbox={handleListCheckbox}
        onDeleteSelected={deleteSelectedLists}
        onDeleteAll={deleteAllLists}
        onCancel={() => {
          setListsToDelete([]);
          setSelectAllLists(false);
        }}
      />

      {/* <ShareListModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        listName={currentList?.name || ''}
        shareLink={shareLink}
        copied={copied}
        onCopy={copyToClipboard}
        onShare={shareList}
        onClose={() => setShowShareModal(false)}
      /> */}
    </div>
  );
}
