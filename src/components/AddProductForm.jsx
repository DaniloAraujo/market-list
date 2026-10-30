import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Lock, Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DetailFields, NameField } from '@/components/form/ProductFields';
import { centsToReais, formatBRL } from '@/utils/currencyUtils';
import { useCategories } from '@/categories/categories-context';
import { getCategoryLabel } from '@/utils/categoryUtils';
import { formatQuantity, showQuantity } from '@/utils/quantityUtils';
import { cn } from '@/lib/utils';

const EMPTY = { name: '', category: '', quantity: 1, unit: 'un', priceCents: '', note: '' };

const summarize = ({ category, quantity, unit, priceCents, note }, custom) =>
  [
    category ? getCategoryLabel(category, custom) : null,
    showQuantity({ quantity, unit }) ? formatQuantity({ quantity, unit }) : null,
    priceCents ? formatBRL(centsToReais(priceCents)) : null,
    note.trim() ? 'com observação' : null,
  ]
    .filter(Boolean)
    .join(' · ');

export default function AddProductForm({ onAdd, blockedReason, count, max }) {
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { custom } = useCategories();

  const change = (patch) => setValues((v) => ({ ...v, ...patch }));

  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!values.name.trim()) {
      setError('Digite o nome do produto');
      return;
    }
    setBusy(true);
    const accepted = await onAdd({
      name: values.name,
      category: activeCategory,
      quantity: Number(values.quantity) || 1,
      unit: values.unit,
      unitPrice: centsToReais(values.priceCents),
      note: values.note.trim(),
    });
    setBusy(false);
    if (!accepted) return;
    setValues(EMPTY);
    setError('');
  };

  const activeCategory =
    values.category.startsWith('c_') && !custom.some((item) => item.id === values.category) ? '' : values.category;
  const summary = summarize({ ...values, category: activeCategory }, custom);

  if (blockedReason) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-3 text-sm text-muted-foreground" role="status">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" />
        {blockedReason}
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <NameField
            label={null}
            aria-label="Nome do produto"
            value={values.name}
            error={error}
            onChange={(name) => {
              change({ name });
              setError('');
            }}
          />
        </div>
        <Button type="submit" size="icon" aria-label="Adicionar à lista" disabled={busy}>
          <Plus className="!size-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDetailsOpen((o) => !o)}
          aria-expanded={detailsOpen}
          className="h-8 min-w-0 justify-start gap-1.5 px-2.5 text-xs"
        >
          <SlidersHorizontal className="!size-3.5 text-muted-foreground" />
          <span className="truncate">{detailsOpen || !summary ? 'Mais detalhes' : summary}</span>
          <ChevronDown className={cn('!size-3.5 text-muted-foreground transition-transform', detailsOpen && 'rotate-180')} />
        </Button>
        {max != null && (
          <span
            className={cn(
              'ml-auto shrink-0 text-xs tabular-nums text-muted-foreground',
              count >= max * 0.9 && 'font-medium text-destructive'
            )}
          >
            {count}/{max} itens
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {detailsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="-mx-1 overflow-hidden px-1"
          >
            <div className="pb-1 pt-2">
              <DetailFields values={values} onChange={change} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
