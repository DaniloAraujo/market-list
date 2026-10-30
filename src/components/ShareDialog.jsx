import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Eye, Link2, Pencil, Share2, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const ROLES = {
  viewer: { label: 'Somente ver', hint: 'A pessoa vê a lista, mas não altera nada.', Icon: Eye },
  editor: { label: 'Pode editar', hint: 'A pessoa adiciona, marca e remove itens. As mudanças aparecem na hora para todos.', Icon: Pencil },
};

const formatUntil = (ms) => {
  const date = new Date(ms);
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (date.toDateString() === new Date().toDateString()) return time;
  return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}, ${time}`;
};

function RoleSelect({ value, onChange, disabled }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 w-36 text-sm md:text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ROLES).map(([role, { label }]) => (
          <SelectItem key={role} value={role}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function InviteSection({ listId, invites, onChanged }) {
  const [role, setRole] = useState('viewer');
  const [link, setLink] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const create = async () => {
    setBusy(true);
    try {
      const { invite } = await api(`/v1/lists/${listId}/invites`, { method: 'POST', body: { role } });
      setLink(invite.url);
      setCopied(false);
      onChanged();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar. Selecione o link e copie manualmente.');
    }
  };

  const nativeShare = () => navigator.share({ title: 'Lista no Tá na Lista', text: 'Convite para uma lista no Tá na Lista', url: link }).catch(() => {});

  const revoke = async (id) => {
    try {
      await api(`/v1/lists/${listId}/invites/${id}`, { method: 'DELETE' });
      onChanged();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">Convidar alguém</h3>

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Permissão do convidado">
        {Object.entries(ROLES).map(([value, { label, Icon }]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={role === value}
            onClick={() => {
              setRole(value);
              setLink(null);
            }}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              role === value ? 'border-foreground bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/60'
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{ROLES[role].hint}</p>

      {link ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Link de convite" className="text-base md:text-sm" />
            <Button variant="outline" size="icon" onClick={copy} aria-label="Copiar link">
              {copied ? <Check /> : <Copy />}
            </Button>
            {typeof navigator.share === 'function' && (
              <Button variant="outline" size="icon" onClick={nativeShare} aria-label="Compartilhar link">
                <Share2 />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            O link vale para uma pessoa e expira em 4 horas. Quem abrir precisa entrar na conta para ver a lista.
          </p>
        </div>
      ) : (
        <Button onClick={create} disabled={busy} className="w-full">
          <Link2 /> {busy ? 'Gerando...' : 'Gerar link de convite'}
        </Button>
      )}

      {invites.length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="text-xs font-medium text-muted-foreground">Convites aguardando</p>
          <ul className="divide-y rounded-lg border">
            {invites.map((invite) => (
              <li key={invite.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <span className="flex-1">
                  {ROLES[invite.role].label}
                  <span className="text-xs text-muted-foreground"> · até {formatUntil(invite.expiresAt)}</span>
                </span>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => revoke(invite.id)}>
                  Cancelar
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function MembersSection({ owner, members, isOwner, currentUserId, listId, onChanged, onLeft }) {
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);

  const changeRole = async (userId, role) => {
    try {
      await api(`/v1/lists/${listId}/members/${userId}`, { method: 'PATCH', body: { role } });
      onChanged();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const confirmRemove = async () => {
    const { userId, name } = removing;
    setBusy(true);
    try {
      await api(`/v1/lists/${listId}/members/${userId}`, { method: 'DELETE' });
      setRemoving(null);
      if (userId === currentUserId) onLeft();
      else {
        toast(`${name} foi removido(a) da lista.`);
        onChanged();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">Pessoas com acesso</h3>
      <ul className="divide-y rounded-lg border">
        <li className="flex items-center gap-2 px-3 py-2 text-sm">
          <span className="min-w-0 flex-1 truncate">{owner?.name}{owner?.id === currentUserId && ' (você)'}</span>
          <span className="text-xs text-muted-foreground">Dono</span>
        </li>
        {members.map((member) => {
          const me = member.userId === currentUserId;
          return (
            <li key={member.userId} className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 basis-36">
                <span className="block truncate">{member.name}{me && ' (você)'}</span>
                {member.email && <span className="block truncate text-xs text-muted-foreground">{member.email}</span>}
              </span>
              {isOwner ? (
                <RoleSelect value={member.role} onChange={(role) => changeRole(member.userId, role)} />
              ) : (
                <span className="text-xs text-muted-foreground">{ROLES[member.role].label}</span>
              )}
              {(isOwner || me) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-muted-foreground hover:text-destructive"
                  onClick={() => setRemoving(member)}
                  aria-label={me ? 'Sair da lista' : `Remover ${member.name} da lista`}
                >
                  <UserMinus /> {me ? 'Sair' : 'Remover'}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {members.length === 0 && <p className="text-xs text-muted-foreground">Ninguém além de você tem acesso a esta lista.</p>}

      <AlertDialog open={!!removing} onOpenChange={(next) => !next && !busy && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {removing?.userId === currentUserId ? 'Sair da lista?' : `Remover ${removing?.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {removing?.userId === currentUserId
                ? 'Você perde o acesso a esta lista. Para voltar, o dono precisa convidar você de novo.'
                : `${removing?.name} perde o acesso a esta lista agora. Você pode convidar a pessoa de novo depois.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmRemove} disabled={busy}>
              {busy ? 'Removendo...' : removing?.userId === currentUserId ? 'Sair da lista' : 'Remover'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export default function ShareDialog({ open, onOpenChange, list, user, membersVersion, onLeft }) {
  const isOwner = list?.role === 'owner';
  const [data, setData] = useState({ invites: [], members: [], owner: null });

  const listId = list?.id;

  const fetchData = useCallback(async () => {
    const [members, invites] = await Promise.all([
      api(`/v1/lists/${listId}/members`),
      isOwner ? api(`/v1/lists/${listId}/invites`) : Promise.resolve({ invites: [] }),
    ]);
    return { owner: members.owner, members: members.members, invites: invites.invites };
  }, [listId, isOwner]);

  const load = useCallback(() => fetchData().then(setData).catch((error) => toast.error(error.message)), [fetchData]);

  useEffect(() => {
    if (!open || !listId) return undefined;
    let cancelled = false;
    fetchData()
      .then((next) => !cancelled && setData(next))
      .catch((error) => !cancelled && toast.error(error.message));
    return () => {
      cancelled = true;
    };
  }, [open, listId, fetchData, membersVersion]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar “{list?.name}”</DialogTitle>
          <DialogDescription>
            {isOwner
              ? 'Convide pessoas por link e gerencie quem tem acesso. Você pode remover alguém quando quiser.'
              : `Só ${list?.owner?.name} pode convidar novas pessoas para esta lista.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isOwner && data.members.length === 0 && <InviteSection listId={list.id} invites={data.invites} onChanged={load} />}
          <MembersSection
            owner={data.owner}
            members={data.members}
            isOwner={isOwner}
            currentUserId={user.id}
            listId={list?.id}
            onChanged={load}
            onLeft={() => {
              onOpenChange(false);
              onLeft();
            }}
          />
          {isOwner && data.members.length > 0 && <InviteSection listId={list.id} invites={data.invites} onChanged={load} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
