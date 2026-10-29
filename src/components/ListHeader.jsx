import { Eye, Pencil, Share2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CONNECTION = {
  online: { label: 'Sincronizado em tempo real', dot: 'bg-success' },
  connecting: { label: 'Conectando...', dot: 'bg-amber-400' },
  offline: { label: 'Sem conexão. Tentando reconectar...', dot: 'bg-destructive' },
};

/** Título editável (só o dono renomeia), botão de compartilhar e quem compartilhou, se for convidado. */
export default function ListHeader({ list, readOnlyTitle, connection, onRename, onCommit, onShare }) {
  const name = list?.name ?? '';
  const guest = list && list.role !== 'owner';
  const sharedWith = list?.role === 'owner' ? (list.memberCount ?? 0) : 0;
  const status = connection && CONNECTION[connection];

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => onRename(e.target.value)}
          onBlur={onCommit}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          readOnly={readOnlyTitle}
          maxLength={80}
          placeholder="Nome da lista"
          aria-label="Nome da lista"
          className={cn(
            '-mx-2 min-w-0 flex-1 truncate rounded-lg bg-transparent px-2 py-1 font-display text-2xl font-semibold tracking-tight outline-none transition-colors placeholder:text-muted-foreground/60 sm:text-3xl',
            !readOnlyTitle && 'hover:bg-muted/60 focus-visible:bg-muted/60'
          )}
        />
        {status && (
          <span title={status.label} role="status" className="grid h-8 w-5 shrink-0 place-content-center">
            <span className={cn('h-2 w-2 rounded-full', status.dot)} />
            <span className="sr-only">{status.label}</span>
          </span>
        )}
        <Button variant="outline" size="sm" onClick={onShare} className="shrink-0" aria-label="Compartilhar lista">
          <Share2 /> <span className="hidden sm:inline">Compartilhar</span>
        </Button>
      </div>

      {sharedWith > 0 && (
        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-1.5 rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Users className="h-3.5 w-3.5" />
          Compartilhada com {sharedWith} {sharedWith === 1 ? 'pessoa' : 'pessoas'} · ver e gerenciar
        </button>
      )}

      {guest && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {list.role === 'viewer' ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          Compartilhada por {list.owner?.name} · {list.role === 'viewer' ? 'somente leitura' : 'você pode editar'}
        </p>
      )}
    </div>
  );
}
