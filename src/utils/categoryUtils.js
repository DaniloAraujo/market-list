import { ShoppingCart, Apple, Coffee, Droplet, Sparkles, Star, Heart, Plus } from 'lucide-react';

export const CATEGORIES = ['acougue', 'alimentos', 'bebidas', 'beleza', 'farmacia', 'fitness', 'higiene', 'hortifruti', 'itens-da-semana', 'limpeza', 'outros', 'padaria', 'pet'];

export const getCategoryColor = (cat) => {
  const colors = {
    hortifruti: 'bg-green-100 text-green-700',
    acougue: 'bg-red-100 text-red-700',
    padaria: 'bg-amber-100 text-amber-700',
    alimentos: 'bg-orange-100 text-orange-700',
    bebidas: 'bg-purple-100 text-purple-700',
    limpeza: 'bg-blue-100 text-blue-700',
    higiene: 'bg-cyan-100 text-cyan-700',
    beleza: 'bg-pink-100 text-pink-700',
    pet: 'bg-yellow-100 text-yellow-700',
    farmacia: 'bg-emerald-100 text-emerald-700',
    fitness: 'bg-indigo-100 text-indigo-700',
    'itens-da-semana': 'bg-violet-100 text-violet-700',
    outros: 'bg-gray-100 text-gray-700'
  };
  return colors[cat] || colors.outros;
};

export const getCategoryIcon = (cat) => {
  const icons = {
    hortifruti: { Icon: Apple, color: 'text-green-600' },
    acougue: { Icon: ShoppingCart, color: 'text-red-600' },
    padaria: { Icon: Coffee, color: 'text-amber-600' },
    alimentos: { Icon: ShoppingCart, color: 'text-orange-600' },
    bebidas: { Icon: Coffee, color: 'text-purple-600' },
    limpeza: { Icon: Droplet, color: 'text-blue-600' },
    higiene: { Icon: Sparkles, color: 'text-cyan-600' },
    beleza: { Icon: Star, color: 'text-pink-600' },
    pet: { Icon: Heart, color: 'text-yellow-600' },
    farmacia: { Icon: Plus, color: 'text-emerald-600' },
    fitness: { Icon: Star, color: 'text-indigo-600' },
    'itens-da-semana': { Icon: ShoppingCart, color: 'text-violet-600' },
    outros: { Icon: ShoppingCart, color: 'text-gray-600' }
  };
  return icons[cat] || icons.outros;
};

export const getCategoryLabel = (cat) => {
  const labels = {
    hortifruti: 'Hortifruti',
    acougue: 'Açougue',
    padaria: 'Padaria',
    alimentos: 'Alimentos',
    bebidas: 'Bebidas',
    limpeza: 'Limpeza',
    higiene: 'Higiene',
    beleza: 'Beleza',
    pet: 'Pet',
    farmacia: 'Farmácia',
    fitness: 'Fitness',
    'itens-da-semana': 'Itens da Semana',
    outros: 'Outros'
  };
  return labels[cat] || labels.outros;
};
