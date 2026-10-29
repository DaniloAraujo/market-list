import {
  Apple,
  Beef,
  Croissant,
  Utensils,
  CupSoda,
  SprayCan,
  Bath,
  Sparkles,
  PawPrint,
  Pill,
  Dumbbell,
  CalendarCheck,
  Package,
} from 'lucide-react';

export const CATEGORIES = ['acougue', 'alimentos', 'bebidas', 'beleza', 'farmacia', 'fitness', 'higiene', 'hortifruti', 'itens-da-semana', 'limpeza', 'outros', 'padaria', 'pet'];

const CATEGORY_META = {
  hortifruti: { label: 'Hortifruti', Icon: Apple, chip: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300' },
  acougue: { label: 'Açougue', Icon: Beef, chip: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300' },
  padaria: { label: 'Padaria', Icon: Croissant, chip: 'bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300' },
  alimentos: { label: 'Alimentos', Icon: Utensils, chip: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300' },
  bebidas: { label: 'Bebidas', Icon: CupSoda, chip: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300' },
  limpeza: { label: 'Limpeza', Icon: SprayCan, chip: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300' },
  higiene: { label: 'Higiene', Icon: Bath, chip: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-500/15 dark:text-cyan-300' },
  beleza: { label: 'Beleza', Icon: Sparkles, chip: 'bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300' },
  pet: { label: 'Pet', Icon: PawPrint, chip: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-500/15 dark:text-yellow-300' },
  farmacia: { label: 'Farmácia', Icon: Pill, chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  fitness: { label: 'Fitness', Icon: Dumbbell, chip: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300' },
  'itens-da-semana': { label: 'Itens da Semana', Icon: CalendarCheck, chip: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300' },
  outros: { label: 'Outros', Icon: Package, chip: 'bg-stone-200 text-stone-800 dark:bg-stone-500/20 dark:text-stone-300' },
};

export const getCategoryMeta = (cat) => CATEGORY_META[cat] || CATEGORY_META.outros;
export const getCategoryLabel = (cat) => getCategoryMeta(cat).label;
export const getCategoryColor = (cat) => getCategoryMeta(cat).chip;
export const getCategoryIcon = (cat) => getCategoryMeta(cat).Icon;
