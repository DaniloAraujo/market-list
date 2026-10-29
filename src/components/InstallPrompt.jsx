import { useCallback, useEffect, useState } from 'react';
import { MoreVertical, PlusSquare, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Logo from '@/components/Logo';

const SEEN_KEY = 'pwa:install-prompted';
const SHOW_DELAY_MS = 3500;

const wasPrompted = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

const markPrompted = () => {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    return;
  }
};

const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isIos = () => {
  const ua = window.navigator.userAgent;
  const iPadOs = ua.includes('Macintosh') && window.navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(ua) || iPadOs;
};

const previewMode = () => new URLSearchParams(window.location.search).get('install');

function Step({ number, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-6 w-6 shrink-0 place-content-center rounded-full bg-primary-soft text-xs font-semibold text-accent-foreground">
        {number}
      </span>
      <span className="pt-0.5 text-sm">{children}</span>
    </li>
  );
}

function IosSteps() {
  return (
    <ol className="space-y-3">
      <Step number={1}>
        Toque em <Share className="mx-0.5 inline h-4 w-4 align-text-bottom" aria-label="Compartilhar" /> <strong>Compartilhar</strong>, na
        barra do Safari.
      </Step>
      <Step number={2}>
        Role e escolha <PlusSquare className="mx-0.5 inline h-4 w-4 align-text-bottom" aria-hidden="true" />{' '}
        <strong>Adicionar à Tela de Início</strong>.
      </Step>
      <Step number={3}>
        Toque em <strong>Adicionar</strong>. O Tá na Lista aparece como um app na sua tela.
      </Step>
    </ol>
  );
}

function AndroidFallbackSteps() {
  return (
    <ol className="space-y-3">
      <Step number={1}>
        Toque em <MoreVertical className="mx-0.5 inline h-4 w-4 align-text-bottom" aria-label="Menu" /> no canto do navegador.
      </Step>
      <Step number={2}>
        Escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.
      </Step>
    </ol>
  );
}

export default function InstallPrompt() {
  const [mode, setMode] = useState(null);
  const [installEvent, setInstallEvent] = useState(null);

  useEffect(() => {
    const preview = previewMode();
    if (!preview && (isInstalled() || wasPrompted())) return undefined;

    let timer;
    const open = (next) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMode(next), SHOW_DELAY_MS);
    };

    if (preview === 'ios' || preview === 'android') {
      open(preview);
      return () => window.clearTimeout(timer);
    }

    if (isIos()) {
      open('ios');
      return () => window.clearTimeout(timer);
    }

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      open('android');
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.clearTimeout(timer);
    };
  }, []);

  const close = useCallback(() => {
    markPrompted();
    setMode(null);
    setInstallEvent(null);
  }, []);

  const install = async () => {
    if (!installEvent) return close();
    installEvent.prompt();
    try {
      await installEvent.userChoice;
    } finally {
      close();
    }
  };

  if (!mode) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center sm:text-center">
          <Logo className="mb-1 h-14 w-14" />
          <DialogTitle>Instale o Tá na Lista</DialogTitle>
          <DialogDescription>
            {mode === 'ios'
              ? 'Tenha suas listas a um toque, em tela cheia e sem abrir o navegador.'
              : 'Abra suas listas direto da tela inicial, em tela cheia e sem abrir o navegador.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'ios' ? <IosSteps /> : installEvent ? null : <AndroidFallbackSteps />}

        <div className="flex flex-col gap-2 pt-1">
          {mode === 'android' && installEvent && <Button onClick={install}>Instalar app</Button>}
          <Button variant="ghost" onClick={close}>
            {mode === 'android' && installEvent ? 'Agora não' : 'Entendi'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
