import { Link } from 'react-router-dom';
import { Eye, LogOut, MoreHorizontal, Pencil, Plus, Trash2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ThemeToggle from '@/components/ThemeToggle';
import logo from '@/assets/logo_ta-na-lista-not-name.png';
import { cn } from '@/lib/utils';

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <img src={logo} alt="" className="h-8 w-8 object-contain" />
      <p className="font-display text-base font-semibold tracking-tight">Tá na Lista</p>
    </div>
  );
}

function ListButton({ list, active, onSelect }) {
  const hasItems = list.itemCount > 0;
  const RoleIcon = list.role === 'viewer' ? Eye : list.role === 'editor' ? Pencil : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(list.id)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate">{list.name}</span>
        {list.role !== 'owner' && list.owner && <span className="block truncate text-xs font-normal text-muted-foreground">de {list.owner.name}</span>}
      </span>
      {RoleIcon && <RoleIcon className="h-3.5 w-3.5 shrink-0" aria-label={list.role === 'viewer' ? 'Somente leitura' : 'Pode editar'} />}
      <span className="text-xs tabular-nums text-muted-foreground">
        {hasItems ? `${list.collectedCount}/${list.itemCount}` : ''}
      </span>
    </button>
  );
}

function Account({ user, onLogout, onDeleteAccount }) {
  return (
    <div className="flex items-center gap-2 rounded-md px-1 py-1">
      <span className="grid h-8 w-8 shrink-0 place-content-center rounded-full bg-primary-soft text-sm font-semibold text-accent-foreground">
        {user.name.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-medium">{user.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Menu da conta" title="Conta">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top">
          <DropdownMenuItem onSelect={onLogout}>
            <LogOut /> Sair
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={onDeleteAccount}>
            <UserX /> Excluir conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function Sidebar({
  owned,
  shared,
  currentId,
  limits,
  authEnabled,
  user,
  onSelectList,
  onCreateList,
  onDeleteLists,
  onLogout,
  onDeleteAccount,
  onNavigate,
}) {
  const select = (id) => {
    onSelectList(id);
    onNavigate?.();
  };

  const listFull = limits && owned.length >= limits.maxLists;
  const canDelete = owned.length > (user ? 0 : 1);

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Listas" className="flex-1 space-y-5 overflow-y-auto p-3">
        <section className="space-y-0.5">
          <h2 className="px-3 pb-1 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Minhas listas
          </h2>
          {owned.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">Nenhuma lista ainda.</p>}
          {owned.map((list) => (
            <ListButton key={list.id} list={list} active={list.id === currentId} onSelect={select} />
          ))}
        </section>

        {shared.length > 0 && (
          <section className="space-y-0.5">
            <h2 className="px-3 pb-1 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Convidado
            </h2>
            {shared.map((list) => (
              <ListButton key={list.id} list={list} active={list.id === currentId} onSelect={select} />
            ))}
          </section>
        )}
      </nav>

      <div className="space-y-1 border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          disabled={listFull}
          onClick={() => {
            onCreateList();
            onNavigate?.();
          }}
        >
          <Plus /> Nova lista
        </Button>
        {listFull && (
          <p className="px-3 pb-1 text-xs text-muted-foreground">
            Limite de {limits.maxLists} listas atingido. Exclua uma para criar outra.
          </p>
        )}
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={() => {
              onDeleteLists();
              onNavigate?.();
            }}
          >
            <Trash2 /> Excluir listas
          </Button>
        )}

        {authEnabled && (
          <div className="border-t pt-3">
            {user ? (
              <Account
                user={user}
                onLogout={onLogout}
                onDeleteAccount={() => {
                  onDeleteAccount();
                  onNavigate?.();
                }}
              />
            ) : (
              <div className="space-y-2 px-1">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/login" onClick={onNavigate}>Entrar</Link>
                </Button>
                <p className="text-xs text-muted-foreground">Entre para salvar na nuvem e compartilhar suas listas.</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between px-1 pt-2">
          <span className="text-xs text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        <p className="px-1 pt-2 text-[11px] text-muted-foreground">
          <Link to="/termos" className="underline-offset-4 hover:underline">Termos</Link>
          {' · '}
          <Link to="/privacidade" className="underline-offset-4 hover:underline">Privacidade</Link>
        </p>
      </div>
    </div>
  );
}
