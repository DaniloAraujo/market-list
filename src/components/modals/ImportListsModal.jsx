import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { readStoredLists, removeStoredLists } from '@/hooks/useShoppingLists';
import { cn } from '@/lib/utils';

const dismissKey = (userId) => `import:dismissed:${userId}`;

const isDismissed = (userId) => {
  try {
    return localStorage.getItem(dismissKey(userId)) === '1';
  } catch {
    return false;
  }
};

const dismiss = (userId) => {
  try {
    localStorage.setItem(dismissKey(userId), '1');
  } catch {
  }
};

const toImportItem = (product) => ({
  name: String(product.name ?? '').trim().slice(0, 80),
  category: product.category,
  quantity: Math.min(999, Math.max(1, Number(product.quantity) || 1)),
  unit: ['un', 'kg'].includes(product.unit) ? product.unit : 'un',
  unitPriceCents: Math.max(0, Math.round((Number(product.unitPrice) || 0) * 100)),
  note: String(product.note ?? '').trim().slice(0, 255),
  collected: Boolean(product.collected),
});

export default function ImportListsModal({ userId, store }) {
  const [candidates] = useState(() => readStoredLists().filter((l) => l.products?.length > 0));
  const [selected, setSelected] = useState(null);
  const [closed, setClosed] = useState(() => isDismissed(userId));
  const [busy, setBusy] = useState(false);

  const maxItems = store.limits.maxItemsPerList;
  const slots = store.limits.maxLists - store.owned.length;
  const eligible = candidates.filter((l) => l.products.length <= maxItems);
  const chosen = selected ?? eligible.slice(0, Math.max(slots, 0)).map((l) => l.id);

  const open = store.ready && !closed && candidates.length > 0 && slots > 0;
  if (!open) return null;

  const close = () => {
    dismiss(userId);
    setClosed(true);
  };

  const toggle = (id, checked) => setSelected(checked ? [...chosen, id] : chosen.filter((c) => c !== id));

  const submit = async () => {
    const lists = candidates.filter((l) => chosen.includes(l.id));
    setBusy(true);
    try {
      const body = {
        lists: lists.map((l) => ({
          name: (l.name || 'Minha lista').trim().slice(0, 80),
          categories: (l.categories ?? []).map((c) => ({ key: c.id, name: c.name, emoji: c.emoji })),
          items: l.products.map(toImportItem).filter((item) => item.name),
        })),
      };
      const result = await api('/v1/lists/import', { method: 'POST', body });
      removeStoredLists(result.created.map((c) => lists[c.index].id));
      await store.refresh();
      if (result.created[0]) store.selectList(result.created[0].id);
      if (result.created.length > 0) {
        toast.success(
          result.created.length === 1 ? 'Lista importada para sua conta.' : `${result.created.length} listas importadas para sua conta.`
        );
      }
      if (result.skipped.length > 0) toast(`${result.skipped.length} lista(s) não couberam no limite e continuam neste navegador.`);
      close();
    } catch (error) {
      toast.error(error.message);
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(next) => !next && !busy && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Levar suas listas para a conta?</DialogTitle>
          <DialogDescription>
            Encontramos {candidates.length === 1 ? 'uma lista salva' : `${candidates.length} listas salvas`} neste navegador. As importadas
            ficam na sua conta, em qualquer aparelho, e saem daqui.
          </DialogDescription>
        </DialogHeader>

        <ul className="divide-y rounded-lg border">
          {candidates.map((list) => {
            const tooBig = list.products.length > maxItems;
            const checked = chosen.includes(list.id);
            const full = !checked && chosen.length >= slots;
            const disabled = tooBig || full;
            return (
              <li key={list.id}>
                <label className={cn('flex items-center gap-3 px-3 py-3 text-sm', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-muted/60')}>
                  <Checkbox checked={checked} disabled={disabled} onCheckedChange={(value) => toggle(list.id, value === true)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{list.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {list.products.length} {list.products.length === 1 ? 'item' : 'itens'}
                      {tooBig && ` · passa do limite de ${maxItems} itens`}
                      {!tooBig && full && ` · limite de ${store.limits.maxLists} listas na conta`}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted-foreground">
          Cada conta pode ter até {store.limits.maxLists} listas. Você ainda pode importar {slots}.
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={close} disabled={busy}>
            Agora não
          </Button>
          <Button onClick={submit} disabled={busy || chosen.length === 0}>
            {busy ? 'Importando...' : `Importar${chosen.length > 0 ? ` (${chosen.length})` : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
