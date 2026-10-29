import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DetailFields, NameField } from '@/components/form/ProductFields';
import { centsToReais, formatBRL } from '@/utils/currencyUtils';
import { getCategoryLabel } from '@/utils/categoryUtils';
import { cn } from '@/lib/utils';

const EMPTY = { name: '', category: '', quantity: 1, priceCents: '' };

const summarize = ({ category, quantity, priceCents }) =>
  [
    category ? getCategoryLabel(category) : null,
    quantity > 1 ? `${quantity} un.` : null,
    priceCents ? formatBRL(centsToReais(priceCents)) : null,
  ]
    .filter(Boolean)
    .join(' · ');

export default function AddProductForm({ onAdd }) {
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const nameRef = useRef(null);

  const change = (patch) => setValues((v) => ({ ...v, ...patch }));

  const submit = (e) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setError('Digite o nome do produto');
      nameRef.current?.focus();
      return;
    }
    onAdd({
      name: values.name,
      category: values.category,
      quantity: Number(values.quantity) || 1,
      unitPrice: centsToReais(values.priceCents),
    });
    setValues(EMPTY);
    setError('');
    nameRef.current?.focus();
  };

  const summary = summarize(values);

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
        <Button type="submit" size="icon" aria-label="Adicionar à lista">
          <Plus className="!size-5" />
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setDetailsOpen((o) => !o)}
        aria-expanded={detailsOpen}
        className="flex items-center gap-1 rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', detailsOpen && 'rotate-180')} />
        Categoria, quantidade e valor
        {!detailsOpen && summary && <span className="ml-1 truncate text-foreground">· {summary}</span>}
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
