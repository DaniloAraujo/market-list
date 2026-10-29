import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SettingsGroup({ title, children }) {
  return (
    <section className="space-y-2">
      {title && <h2 className="px-1 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h2>}
      <div className="divide-y overflow-hidden rounded-xl border bg-card">{children}</div>
    </section>
  );
}

export function SettingsRow({ icon: Icon, label, value, to, onClick, destructive = false, accent = false, chevron = true, children }) {
  const interactive = Boolean(to || onClick);
  const Component = to ? Link : onClick ? 'button' : 'div';

  return (
    <Component
      {...(to ? { to } : {})}
      {...(onClick ? { onClick, type: 'button' } : {})}
      className={cn(
        'flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
        interactive && 'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50',
        destructive && 'text-destructive',
        accent && 'font-medium text-primary'
      )}
    >
      {Icon && <Icon className={cn('h-[18px] w-[18px] shrink-0', destructive || accent ? '' : 'text-muted-foreground')} aria-hidden="true" />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {value && <span className="max-w-[55%] truncate text-muted-foreground">{value}</span>}
      {children}
      {interactive && chevron && !children && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
    </Component>
  );
}
