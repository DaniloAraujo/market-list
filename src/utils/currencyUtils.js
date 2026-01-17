export const formatCurrency = (value) => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  const amount = parseInt(numbers) / 100;
  return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const parsePriceInput = (value) => {
  const numbers = value.replace(/\D/g, '');
  return {
    raw: numbers,
    display: formatCurrency(numbers)
  };
};
