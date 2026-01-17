import { Menu, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function Header({ 
  isMobile, 
  currentList, 
  productsCount, 
  mobileMenuOpen, 
  onMobileMenuChange, 
  children 
}) {
  if (isMobile) {
    return (
      <header className="lg:hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="px-4 py-4 flex items-center justify-between">
          <Sheet open={mobileMenuOpen} onOpenChange={onMobileMenuChange}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 flex flex-col">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Tá na Lista
                </SheetTitle>
                <SheetDescription>Gerencie suas listas</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold">{currentList?.name || 'Tá na Lista'}</h1>
            {productsCount > 0 && <p className="text-xs text-blue-100">{productsCount} itens</p>}
          </div>
          <div className="w-10" />
        </div>
      </header>
    );
  }

  return (
    <header className="hidden lg:block bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-bold">{currentList?.name || 'Tá na Lista'}</h1>
        {productsCount > 0 && <p className="text-sm text-blue-100 mt-1">{productsCount} itens</p>}
      </div>
    </header>
  );
}
