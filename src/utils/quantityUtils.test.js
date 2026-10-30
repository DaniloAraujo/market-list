import { describe, expect, it } from 'vitest';
import {
  formatKg,
  formatQuantity,
  kgToQuarters,
  lineTotal,
  priceLabel,
  quantityAfterUnitChange,
  quartersToKgText,
  showQuantity,
  unitOf,
} from './quantityUtils';

describe('quilo em porções de 250 g', () => {
  it('alterna entre 250 g, 500 g, 750 g, 1 kg, 1,25 kg e 1,5 kg', () => {
    expect([1, 2, 3, 4, 5, 6].map(formatKg)).toEqual(['250 g', '500 g', '750 g', '1 kg', '1,25 kg', '1,5 kg']);
  });

  it('formata quilos maiores sem casas sobrando', () => {
    expect(formatKg(8)).toBe('2 kg');
    expect(formatKg(10)).toBe('2,5 kg');
  });

  it('converte o que a pessoa digita para a porção mais próxima', () => {
    expect(kgToQuarters(1.5)).toBe(6);
    expect(kgToQuarters(0.3)).toBe(1);
    expect(kgToQuarters(0.1)).toBe(1);
    expect(kgToQuarters(300)).toBe(999);
    expect(quartersToKgText(6)).toBe('1,5');
    expect(quartersToKgText(1)).toBe('0,25');
  });
});

describe('unidade do item', () => {
  it('assume unidade quando o item não tem unidade (listas antigas)', () => {
    expect(unitOf({ quantity: 2 })).toBe('un');
    expect(unitOf({ quantity: 2, unit: 'litro' })).toBe('un');
    expect(unitOf({ quantity: 2, unit: 'kg' })).toBe('kg');
  });

  it('calcula o total pela unidade: kg usa porções de 250 g, os demais multiplicam', () => {
    expect(lineTotal({ unitPrice: 40, quantity: 2, unit: 'kg' })).toBe(20);
    expect(lineTotal({ unitPrice: 40, quantity: 6, unit: 'kg' })).toBe(60);
    expect(lineTotal({ unitPrice: 5, quantity: 3, unit: 'pct' })).toBe(15);
    expect(lineTotal({ unitPrice: 5, quantity: 3 })).toBe(15);
  });

  it('mostra a quantidade só quando agrega informação', () => {
    expect(showQuantity({ quantity: 1, unit: 'un' })).toBe(false);
    expect(showQuantity({ quantity: 2, unit: 'un' })).toBe(true);
    expect(showQuantity({ quantity: 1, unit: 'pct' })).toBe(true);
    expect(showQuantity({ quantity: 2, unit: 'kg' })).toBe(true);
    expect(formatQuantity({ quantity: 3, unit: 'pct' })).toBe('3 pct.');
    expect(formatQuantity({ quantity: 2, unit: 'un' })).toBe('2 un.');
    expect(formatQuantity({ quantity: 2, unit: 'kg' })).toBe('500 g');
  });

  it('ajusta a quantidade ao trocar de unidade e o texto do valor', () => {
    expect(quantityAfterUnitChange('un', 'kg', 7)).toBe(4);
    expect(quantityAfterUnitChange('kg', 'un', 6)).toBe(1);
    expect(quantityAfterUnitChange('un', 'pct', 3)).toBe(3);
    expect(quantityAfterUnitChange('kg', 'kg', 6)).toBe(6);
    expect(priceLabel('kg')).toBe('Valor por kg');
    expect(priceLabel('pct')).toBe('Valor por pacote');
    expect(priceLabel('un')).toBe('Valor unitário');
  });
});
