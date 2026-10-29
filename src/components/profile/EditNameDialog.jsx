import { useState } from 'react';
import { toast } from 'sonner';
import Field from '@/components/form/Field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

function NameForm({ user, onUser, onClose }) {
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const trimmed = name.trim();

  const submit = async (event) => {
    event.preventDefault();
    if (!trimmed) return setError('Digite um nome.');
    if (trimmed === user.name) return onClose();
    setBusy(true);
    setError('');
    try {
      const { user: updated } = await api('/v1/me', { method: 'PATCH', body: { name: trimmed } });
      onUser(updated);
      toast.success('Nome atualizado.');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Como você quer ser chamado" error={error}>
        <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}

export default function EditNameDialog({ open, onOpenChange, user, onUser }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nome</DialogTitle>
          <DialogDescription>É assim que as pessoas veem você nas listas compartilhadas.</DialogDescription>
        </DialogHeader>
        {open && <NameForm user={user} onUser={onUser} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}
