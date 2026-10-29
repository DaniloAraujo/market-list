import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import logo from '@/assets/logo_ta-na-lista-not-name.png';
import { cn } from '@/lib/utils';

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <img src={logo} alt="" className="h-8 w-8 object-contain" />
      <p className="font-display text-base font-semibold tracking-tight">Tá na Lista</p>
    </div>
  );
}

export default function Sidebar({ lists, currentListId, onSelectList, onCreateList, onDeleteLists, onNavigate }) {
  const select = (id) => {
    onSelectList(id);
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Minhas listas" className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {lists.map((list) => {
          const active = list.id === currentListId;
          const done = list.products.filter((p) => p.collected).length;
          return (
            <button
              key={list.id}
              type="button"
              onClick={() => select(list.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              <span className="min-w-0 flex-1 truncate">{list.name}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {list.products.length > 0 ? `${done}/${list.products.length}` : ''}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => {
            onCreateList();
            onNavigate?.();
          }}
        >
          <Plus /> Nova lista
        </Button>
        {lists.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={() => {
              onDeleteLists();
              onNavigate?.();
            }}
          >
            <Trash2 /> Excluir listas
          </Button>
        )}
        <div className="flex items-center justify-between px-1 pt-2">
          <span className="text-xs text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
