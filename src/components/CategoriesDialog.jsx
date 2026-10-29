import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useCategories } from '@/categories/categories-context';
import Field from '@/components/form/Field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { categoryToneClasses, resolveCategory } from '@/utils/categoryUtils';
import { cn } from '@/lib/utils';

const EMOJIS = [
  '🏷️', '🛒', '🍎', '🥦', '🍞', '🧀', '🍖', '🐟', '🥚', '🍫', '🍕', '🍺', '☕', '🥤', '🧃', '🍷',
  '🧂', '🌶️', '🥫', '🍳', '🧴', '🧼', '🧽', '🧻', '🪥', '💊', '🩹', '💄', '🪒', '👕', '👟', '🎒',
  '📚', '✏️', '🖨️', '💡', '🔌', '🔧', '🛠️', '🪴', '🌱', '🏠', '🛏️', '🚗', '⛽', '✈️', '🏖️', '⛺',
  '🎉', '🎂', '🎁', '🎈', '🎮', '⚽', '🏋️', '🐶', '🐱', '🐾', '👶', '💼', '💰', '📦', '⭐', '❤️',
];

export default function CategoriesDialog({ open, onOpenChange, onCreated }) {
  const { custom, create, remove, maxCustom } = useCategories();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏷️');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const full = custom.length >= maxCustom;

  const submit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!name.trim()) return setError('Dê um nome para a categoria.');
    if (!emoji.trim()) return setError('Escolha um emoji.');
    setBusy(true);
    setError('');
    try {
      const category = await create({ name: name.trim(), emoji: emoji.trim() });
      setName('');
      onCreated?.(category);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removeOne = async (category) => {
    try {
      await remove(category.id);
      toast(`Categoria “${category.name}” removida. Os itens dela voltaram para “Outros”.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Categorias da lista</DialogTitle>
          <DialogDescription>Crie categorias com o seu emoji. Elas valem só para esta lista.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Nome" error={error}>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Ex.: Festa, Pets, Obra..."
              maxLength={24}
              autoComplete="off"
              disabled={full}
            />
          </Field>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Emoji</p>
            <div className="flex items-center gap-2">
              <Input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                aria-label="Emoji da categoria"
                maxLength={16}
                className="w-20 text-center text-xl"
                disabled={full}
              />
              <p className="text-xs text-muted-foreground">Escolha abaixo ou cole qualquer emoji.</p>
            </div>
            <div className="grid max-h-36 grid-cols-8 gap-1 overflow-y-auto rounded-lg border p-1.5">
              {EMOJIS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEmoji(item)}
                  aria-label={`Usar ${item}`}
                  aria-pressed={emoji === item}
                  disabled={full}
                  className={cn(
                    'grid h-8 place-content-center rounded-md text-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                    emoji === item && 'bg-primary-soft'
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={busy || full}>
            {full ? `Limite de ${maxCustom} categorias` : busy ? 'Criando...' : 'Criar categoria'}
          </Button>
        </form>

        {custom.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-medium">
              Suas categorias <span className="font-normal text-muted-foreground">({custom.length}/{maxCustom})</span>
            </h3>
            <ul className="divide-y rounded-lg border">
              {custom.map((item) => {
                const category = resolveCategory(item.id, custom);
                return (
                  <li key={item.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', categoryToneClasses(category))}>
                      <span aria-hidden>{category.emoji}</span>
                      {category.label}
                    </span>
                    <span className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeOne(item)}
                      aria-label={`Remover a categoria ${item.name}`}
                    >
                      <X />
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
