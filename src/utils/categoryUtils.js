export const DEFAULT_CATEGORY = 'outros';

const TONES = {
  green: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
  amber: 'bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  cyan: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-500/15 dark:text-cyan-300',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300',
  yellow: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-500/15 dark:text-yellow-300',
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
  violet: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300',
  sky: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  lime: 'bg-lime-100 text-lime-900 dark:bg-lime-500/15 dark:text-lime-300',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/15 dark:text-fuchsia-300',
  stone: 'bg-stone-200 text-stone-800 dark:bg-stone-500/20 dark:text-stone-300',
};

export const BUILTIN_CATEGORIES = [
  { key: 'acougue', label: 'Açougue', emoji: '🥩', tone: 'red' },
  { key: 'alimentos', label: 'Alimentos', emoji: '🍝', tone: 'orange' },
  { key: 'bebidas', label: 'Bebidas', emoji: '🥤', tone: 'purple' },
  { key: 'beleza', label: 'Beleza', emoji: '💄', tone: 'pink' },
  { key: 'farmacia', label: 'Farmácia', emoji: '💊', tone: 'emerald' },
  { key: 'fitness', label: 'Fitness', emoji: '🏋️', tone: 'indigo' },
  { key: 'higiene', label: 'Higiene', emoji: '🧼', tone: 'cyan' },
  { key: 'hortifruti', label: 'Hortifruti', emoji: '🥕', tone: 'green' },
  { key: 'itens-da-semana', label: 'Itens da Semana', emoji: '📅', tone: 'violet' },
  { key: 'limpeza', label: 'Limpeza', emoji: '🧽', tone: 'blue' },
  { key: 'padaria', label: 'Padaria', emoji: '🥖', tone: 'amber' },
  { key: 'pet', label: 'Pet', emoji: '🐾', tone: 'yellow' },
  { key: DEFAULT_CATEGORY, label: 'Outros', emoji: '📦', tone: 'stone' },
];

const BUILTIN_BY_KEY = new Map(BUILTIN_CATEGORIES.map((c) => [c.key, c]));

export const CATEGORIES = BUILTIN_CATEGORIES.map((c) => c.key);

const CUSTOM_TONES = ['rose', 'teal', 'sky', 'lime', 'fuchsia', 'orange', 'indigo', 'emerald'];

const toneForCustom = (id) => {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return CUSTOM_TONES[hash % CUSTOM_TONES.length];
};

export function resolveCategory(key, custom = []) {
  const own = custom.find((c) => c.id === key);
  if (own) {
    return { key: own.id, label: own.name, emoji: own.emoji, tone: toneForCustom(own.id), isDefault: false, custom: true };
  }
  const builtin = BUILTIN_BY_KEY.get(key) ?? BUILTIN_BY_KEY.get(DEFAULT_CATEGORY);
  return { ...builtin, isDefault: builtin.key === DEFAULT_CATEGORY, custom: false };
}

export const categoryToneClasses = (category) => (category.isDefault ? '' : TONES[category.tone]);

export const getCategoryLabel = (key, custom = []) => resolveCategory(key, custom).label;
