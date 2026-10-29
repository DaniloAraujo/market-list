import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10">
      <Link to="/" className="mx-auto mb-8 flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <Logo className="h-9 w-9" />
        <span className="font-display text-lg font-semibold tracking-tight">Tá na Lista</span>
      </Link>

      <div className="rounded-xl border bg-card p-6">
        <h1 className="font-display text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>

      {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link to="/termos" className="underline-offset-4 hover:underline">Termos de Uso</Link>
        {' · '}
        <Link to="/privacidade" className="underline-offset-4 hover:underline">Política de Privacidade</Link>
      </p>
    </main>
  );
}
