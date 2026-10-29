import { Link } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/** Aviso exibido ao tentar compartilhar sem estar logado. */
export default function LoginRequiredModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" /> Entre para compartilhar
          </DialogTitle>
          <DialogDescription>
            Você precisa estar logado para ter acesso à opção de compartilhar a lista. Suas listas atuais continuam
            aqui e você poderá levá-las para a conta.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Agora não
          </Button>
          <Button asChild>
            <Link to="/login">Entrar ou criar conta</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
