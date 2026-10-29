import { useState } from 'react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Field from '@/components/form/Field';

export default function DeleteAccountModal({ open, onOpenChange, email, onConfirm }) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  const handleOpenChange = (next) => {
    if (busy) return;
    if (!next) {
      setTyped('');
      setError('');
    }
    onOpenChange(next);
  };

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm(typed.trim());
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir minha conta?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Sua conta será <strong className="text-foreground">desativada</strong> e você será desconectado de todos os
                aparelhos. Não será possível entrar até reativá-la.
              </p>
              <p>
                Suas listas ficam guardadas. Para voltar, crie uma conta com <strong className="text-foreground">{email}</strong>{' '}
                (enviaremos um link de reativação) ou entre com o Google.
              </p>
              <p>Pessoas convidadas nas suas listas continuam com acesso a elas.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Field label="Para confirmar, digite seu e-mail" error={error}>
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={email} autoComplete="off" inputMode="email" />
        </Field>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={!matches || busy}>
            {busy ? 'Excluindo...' : 'Excluir conta'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
