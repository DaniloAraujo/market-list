import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function DeleteListsModal({ open, onOpenChange, lists, selected, onSelectedChange, onConfirm }) {
  const deletable = lists.slice(1);
  const allSelected = deletable.length > 0 && selected.length === deletable.length;

  const toggle = (id, checked) =>
    onSelectedChange(checked ? [...selected, id] : selected.filter((s) => s !== id));

  const handleOpenChange = (next) => {
    if (!next) onSelectedChange([]);
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir listas</AlertDialogTitle>
          <AlertDialogDescription>
            Escolha as listas que quer apagar. A primeira lista sempre permanece.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-[40vh] space-y-1 overflow-y-auto">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-b px-3 py-3 text-sm font-semibold">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => onSelectedChange(checked ? deletable.map((l) => l.id) : [])}
            />
            Selecionar todas
          </label>
          {lists.map((list, index) => {
            const locked = index === 0;
            return (
              <label
                key={list.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm',
                  locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted'
                )}
              >
                <Checkbox
                  checked={selected.includes(list.id)}
                  onCheckedChange={(checked) => toggle(list.id, checked)}
                  disabled={locked}
                />
                <span className="min-w-0 flex-1 truncate font-medium">{list.name}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {list.products.length} {list.products.length === 1 ? 'item' : 'itens'}
                </span>
              </label>
            );
          })}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={selected.length === 0}
            className={buttonVariants({ variant: 'destructive' })}
          >
            Excluir {selected.length > 0 && `(${selected.length})`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
