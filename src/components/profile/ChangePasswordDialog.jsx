import { useState } from 'react';
import { toast } from 'sonner';
import Field from '@/components/form/Field';
import PasswordInput from '@/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';

function PasswordForm({ user, onUser, onClose }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (user.hasPassword && !current) found.current = 'Informe a senha atual.';
    if (next.length < 8) found.next = 'A nova senha precisa ter pelo menos 8 caracteres.';
    if (next !== confirm) found.confirm = 'As senhas não são iguais.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const { user: updated } = await api('/v1/me/password', {
        method: 'POST',
        body: { currentPassword: user.hasPassword ? current : undefined, newPassword: next },
      });
      onUser(updated);
      toast.success(user.hasPassword ? 'Senha alterada. Os outros aparelhos foram desconectados.' : 'Senha definida.');
      onClose();
    } catch (err) {
      const field = err.details?.[0]?.field;
      const message = err.details?.[0]?.message ?? err.message;
      setErrors(field === 'currentPassword' ? { current: message } : { next: message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {user.hasPassword && (
        <Field label="Senha atual" error={errors.current}>
          <PasswordInput value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        </Field>
      )}
      <Field label="Nova senha" error={errors.next}>
        <PasswordInput value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
      </Field>
      <Field label="Repita a nova senha" error={errors.confirm}>
        <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Salvando...' : user.hasPassword ? 'Alterar senha' : 'Definir senha'}
        </Button>
      </div>
    </form>
  );
}

export default function ChangePasswordDialog({ open, onOpenChange, user, onUser }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user.hasPassword ? 'Alterar senha' : 'Definir senha'}</DialogTitle>
          <DialogDescription>
            {user.hasPassword
              ? 'Ao trocar, os outros aparelhos conectados saem da sua conta.'
              : 'Você entra com o Google. Defina uma senha para também poder entrar com e-mail e senha.'}
          </DialogDescription>
        </DialogHeader>
        {open && <PasswordForm user={user} onUser={onUser} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}
