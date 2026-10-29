import { useState } from 'react';
import { ArrowLeft, ChevronRight, LayoutTemplate, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LIST_TEMPLATES } from '@/data/listTemplates';
import { BUILTIN_CATEGORIES } from '@/utils/categoryUtils';

const EMOJI_BY_CATEGORY = Object.fromEntries(BUILTIN_CATEGORIES.map((category) => [category.key, category.emoji]));

function Option({ icon: Icon, title, description, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
    >
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function Choose({ onBlank, onTemplates, busy }) {
  return (
    <div className="space-y-2">
      <Option icon={Plus} title="Do zero" description="Uma lista vazia para você montar." onClick={onBlank} disabled={busy} />
      <Option
        icon={LayoutTemplate}
        title="Modelo pronto"
        description="Comece com itens sugeridos e ajuste como quiser."
        onClick={onTemplates}
        disabled={busy}
      />
    </div>
  );
}

function TemplateList({ onPick, onBack }) {
  return (
    <div className="space-y-3">
      <ul className="max-h-[48vh] divide-y overflow-y-auto rounded-xl border">
        {LIST_TEMPLATES.map((template) => (
          <li key={template.id}>
            <button
              type="button"
              onClick={() => onPick(template)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {template.emoji}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{template.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{template.items.length} itens</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft /> Voltar
      </Button>
    </div>
  );
}

function Preview({ template, onBack, onCreate, busy }) {
  return (
    <div className="space-y-3">
      <ul className="max-h-[40vh] divide-y overflow-y-auto rounded-xl border">
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
      <p className="text-xs text-muted-foreground">
        É só um ponto de partida: depois de criar, você pode adicionar mais itens e remover os que não quiser.
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          <ArrowLeft /> Voltar
        </Button>
        <Button type="button" onClick={() => onCreate(template)} disabled={busy}>
          {busy ? 'Criando...' : 'Usar este modelo'}
        </Button>
      </div>
    </div>
  );
}

function Content({ onBlank, onTemplate, onClose }) {
  const [step, setStep] = useState('choose');
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

  const heading = template
    ? { title: `${template.emoji} ${template.name}`, description: template.description }
    : step === 'templates'
      ? { title: 'Modelos prontos', description: 'Escolha um para ver os itens antes de criar.' }
      : { title: 'Nova lista', description: 'Como você quer começar?' };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{heading.title}</DialogTitle>
        <DialogDescription>{heading.description}</DialogDescription>
      </DialogHeader>
      {template ? (
        <Preview template={template} busy={busy} onBack={() => setTemplate(null)} onCreate={(picked) => run(() => onTemplate(picked))} />
      ) : step === 'templates' ? (
        <TemplateList onPick={setTemplate} onBack={() => setStep('choose')} />
      ) : (
        <Choose busy={busy} onBlank={() => run(onBlank)} onTemplates={() => setStep('templates')} />
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
