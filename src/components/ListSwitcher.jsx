import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Chip({ list, active, onSelect }) {
  const RoleIcon = list.role === 'viewer' ? Eye : list.role === 'editor' ? Pencil : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(list.id)}
      aria-current={active ? 'true' : undefined}
      title={list.role !== 'owner' && list.owner ? `Compartilhada por ${list.owner.name}` : undefined}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-transparent text-foreground hover:bg-muted'
      )}
    >
      {RoleIcon && <RoleIcon className="h-3.5 w-3.5" aria-label={list.role === 'viewer' ? 'Somente leitura' : 'Pode editar'} />}
      <span className="max-w-[10rem] truncate">{list.name}</span>
    </button>
  );
}

export default function ListSwitcher({ owned, shared, currentId, limits, canDelete, onSelect, onCreate, onDelete }) {
  const full = limits && owned.length >= limits.maxLists;

  return (
    <div className="space-y-1.5">
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {owned.map((list) => (
          <Chip key={list.id} list={list} active={list.id === currentId} onSelect={onSelect} />
        ))}
        {shared.length > 0 && <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border" />}
        {shared.map((list) => (
          <Chip key={list.id} list={list} active={list.id === currentId} onSelect={onSelect} />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 rounded-full border-dashed px-3.5 text-sm"
          disabled={full}
          onClick={onCreate}
        >
          <Plus /> Nova lista
        </Button>
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            aria-label="Excluir listas"
            title="Excluir listas"
          >
            <Trash2 />
          </Button>
        )}
      </div>
      {full && (
        <p className="text-xs text-muted-foreground">
          Limite de {limits.maxLists} listas atingido. Exclua uma para criar outra.
        </p>
      )}
    </div>
  );
}
