import { ShoppingCart, Plus, Trash, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import logoImage from '@/assets/logo_ta-na-lista.png';

export default function Sidebar({ lists, currentListId, onSelectList, onCreateList, onDeleteLists, onCloseMobile }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <List className="w-5 h-5 text-primary" />
            Minhas Listas
          </h3>
          <div className="space-y-2">
            {lists.map(list => (
              <Button 
                key={list.id} 
                variant={list.id === currentListId ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => { 
                  onSelectList(list.id); 
                  onCloseMobile(); 
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {list.name}
                <Badge 
                  variant={list.id === currentListId ? "secondary" : "outline"} 
                  className={list.id === currentListId ? "ml-auto bg-white text-primary" : "ml-auto"}
                >
                  {list.products.length}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Button onClick={onCreateList} className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nova Lista
          </Button>
          {lists.length > 1 && (
            <Button 
              onClick={() => { 
                onDeleteLists(); 
                onCloseMobile(); 
              }} 
              className="w-full" 
              variant="outline"
            >
              <Trash className="w-4 h-4 mr-2 text-red-600" />
              Excluir Listas
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <img src={logoImage} alt="Tá na Lista" className="w-32 h-32 object-contain" />
      </div>
    </div>
  );
}
