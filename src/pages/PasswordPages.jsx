import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthShell from '@/components/AuthShell';
import Field from '@/components/form/Field';
import PasswordInput from '@/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/v1/auth/forgot-password', { method: 'POST', body: { email }, token: null });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Esqueci minha senha"
      subtitle="Informe seu e-mail e enviaremos um link para criar uma nova senha."
      footer={<Link to="/login" className="underline-offset-4 hover:underline">Voltar para o login</Link>}
    >
      {sent ? (
        <p className="text-sm">
          Se existir uma conta com <strong>{email}</strong>, você receberá o link em instantes. Ele vale por 1 hora.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="E-mail">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </Field>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Enviando...' : 'Enviar link'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/v1/auth/reset-password', { method: 'POST', body: { token, password }, token: null });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Nova senha" subtitle={done ? undefined : 'Escolha uma senha com pelo menos 8 caracteres.'}>
      {done ? (
        <div className="space-y-4">
          <p className="text-sm">Senha alterada. Por segurança, você foi desconectado dos outros aparelhos.</p>
          <Button asChild className="w-full">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Nova senha">
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
          </Field>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy || !token}>
            {busy ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
