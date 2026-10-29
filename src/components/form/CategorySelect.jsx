import { forwardRef, useState } from 'react';
import { useCategories } from '@/categories/categories-context';
import CategoriesDialog from '@/components/CategoriesDialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BUILTIN_CATEGORIES, DEFAULT_CATEGORY, categoryToneClasses, resolveCategory } from '@/utils/categoryUtils';
import { cn } from '@/lib/utils';

const MANAGE = '__manage__';

function Option({ category }) {
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden>{category.emoji}</span>
      {category.label}
    </span>
  );
}

const builtins = BUILTIN_CATEGORIES.filter((c) => c.key !== DEFAULT_CATEGORY);
const fallback = BUILTIN_CATEGORIES.find((c) => c.key === DEFAULT_CATEGORY);

const CategorySelect = forwardRef(({ value, onValueChange, placeholder = 'Selecione', ...props }, ref) => {
  const { custom } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);

  const chosen = value ? resolveCategory(value, custom) : null;
  const colored = chosen && !chosen.isDefault;

  return (
    <>
      <Select value={value} onValueChange={(next) => (next === MANAGE ? setDialogOpen(true) : onValueChange(next))}>
        <SelectTrigger
          ref={ref}
          {...props}
          className={cn(colored && ['border-transparent font-medium', categoryToneClasses(chosen)], props.className)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {builtins.map((category) => (
            <SelectItem key={category.key} value={category.key}>
              <Option category={category} />
            </SelectItem>
          ))}
          <SelectItem value={fallback.key}>
            <Option category={fallback} />
          </SelectItem>

          {custom.length > 0 && (
            <>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Suas categorias</SelectLabel>
                {custom.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <Option category={resolveCategory(item.id, custom)} />
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          )}

          <SelectSeparator />
          <SelectItem value={MANAGE}>
            <span className="flex items-center gap-2.5 font-medium text-primary">
              <span aria-hidden>＋</span>
              Nova categoria…
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      <CategoriesDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={(category) => onValueChange(category.id)} />
    </>
  );
});
CategorySelect.displayName = 'CategorySelect';

export default CategorySelect;
