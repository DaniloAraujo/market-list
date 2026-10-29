import { useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { CheckCheck, Eraser, MoreHorizontal, RotateCcw, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProductItem from '@/components/ProductItem';
import { useCategories } from '@/categories/categories-context';
import { resolveCategory } from '@/utils/categoryUtils';
import { cn } from '@/lib/utils';

function Section({ title, count, children }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 border-b pb-2 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
        <span className="tabular-nums">{count}</span>
      </h2>
      <ul>
        <AnimatePresence mode="popLayout" initial={false}>
          {children}
        </AnimatePresence>
      </ul>
    </section>
  );
}

function CategoryChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

export default function ProductList({
  products,
  onToggle,
  onEdit,
  onDelete,
  onCheckAll,
  onUncheckAll,
  onClearPrices,
  onClear,
  readOnly = false,
  currentUserId,
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('todos');
  const { custom } = useCategories();

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);
  const activeCategory = category === 'todos' || categories.includes(category) ? category : 'todos';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (activeCategory === 'todos' || p.category === activeCategory) && (!q || p.name.toLowerCase().includes(q))
    );
  }, [products, query, activeCategory]);

  const pending = filtered.filter((p) => !p.collected);
  const collected = filtered.filter((p) => p.collected);
  const renderItem = (p) => (
    <ProductItem
      key={p.id}
      product={p}
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      readOnly={readOnly}
      currentUserId={currentUserId}
    />
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar na lista"
              aria-label="Buscar na lista"
              className="pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-content-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {!readOnly && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ações da lista">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onCheckAll}>
                <CheckCheck /> Marcar todos como pegos
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onUncheckAll}>
                <RotateCcw /> Desmarcar todos
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onClearPrices}>
                <Eraser /> Limpar valores
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={onClear}>
                <Trash2 /> Esvaziar lista
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>

        {categories.length > 1 && (
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <CategoryChip active={activeCategory === 'todos'} onClick={() => setCategory('todos')}>
              Todos
            </CategoryChip>
            {categories.map((cat) => {
              const info = resolveCategory(cat, custom);
              return (
                <CategoryChip key={cat} active={activeCategory === cat} onClick={() => setCategory(cat)}>
                  <span aria-hidden>{info.emoji}</span>
                  {info.label}
                </CategoryChip>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Nenhum item encontrado{query.trim() && <> para &ldquo;{query.trim()}&rdquo;</>}.
        </div>
      )}

      {pending.length > 0 && (
        <Section title="A pegar" count={pending.length}>
          {pending.map(renderItem)}
        </Section>
      )}

      {collected.length > 0 && (
        <Section title="No carrinho" count={collected.length}>
          {collected.map(renderItem)}
        </Section>
      )}
    </div>
  );
}
