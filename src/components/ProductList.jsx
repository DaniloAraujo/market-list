import { List, FileText, Filter, CheckSquare, Square, Eraser, Trash2, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from './ProductCard';
import { getCategoryLabel } from '@/utils/categoryUtils';

export default function ProductList({
  products,
  filterCategory,
  currentTab,
  availableCategories,
  onFilterChange,
  onTabChange,
  onCheckAll,
  onUncheckAll,
  onClearPrices,
  onShowClearModal,
  onToggleProduct,
  onUpdateProduct,
  onDeleteProduct,
  calculateTotal
}) {
  const filteredProducts = filterCategory === 'todos' ? products : products.filter(p => p.category === filterCategory);
  const pendingProducts = filteredProducts.filter(p => !p.collected);
  const collectedProducts = filteredProducts.filter(p => p.collected);

  return (
    <Tabs value={currentTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="all">
          <List className="w-4 h-4 mr-2" />
          Tudo
        </TabsTrigger>
        <TabsTrigger value="items">
          <FileText className="w-4 h-4 mr-2" />
          Meus Itens
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="items" className="space-y-6 mt-6">
        {calculateTotal() > 0 && (
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">Total</p>
                    <p className="text-3xl font-bold">R$ {calculateTotal().toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Com preço</p>
                  <p className="text-xl font-semibold">
                    {products.filter(p => p.unitPrice > 0).length}/{products.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {pendingProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                A Pegar <Badge>{pendingProducts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onToggle={onToggleProduct}
                  onUpdate={onUpdateProduct}
                  onDelete={onDeleteProduct}
                />
              ))}
            </CardContent>
          </Card>
        )}
        
        {collectedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Coletados <Badge>{collectedProducts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {collectedProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onToggle={onToggleProduct}
                  onUpdate={onUpdateProduct}
                  onDelete={onDeleteProduct}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="all" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Ações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Filtrar</Label>
              <Select value={filterCategory} onValueChange={onFilterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {availableCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={onCheckAll}>
                <CheckSquare className="w-4 h-4 mr-2 text-green-600" />
                Marcar
              </Button>
              <Button variant="outline" onClick={onUncheckAll}>
                <Square className="w-4 h-4 mr-2 text-orange-600" />
                Desmarcar
              </Button>
              <Button variant="outline" onClick={onClearPrices}>
                <Eraser className="w-4 h-4 mr-2 text-purple-600" />
                Limpar $
              </Button>
              <Button variant="outline" onClick={onShowClearModal}>
                <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {pendingProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                A Pegar <Badge>{pendingProducts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onToggle={onToggleProduct}
                  onUpdate={onUpdateProduct}
                  onDelete={onDeleteProduct}
                />
              ))}
            </CardContent>
          </Card>
        )}
        
        {collectedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Coletados <Badge>{collectedProducts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {collectedProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onToggle={onToggleProduct}
                  onUpdate={onUpdateProduct}
                  onDelete={onDeleteProduct}
                />
              ))}
            </CardContent>
          </Card>
        )}
        
        {calculateTotal() > 0 && (
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div>
                  <DollarSign className="w-8 h-8 inline mr-2" />
                  <span className="text-2xl font-bold">R$ {calculateTotal().toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    Com preço: {products.filter(p => p.unitPrice > 0).length}/{products.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
