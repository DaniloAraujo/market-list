const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatBRL = (value) => brl.format(value || 0);

export const formatCurrency = (digits) => {
  if (!digits) return '';
  const cents = parseInt(String(digits).replace(/\D/g, ''), 10);
  if (Number.isNaN(cents)) return '';
  return decimal.format(cents / 100);
};

export const reaisToCents = (value) => (value > 0 ? String(Math.round(value * 100)) : '');

export const centsToReais = (digits) => (digits ? parseInt(digits, 10) / 100 : 0);
