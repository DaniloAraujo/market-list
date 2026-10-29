import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/auth/auth-context';
import { pendingNext } from '@/auth/pending-next';
import AuthShell from '@/components/AuthShell';
import Field from '@/components/form/Field';
import PasswordInput from '@/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, googleLoginUrl } from '@/lib/api';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-3l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
    <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
  </svg>
);

const safeNext = (next) => (next && /^\/(?!\/)/.test(next) ? next : '/');

export default function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const mode = params.get('mode') === 'register' ? 'register' : 'login';
  const next = safeNext(params.get('next') ?? pendingNext.get());
  const googleFailed = params.get('error') === 'google';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(googleFailed ? 'Não foi possível entrar com o Google. Tente de novo.' : '');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);

  if (status === 'authed') {
    pendingNext.clear();
    return <Navigate to={next} replace />;
  }

  const switchMode = () => {
    const nextParams = new URLSearchParams(params);
    if (mode === 'login') nextParams.set('mode', 'register');
    else nextParams.delete('mode');
    nextParams.delete('error');
    setParams(nextParams, { replace: true });
    setError('');
    setNeedsVerification(false);
    setDisabled(false);
  };

  const rememberNext = () => pendingNext.set(next === '/' ? null : next);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNeedsVerification(false);
    setDisabled(false);
    setBusy(true);
    rememberNext();
    try {
      if (mode === 'register') {
        const result = await api('/v1/auth/register', { method: 'POST', body: { name, email, password }, token: null });
        if (result.verificationRequired === false) {
          // A API não exige confirmar o e-mail: a conta já está pronta, então entra direto.
          await login(email, password);
          pendingNext.clear();
          navigate(next, { replace: true });
        } else {
          setRegisteredEmail(email);
        }
      } else {
        await login(email, password);
        pendingNext.clear();
        navigate(next, { replace: true });
      }
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') setNeedsVerification(true);
      if (err.code === 'ACCOUNT_DISABLED') setDisabled(true);
      const field = err.details?.[0]?.message;
      setError(err.code === 'VALIDATION_ERROR' && field ? `${err.message} ${field}.` : err.message);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await api('/v1/auth/resend-verification', { method: 'POST', body: { email: registeredEmail || email }, token: null });
      setResent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (registeredEmail) {
    return (
      <AuthShell title="Confirme seu e-mail" footer={<Link to="/" className="underline-offset-4 hover:underline">Continuar sem conta</Link>}>
        <div className="flex flex-col items-center gap-3 text-center">
          <MailCheck className="h-10 w-10 text-primary" />
          <p className="text-sm">
            Enviamos um e-mail para <strong>{registeredEmail}</strong>. Abra o link para confirmar sua conta e depois entre. Se este e-mail já teve uma conta desativada, o link serve para reativá-la.
          </p>
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            Não encontrou? Olhe também a pasta de <strong className="text-foreground">spam</strong> ou lixo eletrônico e, se o
            e-mail estiver lá, marque como “não é spam”. Pode levar alguns minutos para chegar.
          </p>
          <Button variant="ghost" size="sm" onClick={resend} disabled={resent}>
            {resent ? 'E-mail reenviado' : 'Reenviar e-mail'}
          </Button>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setRegisteredEmail('');
              switchMode();
            }}
          >
            Já confirmei, quero entrar
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={mode === 'register' ? 'Criar conta' : 'Entrar'}
      subtitle={
        next.startsWith('/invite/')
          ? 'Entre para aceitar o convite e ver a lista compartilhada com você.'
          : 'Salve suas listas na nuvem, use em qualquer aparelho e compartilhe com quem quiser.'
      }
      footer={
        <Link to="/" className="underline-offset-4 hover:underline">
          Continuar sem conta
        </Link>
      }
    >
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          rememberNext();
          window.location.assign(googleLoginUrl(next));
        }}
      >
        <GoogleIcon /> Continuar com Google
      </Button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {mode === 'register' && (
          <Field label="Nome">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} required />
          </Field>
        )}
        <Field label="E-mail">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required />
        </Field>
        <Field label="Senha" hint={mode === 'register' ? 'Mínimo de 8 caracteres.' : undefined}>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
          />
        </Field>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {disabled && (
          <Button type="button" variant="soft" size="sm" onClick={switchMode}>
            Reativar minha conta
          </Button>
        )}
        {needsVerification && (
          <Button type="button" variant="ghost" size="sm" onClick={resend} disabled={resent}>
            {resent ? 'E-mail reenviado' : 'Reenviar e-mail de confirmação'}
          </Button>
        )}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Aguarde...' : mode === 'register' ? 'Criar conta' : 'Entrar'}
        </Button>
        {mode === 'register' && (
          <p className="text-center text-xs text-muted-foreground">
            Ao criar a conta, você concorda com os{' '}
            <Link to="/termos" className="underline underline-offset-4">Termos de Uso</Link> e a{' '}
            <Link to="/privacidade" className="underline underline-offset-4">Política de Privacidade</Link>.
          </p>
        )}
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button type="button" onClick={switchMode} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          {mode === 'register' ? 'Já tenho conta' : 'Criar conta'}
        </button>
        {mode === 'login' && (
          <Link to="/forgot-password" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Esqueci minha senha
          </Link>
        )}
      </div>
    </AuthShell>
  );
}
