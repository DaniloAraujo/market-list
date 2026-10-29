import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, KeyRound, LogIn, LogOut, Mail, Palette, Sparkles, User, UserRound, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/auth/auth-context';
import Avatar from '@/components/Avatar';
import DeleteAccountModal from '@/components/modals/DeleteAccountModal';
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog';
import EditNameDialog from '@/components/profile/EditNameDialog';
import { SettingsGroup, SettingsRow } from '@/components/profile/SettingsList';
import ThemeToggle from '@/components/ThemeToggle';
import { api } from '@/lib/api';
import { CONTACT_EMAIL } from '@/lib/contact';
import { imageToAvatar } from '@/utils/resizeImage';

function ProfileHeader({ user, onUser }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const image = await imageToAvatar(file);
      const { user: updated } = await api('/v1/me/avatar', { method: 'PUT', body: { image } });
      onUser(updated);
      toast.success('Foto atualizada.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const { user: updated } = await api('/v1/me/avatar', { method: 'DELETE' });
      onUser(updated);
      toast.success('Foto removida.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="flex flex-col items-center text-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label="Alterar foto de perfil"
        className="group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
      >
        <Avatar user={user} className="h-24 w-24 text-3xl" />
        <span className="absolute bottom-0 right-0 grid h-8 w-8 place-content-center rounded-full border-2 border-background bg-primary text-primary-foreground transition-transform group-hover:scale-105">
          <Camera className="h-4 w-4" />
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={upload} />

      <h1 className="mt-4 max-w-full truncate font-display text-2xl font-semibold tracking-tight">{user.name}</h1>
      <p className="max-w-full truncate text-sm text-muted-foreground">{user.email}</p>
      {user.avatarUrl && (
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="mt-2 rounded text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60"
        >
          Remover foto
        </button>
      )}
    </header>
  );
}

function AppearanceGroup() {
  return (
    <SettingsGroup title="Preferências">
      <SettingsRow icon={Palette} label="Aparência">
        <ThemeToggle />
      </SettingsRow>
    </SettingsGroup>
  );
}

function Footer() {
  return (
    <footer className="space-y-3 pt-2 text-center text-xs text-muted-foreground">
      <p className="flex items-center justify-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Em breve, novidades por aqui.
      </p>
      <p>
        Para contato, fale conosco via e-mail:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-foreground underline underline-offset-4">
          {CONTACT_EMAIL}
        </a>
      </p>
      <p>
        <Link to="/termos" className="underline-offset-4 hover:underline">
          Termos de Uso
        </Link>
        {' · '}
        <Link to="/privacidade" className="underline-offset-4 hover:underline">
          Política de Privacidade
        </Link>
      </p>
      <p>© {new Date().getFullYear()} Tá na Lista. Todos os direitos reservados.</p>
    </footer>
  );
}

function GuestProfile({ authEnabled }) {
  return (
    <>
      <header className="flex flex-col items-center text-center">
        <span className="grid h-24 w-24 place-content-center rounded-full bg-muted text-muted-foreground">
          <UserRound className="h-10 w-10" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">Convidado</h1>
        <p className="text-sm text-muted-foreground">Suas listas ficam salvas só neste aparelho.</p>
      </header>

      <div className="mt-8 space-y-6">
        {authEnabled && (
          <SettingsGroup>
            <SettingsRow icon={LogIn} label="Entrar ou criar conta" to="/login?next=/perfil" accent />
          </SettingsGroup>
        )}
        {authEnabled && (
          <p className="-mt-3 px-1 text-xs text-muted-foreground">
            Com uma conta você guarda as listas na nuvem, usa em qualquer aparelho e compartilha com quem quiser.
          </p>
        )}
        <AppearanceGroup />
        <Footer />
      </div>
    </>
  );
}

function AccountProfile({ user, onUser }) {
  const { logout, deleteAccount } = useAuth();
  const [nameOpen, setNameOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast('Você saiu da conta.');
  };

  const handleDelete = async (confirmEmail) => {
    await deleteAccount(confirmEmail);
    toast('Conta excluída. Você pode reativá-la cadastrando o mesmo e-mail.');
  };

  return (
    <>
      <ProfileHeader user={user} onUser={onUser} />

      <div className="mt-8 space-y-6">
        <SettingsGroup title="Conta">
          <SettingsRow icon={User} label="Nome" value={user.name} onClick={() => setNameOpen(true)} />
          <SettingsRow icon={Mail} label="E-mail" value={user.email} />
          <SettingsRow
            icon={KeyRound}
            label="Senha"
            value={user.hasPassword ? '••••••••' : 'Não definida'}
            onClick={() => setPasswordOpen(true)}
          />
        </SettingsGroup>

        <AppearanceGroup />

        <SettingsGroup>
          <SettingsRow icon={LogOut} label="Sair" onClick={handleLogout} chevron={false} />
          <SettingsRow icon={UserX} label="Excluir conta" onClick={() => setDeleteOpen(true)} destructive chevron={false} />
        </SettingsGroup>

        <Footer />
      </div>

      <EditNameDialog open={nameOpen} onOpenChange={setNameOpen} user={user} onUser={onUser} />
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} user={user} onUser={onUser} />
      <DeleteAccountModal open={deleteOpen} onOpenChange={setDeleteOpen} email={user.email} onConfirm={handleDelete} />
    </>
  );
}

export default function ProfileScreen() {
  const { user, updateUser, enabled } = useAuth();

  return (
    <main className="mx-auto w-full max-w-lg px-4 pb-6 pt-8 sm:pt-12">
      {user ? <AccountProfile user={user} onUser={updateUser} /> : <GuestProfile authEnabled={enabled} />}
    </main>
  );
}
