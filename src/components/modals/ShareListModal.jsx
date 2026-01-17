import { Share2, Copy, CheckCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ShareListModal({
  open,
  onOpenChange,
  listName,
  shareLink,
  copied,
  onCopy,
  onShare,
  onClose
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Compartilhar Lista
          </AlertDialogTitle>
          <AlertDialogDescription>
            Compartilhe sua lista "{listName}" com outras pessoas
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 my-6">
          <div>
            <Label>Link de Compartilhamento</Label>
            <div className="flex gap-2 mt-2">
              <Input 
                value={shareLink} 
                readOnly 
                className="flex-1 bg-gray-50" 
                onClick={(e) => e.target.select()} 
              />
              <Button onClick={onCopy} variant="outline" size="icon" title="Copiar link">
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Link copiado para a área de transferência!
              </p>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Como funciona:</strong>
            </p>
            <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li>Compartilhe o link com quem quiser</li>
              <li>Ao abrir, a lista será importada automaticamente</li>
              <li>Cada pessoa terá sua própria cópia (edições não afetam sua lista)</li>
            </ul>
          </div>
        </div>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={onShare} variant="default" className="w-full sm:w-auto">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <AlertDialogCancel onClick={onClose} className="w-full sm:w-auto">
            Fechar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
