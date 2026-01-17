import React, { useState } from 'react';
import { Edit2, Check, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES, getCategoryColor, getCategoryIcon, getCategoryLabel } from '@/utils/categoryUtils';
import { formatCurrency } from '@/utils/currencyUtils';

export default function ProductCard({ product, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);
  const [editCategory, setEditCategory] = useState(product.category);
  const [editQuantity, setEditQuantity] = useState(product.quantity);
  const [editPrice, setEditPrice] = useState(Math.round(product.unitPrice * 100).toString());
  const [editPriceDisplay, setEditPriceDisplay] = useState(product.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  const handleEditPriceChange = (value) => {
    const numbers = value.replace(/\D/g, '');
    setEditPrice(numbers);
    setEditPriceDisplay(formatCurrency(numbers));
  };

  const saveEdit = () => {
    const priceValue = editPrice ? parseInt(editPrice) / 100 : 0;
    onUpdate(product.id, {
      name: editName.trim(),
      category: editCategory,
      quantity: parseInt(editQuantity) || 1,
      unitPrice: priceValue
    });
    setIsEditing(false);
  };

  const iconData = getCategoryIcon(product.category);

  if (isEditing) {
    return (
      <Card className="border-2 border-primary">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Categoria</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{getCategoryLabel(cat)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input type="number" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} min="1" />
            </div>
          </div>
          <div>
            <Label>Valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
              <Input 
                value={editPriceDisplay} 
                onChange={(e) => handleEditPriceChange(e.target.value)} 
                className="pl-10" 
                placeholder="0,00" 
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveEdit} className="flex-1">Salvar</Button>
            <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={product.collected ? 'bg-green-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold ${product.collected ? 'line-through text-muted-foreground' : ''}`}>
                {product.name}
              </h3>
              <Badge variant="outline" className={getCategoryColor(product.category)}>
                {React.createElement(iconData.Icon, { className: `w-3 h-3 ${iconData.color}` })}
                <span className="ml-1">{getCategoryLabel(product.category)}</span>
              </Badge>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Qtd: {product.quantity}</span>
              {product.unitPrice > 0 && (
                <>
                  <span>R$ {product.unitPrice.toFixed(2)}</span>
                  <span className="font-semibold">Total: R$ {(product.unitPrice * product.quantity).toFixed(2)}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 text-blue-600" />
            </Button>
            <Button 
              size="icon" 
              variant={product.collected ? "default" : "outline"} 
              onClick={() => onToggle(product.id)} 
              className={product.collected ? "bg-green-600" : ""}
            >
              <Check className={`w-4 h-4 ${product.collected ? 'text-white' : 'text-green-600'}`} />
            </Button>
            <Button size="icon" variant="outline" onClick={() => onDelete(product.id)}>
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
