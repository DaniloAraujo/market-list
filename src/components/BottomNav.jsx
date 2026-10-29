import { NavLink } from 'react-router-dom';
import { ChartPie, ListChecks, UserRound } from 'lucide-react';
import { useAuth } from '@/auth/auth-context';
import Avatar from '@/components/Avatar';
import { cn } from '@/lib/utils';

function Item({ to, label, end, badge, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden="true"
            className={cn('absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary transition-opacity', isActive ? 'opacity-100' : 'opacity-0')}
          />
          <span className="relative grid h-6 place-content-center">
            {children}
            {badge > 0 && (
              <span className="absolute -right-3 -top-1 grid min-w-4 place-content-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </span>
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav({ pending = 0 }) {
  const { user } = useAuth();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-14 max-w-2xl items-stretch gap-1 px-2">
        <Item to="/" end label="Listas" badge={pending}>
          <ListChecks className="h-5 w-5" />
        </Item>
        <Item to="/graficos" label="Gráficos">
          <ChartPie className="h-5 w-5" />
        </Item>
        <Item to="/perfil" label="Perfil">
          {user ? <Avatar user={user} className="h-6 w-6 text-xs" /> : <UserRound className="h-5 w-5" />}
        </Item>
      </div>
    </nav>
  );
}
