import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircleAlert, CircleCheck, Loader2 } from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState({ status: token ? 'loading' : 'error', message: 'Link inválido.' });
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    api('/v1/auth/verify-email', { method: 'POST', body: { token }, token: null })
      .then(() => setState({ status: 'ok' }))
      .catch((error) => setState({ status: 'error', message: error.message }));
  }, [token]);

  return (
    <AuthShell title="Confirmação de e-mail">
      <div className="flex flex-col items-center gap-3 text-center">
        {state.status === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Confirmando seu e-mail...</p>
          </>
        )}
        {state.status === 'ok' && (
          <>
            <CircleCheck className="h-10 w-10 text-success" />
            <p className="text-sm">E-mail confirmado! Agora é só entrar.</p>
            <Button asChild className="w-full">
              <Link to="/login">Entrar</Link>
            </Button>
          </>
        )}
        {state.status === 'error' && (
          <>
            <CircleAlert className="h-10 w-10 text-destructive" />
            <p className="text-sm">{state.message}</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Voltar para o login</Link>
            </Button>
          </>
        )}
      </div>
    </AuthShell>
  );
}
