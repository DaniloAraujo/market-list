import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/auth/auth-context';
import { pendingNext } from '@/auth/pending-next';
import AuthShell from '@/components/AuthShell';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const ROLE_TEXT = {
  viewer: { label: 'somente ler', Icon: Eye },
  editor: { label: 'ler e editar', Icon: Pencil },
};

/**
 * Tela aberta pelo link de convite. Mostra quem convidou e, estando logado, entra na lista
 * (ela passa a aparecer na aba "Convidado"). Sem login, leva ao login e volta para cá.
 */
export default function InvitePage() {
  const { token } = useParams();
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api(`/v1/invites/${token}`, { token: null })
      .then(({ invite }) => !cancelled && setPreview(invite))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const here = `/invite/${token}`;

  const accept = async () => {
    setBusy(true);
    try {
      const { list } = await api(`/v1/invites/${token}/accept`, { method: 'POST', body: {} });
      try {
        localStorage.setItem(`cloud:current:${user.id}`, list.id);
      } catch {
        // sem storage: a lista aparece na aba Convidado, só não abre sozinha
      }
      toast.success(`Você entrou na lista "${list.name}"`);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (error) {
    return (
      <AuthShell title="Convite indisponível">
        <div className="space-y-4">
          <p className="text-sm">{error}</p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/">Ir para minhas listas</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (!preview || status === 'loading') {
    return (
      <AuthShell title="Convite">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AuthShell>
    );
  }

  const { label, Icon } = ROLE_TEXT[preview.role];

  return (
    <AuthShell title="Você foi convidado">
      <div className="space-y-5">
        <p className="text-sm">
          <strong>{preview.ownerName}</strong> compartilhou a lista <strong>“{preview.listName}”</strong> com você.
        </p>
        <p className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" /> Você poderá {label}.
        </p>

        {status === 'authed' ? (
          <Button className="w-full" onClick={accept} disabled={busy}>
            {busy ? 'Entrando na lista...' : 'Aceitar convite'}
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Entre na sua conta para ter acesso à lista.</p>
            <Button asChild className="w-full" onClick={() => pendingNext.set(here)}>
              <Link to={`/login?next=${encodeURIComponent(here)}`}>Entrar</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" onClick={() => pendingNext.set(here)}>
              <Link to={`/login?mode=register&next=${encodeURIComponent(here)}`}>Criar conta</Link>
            </Button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
