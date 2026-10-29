import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Brand } from '@/components/Sidebar';

/** Barra superior exibida só no mobile; o menu lateral abre como gaveta. */
export default function Header({ open, onOpenChange, children }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-1 border-b bg-background px-2 py-1.5 lg:hidden">
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Abrir menu de listas">
            <Menu className="!size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
          <SheetHeader className="border-b p-4 text-left">
            <SheetTitle className="sr-only">Tá na Lista</SheetTitle>
            <SheetDescription className="sr-only">Gerencie suas listas</SheetDescription>
            <Brand />
          </SheetHeader>
          <div className="min-h-0 flex-1">{children}</div>
        </SheetContent>
      </Sheet>
      <Brand />
    </header>
  );
}
