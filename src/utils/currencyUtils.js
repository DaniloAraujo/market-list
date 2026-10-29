const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Valor em reais -> "R$ 1.234,56" */
export const formatBRL = (value) => brl.format(value || 0);

/** String de dígitos (centavos) -> "1.234,56" para exibir em máscaras de input */
export const formatCurrency = (digits) => {
  if (!digits) return '';
  const cents = parseInt(String(digits).replace(/\D/g, ''), 10);
  if (Number.isNaN(cents)) return '';
  return decimal.format(cents / 100);
};

/** Valor em reais -> string de dígitos em centavos ("12.5" -> "1250") */
export const reaisToCents = (value) => (value > 0 ? String(Math.round(value * 100)) : '');

/** String de dígitos em centavos -> valor em reais */
export const centsToReais = (digits) => (digits ? parseInt(digits, 10) / 100 : 0);
