import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function DeleteListsModal({
  open,
  onOpenChange,
  lists,
  listsToDelete,
  selectAllLists,
  onSelectAll,
  onListCheckbox,
  onDeleteSelected,
  onDeleteAll,
  onCancel
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Listas</AlertDialogTitle>
          <AlertDialogDescription>
            Selecione as listas para excluir (mínimo de 1 lista deve permanecer)
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 my-4 max-h-[40vh] overflow-y-auto pr-2">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Checkbox checked={selectAllLists} onCheckedChange={onSelectAll} />
            <label className="text-sm font-semibold">Selecionar todas (exceto a primeira)</label>
          </div>
          {lists.map((list, index) => {
            const isFirst = index === 0;
            const isDisabled = isFirst || (lists.length - listsToDelete.length === 1 && !listsToDelete.includes(list.id));
            return (
              <div key={list.id} className={`flex items-center gap-2 ${isDisabled ? 'opacity-50' : ''}`}>
                <Checkbox 
                  checked={listsToDelete.includes(list.id)} 
                  onCheckedChange={(checked) => onListCheckbox(list.id, checked)}
                  disabled={isDisabled}
                />
                <label className="text-sm">{list.name} ({list.products.length} itens)</label>
              </div>
            );
          })}
        </div>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {lists.length > 1 && (
              <Button variant="outline" onClick={onDeleteAll} className="w-full sm:w-auto">
                Excluir Todas (exceto primeira)
              </Button>
            )}
            <AlertDialogAction 
              onClick={onDeleteSelected} 
              disabled={listsToDelete.length === 0} 
              className="bg-red-600 w-full sm:w-auto"
            >
              Excluir Selecionadas
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
