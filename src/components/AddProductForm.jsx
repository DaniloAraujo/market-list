import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Lock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DetailFields, NameField } from '@/components/form/ProductFields';
import { centsToReais, formatBRL } from '@/utils/currencyUtils';
import { useCategories } from '@/categories/categories-context';
import { getCategoryLabel } from '@/utils/categoryUtils';
import { cn } from '@/lib/utils';

const EMPTY = { name: '', category: '', quantity: 1, priceCents: '' };

const summarize = ({ category, quantity, priceCents }, custom) =>
  [
    category ? getCategoryLabel(category, custom) : null,
    quantity > 1 ? `${quantity} un.` : null,
    priceCents ? formatBRL(centsToReais(priceCents)) : null,
  ]
    .filter(Boolean)
    .join(' · ');

/**
 * `onAdd` devolve uma promessa com true quando o item foi aceito (a tela só limpa o formulário nesse caso).
 * `blockedReason` troca o formulário por um aviso (somente leitura, lista cheia...).
 * `count`/`max` mostram quantos itens a lista já tem quando há limite.
 */
export default function AddProductForm({ onAdd, blockedReason, count, max }) {
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const nameRef = useRef(null);
  const { custom } = useCategories();

  const change = (patch) => setValues((v) => ({ ...v, ...patch }));

  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!values.name.trim()) {
      setError('Digite o nome do produto');
      nameRef.current?.focus();
      return;
    }
    setBusy(true);
    const accepted = await onAdd({
      name: values.name,
      category: values.category,
      quantity: Number(values.quantity) || 1,
      unitPrice: centsToReais(values.priceCents),
    });
    setBusy(false);
    if (!accepted) return;
    setValues(EMPTY);
    setError('');
    nameRef.current?.focus();
  };

  const summary = summarize(values, custom);

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
            ref={nameRef}
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

      <button
        type="button"
        onClick={() => setDetailsOpen((o) => !o)}
        aria-expanded={detailsOpen}
        className="flex w-full items-center gap-1 rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', detailsOpen && 'rotate-180')} />
        Categoria, quantidade e valor
        {!detailsOpen && summary && <span className="ml-1 truncate text-foreground">· {summary}</span>}
        {max != null && (
          <span className={cn('ml-auto tabular-nums', count >= max * 0.9 && 'font-medium text-destructive')}>
            {count}/{max} itens
          </span>
        )}
      </button>

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
