import { useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/auth/auth-context';
import Avatar from '@/components/Avatar';
import Field from '@/components/form/Field';
import Logo from '@/components/Logo';
import PasswordInput from '@/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { imageToAvatar } from '@/utils/resizeImage';

function Section({ title, description, children }) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PhotoSection({ user, onUser }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const image = await imageToAvatar(file);
      const { user: updated } = await api('/v1/me/avatar', { method: 'PUT', body: { image } });
      onUser(updated);
      toast.success('Foto atualizada.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      const { user: updated } = await api('/v1/me/avatar', { method: 'DELETE' });
      onUser(updated);
      toast.success('Foto removida.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title="Foto de perfil" description="Aparece para quem compartilha listas com você.">
      <div className="flex items-center gap-4">
        <Avatar user={user} className="h-20 w-20 text-2xl" />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            <Camera /> {busy ? 'Enviando...' : 'Escolher foto'}
          </Button>
          {user.avatarUrl && (
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={remove}>
              <Trash2 /> Remover
            </Button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={upload} />
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </Section>
  );
}

function NameSection({ user, onUser }) {
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const changed = name.trim() !== user.name && name.trim() !== '';

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { user: updated } = await api('/v1/me', { method: 'PATCH', body: { name: name.trim() } });
      onUser(updated);
      toast.success('Nome atualizado.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title="Nome">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Como você quer ser chamado" error={error}>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
        </Field>
        <Button type="submit" size="sm" disabled={busy || !changed}>
          {busy ? 'Salvando...' : 'Salvar nome'}
        </Button>
      </form>
    </Section>
  );
}

function PasswordSection({ user, onUser }) {
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
      setCurrent('');
      setNext('');
      setConfirm('');
      toast.success(user.hasPassword ? 'Senha alterada. Os outros aparelhos foram desconectados.' : 'Senha definida.');
    } catch (err) {
      const field = err.details?.[0]?.field;
      const message = err.details?.[0]?.message ?? err.message;
      setErrors(field === 'currentPassword' ? { current: message } : { next: message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section
      title={user.hasPassword ? 'Alterar senha' : 'Definir senha'}
      description={
        user.hasPassword
          ? 'Ao trocar, os outros aparelhos conectados saem da sua conta.'
          : 'Você entra com o Google. Defina uma senha para também poder entrar com e-mail e senha.'
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
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
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? 'Salvando...' : user.hasPassword ? 'Alterar senha' : 'Definir senha'}
        </Button>
      </form>
    </Section>
  );
}

export default function ProfilePage() {
  const { status, user, updateUser } = useAuth();

  if (status === 'loading') return null;
  if (status !== 'authed') return <Navigate to="/login?next=/perfil" replace />;

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link to="/">
            <ArrowLeft /> Voltar às listas
          </Link>
        </Button>
        <Logo className="h-8 w-8" />
      </div>

      <h1 className="font-display text-2xl font-semibold tracking-tight">Meu perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

      <div className="mt-6 space-y-4">
        <PhotoSection user={user} onUser={updateUser} />
        <NameSection key={user.name} user={user} onUser={updateUser} />
        <PasswordSection user={user} onUser={updateUser} />
      </div>
    </main>
  );
}
