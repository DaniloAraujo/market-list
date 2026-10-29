import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LIST_TEMPLATES } from '@/data/listTemplates';
import { BUILTIN_CATEGORIES } from '@/utils/categoryUtils';

const EMOJI_BY_CATEGORY = Object.fromEntries(BUILTIN_CATEGORIES.map((category) => [category.key, category.emoji]));

function Choose({ onBlank, onPick, busy }) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBlank}
        disabled={busy}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        <span className="grid h-10 w-10 shrink-0 place-content-center rounded-lg bg-muted">
          <Plus className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium">Lista em branco</span>
          <span className="block text-xs text-muted-foreground">Comece do zero e adicione o que quiser.</span>
        </span>
      </button>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Ou comece de um modelo pronto</p>
        <div className="grid max-h-[42vh] grid-cols-2 gap-2 overflow-y-auto pr-0.5">
          {LIST_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onPick(template)}
              disabled={busy}
              className="flex min-w-0 flex-col items-start gap-1 rounded-xl border bg-card px-3 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {template.emoji}
              </span>
              <span className="w-full truncate text-sm font-medium">{template.name}</span>
              <span className="text-xs text-muted-foreground">{template.items.length} itens</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Preview({ template, onBack, onCreate, busy }) {
  return (
    <div className="space-y-4">
      <ul className="max-h-[40vh] divide-y overflow-y-auto rounded-lg border">
        {template.items.map((entry) => (
          <li key={entry.name} className="flex items-start gap-2.5 px-3 py-2 text-sm">
            <span aria-hidden="true" className="w-5 shrink-0 text-center">
              {EMOJI_BY_CATEGORY[entry.category]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block">{entry.name}</span>
              {entry.note && <span className="block text-xs text-muted-foreground">{entry.note}</span>}
            </span>
            {entry.quantity > 1 && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{entry.quantity} un.</span>}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">Você pode editar, remover ou acrescentar itens depois de criar a lista.</p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          <ArrowLeft /> Voltar
        </Button>
        <Button type="button" onClick={() => onCreate(template)} disabled={busy}>
          {busy ? 'Criando...' : 'Criar esta lista'}
        </Button>
      </div>
    </div>
  );
}

function Content({ onBlank, onTemplate, onClose }) {
  const [template, setTemplate] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
      onClose();
    } catch {
      return;
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{template ? `${template.emoji} ${template.name}` : 'Nova lista'}</DialogTitle>
        <DialogDescription>
          {template ? template.description : 'Crie uma lista do zero ou aproveite um modelo pronto.'}
        </DialogDescription>
      </DialogHeader>
      {template ? (
        <Preview template={template} busy={busy} onBack={() => setTemplate(null)} onCreate={(picked) => run(() => onTemplate(picked))} />
      ) : (
        <Choose busy={busy} onBlank={() => run(onBlank)} onPick={setTemplate} />
      )}
    </>
  );
}

export default function NewListDialog({ open, onOpenChange, onBlank, onTemplate }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && <Content onBlank={onBlank} onTemplate={onTemplate} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}
