import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { releasePointerLock } from '@/lib/releasePointerLock';

function ConfirmModal({ open, onOpenChange, title, description, confirmLabel, busyLabel, onConfirm }) {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      releasePointerLock();
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={busy}>
            {busy ? busyLabel : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeleteListModal({ open, onOpenChange, list, onConfirm }) {
  const sharedWith = list?.role === 'owner' ? (list.memberCount ?? 0) : 0;

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Excluir “${list?.name ?? ''}”?`}
      description={
        sharedWith > 0
          ? `A lista e todos os itens serão apagados. As ${sharedWith} ${sharedWith === 1 ? 'pessoa' : 'pessoas'} com quem você compartilhou perdem o acesso. Isso não pode ser desfeito.`
          : 'A lista e todos os itens serão apagados. Isso não pode ser desfeito.'
      }
      confirmLabel="Excluir lista"
      busyLabel="Excluindo..."
      onConfirm={onConfirm}
    />
  );
}

export function LeaveListModal({ open, onOpenChange, list, onConfirm }) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Sair de “${list?.name ?? ''}”?`}
      description={`Você perde o acesso a esta lista. Ela continua com ${list?.owner?.name ?? 'o dono'}, e para voltar será preciso receber um novo convite.`}
      confirmLabel="Sair da lista"
      busyLabel="Saindo..."
      onConfirm={onConfirm}
    />
  );
}
