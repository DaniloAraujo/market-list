export const UNITS = [
  { value: 'un', label: 'Un', name: 'Unidade' },
  { value: 'pct', label: 'Pct', name: 'Pacote' },
  { value: 'kg', label: 'Kg', name: 'Quilo' },
];

export const KG_STEP = 0.25;
export const MAX_QUANTITY = 999;

const QUARTERS_PER_KG = 4;

export const unitOf = (product) => (UNITS.some((unit) => unit.value === product.unit) ? product.unit : 'un');

export const quantityFactor = (product) =>
  unitOf(product) === 'kg' ? product.quantity / QUARTERS_PER_KG : product.quantity;

export const lineTotal = (product) => product.unitPrice * quantityFactor(product);

const number = (value) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export const formatKg = (quarters) => {
  const kg = quarters / QUARTERS_PER_KG;
  return kg < 1 ? `${quarters * 250} g` : `${number(kg)} kg`;
};

export const formatQuantity = (product) => {
  const unit = unitOf(product);
  if (unit === 'kg') return formatKg(product.quantity);
  return `${product.quantity} ${unit === 'pct' ? 'pct.' : 'un.'}`;
};

export const showQuantity = (product) => unitOf(product) !== 'un' || product.quantity > 1;

export const priceLabel = (unit) => (unit === 'kg' ? 'Valor por kg' : unit === 'pct' ? 'Valor por pacote' : 'Valor unitário');

export const priceSuffix = (unit) => (unit === 'kg' ? '/kg' : '');

export const quantityAfterUnitChange = (from, to, quantity) => {
  if (from === to) return quantity;
  if (to === 'kg') return QUARTERS_PER_KG;
  if (from === 'kg') return 1;
  return quantity;
};

export const kgToQuarters = (kg) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(kg * QUARTERS_PER_KG)));

export const quartersToKgText = (quarters) => String(quarters / QUARTERS_PER_KG).replace('.', ',');
