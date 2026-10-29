import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import { getCategoryLabel } from '@/utils/categoryUtils';
import { formatBRL } from '@/utils/currencyUtils';
import { cn } from '@/lib/utils';

const ProductItem = forwardRef(({ product, onToggle, onEdit, onDelete, readOnly = false, currentUserId }, ref) => {
  const { name, category, quantity, unitPrice, collected, updatedBy } = product;
  // Em listas compartilhadas, mostra quem mexeu por último quando não foi a própria pessoa.
  const editedByOther = updatedBy && updatedBy.id !== currentUserId ? updatedBy.name : null;
  const hasPrice = unitPrice > 0;

  return (
    <motion.li
      ref={ref}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className="group flex items-center gap-3 border-b py-3 last:border-b-0"
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={collected}
        aria-label={collected ? `Desmarcar ${name}` : `Marcar ${name} como pego`}
        onClick={() => onToggle(product.id)}
        disabled={readOnly}
        className={cn(
          'disabled:cursor-default',
          'grid h-5 w-5 shrink-0 place-content-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          collected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input text-transparent hover:border-foreground/50'
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>

      <button
        type="button"
        onClick={() => onEdit(product)}
        disabled={readOnly}
        aria-label={readOnly ? name : `Editar ${name}`}
        className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-default"
      >
        <span
          className={cn(
            'block truncate text-[15px] leading-tight',
            collected && 'text-muted-foreground line-through'
          )}
        >
          {name}
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CategoryIcon category={category} className="h-3 w-3" />
          <span className="truncate">
            {getCategoryLabel(category)}
            {quantity > 1 && ` · ${quantity} un.`}
            {hasPrice && quantity > 1 && ` × ${formatBRL(unitPrice)}`}
            {editedByOther && ` · por ${editedByOther}`}
          </span>
        </span>
      </button>

      {hasPrice && (
        <span className={cn('text-sm tabular-nums', collected ? 'text-muted-foreground' : 'text-foreground')}>
          {formatBRL(unitPrice * quantity)}
        </span>
      )}
      {!readOnly && (
      <button
        type="button"
        onClick={() => onDelete(product)}
        aria-label={`Excluir ${name}`}
        className="grid h-7 w-7 shrink-0 place-content-center rounded-md text-muted-foreground/70 transition hover:bg-muted hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
      )}
    </motion.li>
  );
});
ProductItem.displayName = 'ProductItem';

export default ProductItem;
