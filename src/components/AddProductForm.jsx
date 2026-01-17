import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, getCategoryLabel } from '@/utils/categoryUtils';

export default function AddProductForm({ 
  name, 
  category, 
  quantity, 
  unitPriceDisplay,
  onNameChange,
  onCategoryChange,
  onQuantityChange,
  onPriceChange,
  onSubmit 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-6 h-6 text-primary" />
          Adicionar Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Nome do Produto</Label>
          <Input 
            value={name} 
            onChange={(e) => onNameChange(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && onSubmit()} 
            placeholder="Ex: Arroz, Detergente..." 
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantidade</Label>
            <Input 
              type="number" 
              value={quantity} 
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)} 
              min="1" 
            />
          </div>
        </div>
        <div>
          <Label>Valor Unitário</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
            <Input 
              value={unitPriceDisplay} 
              onChange={(e) => onPriceChange(e.target.value)} 
              className="pl-10" 
              placeholder="0,00" 
            />
          </div>
        </div>
        <Button onClick={onSubmit} className="w-full" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Adicionar
        </Button>
      </CardContent>
    </Card>
  );
}
