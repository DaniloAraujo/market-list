import { forwardRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CategoryIcon from '@/components/CategoryIcon';
import { CATEGORIES, getCategoryLabel } from '@/utils/categoryUtils';

function CategoryOption({ category }) {
  return (
    <span className="flex items-center gap-2.5">
      <CategoryIcon category={category} className="h-4 w-4 text-muted-foreground" />
      {getCategoryLabel(category)}
    </span>
  );
}

/** Select de categorias com ícone. `categories` limita as opções (ex.: filtro). */
const CategorySelect = forwardRef(
  ({ value, onValueChange, categories = CATEGORIES, placeholder = 'Selecione', allLabel, ...props }, ref) => (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger ref={ref} {...props}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value="todos">{allLabel}</SelectItem>}
        {categories.map((cat) => (
          <SelectItem key={cat} value={cat}>
            <CategoryOption category={cat} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
);
CategorySelect.displayName = 'CategorySelect';

export default CategorySelect;
