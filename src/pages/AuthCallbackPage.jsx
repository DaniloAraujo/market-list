import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/auth/auth-context';
import { pendingNext } from '@/auth/pending-next';
import AuthShell from '@/components/AuthShell';
import { Button } from '@/components/ui/button';

export default function AuthCallbackPage() {
  const { exchangeCode } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [exchangeError, setExchangeError] = useState('');
  const started = useRef(false);
  const code = params.get('code');
  const error = code ? exchangeError : 'Não foi possível concluir o login.';

  useEffect(() => {
    if (!code || started.current) return;
    started.current = true;

    const next = params.get('next');
    exchangeCode(code)
      .then(() => {
        pendingNext.clear();
        navigate(next && /^\/(?!\/)/.test(next) ? next : '/', { replace: true });
      })
      .catch((err) => setExchangeError(err.message));
  }, [code, params, exchangeCode, navigate]);

  return (
    <AuthShell title="Entrando...">
      {error ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Voltar para o login</Link>
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </AuthShell>
  );
}
