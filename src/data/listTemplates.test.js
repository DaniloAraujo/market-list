import { describe, expect, it } from 'vitest';
import { BUILTIN_CATEGORIES, resolveCategory } from '@/utils/categoryUtils';
import { LIST_TEMPLATES, templateCategories, templateToItems } from './listTemplates';

const BUILTIN = new Set(BUILTIN_CATEGORIES.map((category) => category.key));

describe('modelos de lista', () => {
  it('têm ids e nomes únicos', () => {
    expect(new Set(LIST_TEMPLATES.map((t) => t.id)).size).toBe(LIST_TEMPLATES.length);
    expect(new Set(LIST_TEMPLATES.map((t) => t.name)).size).toBe(LIST_TEMPLATES.length);
  });

  it.each(LIST_TEMPLATES.map((t) => [t.name, t]))('%s respeita os limites da API', (_name, template) => {
    expect(template.name.length).toBeLessThanOrEqual(80);
    expect(template.items.length).toBeGreaterThan(0);
    expect(template.items.length).toBeLessThanOrEqual(150);
    expect(templateCategories(template).length).toBeLessThanOrEqual(20);

    const own = new Set(templateCategories(template).map((c) => c.key));
    for (const category of templateCategories(template)) {
      expect(category.name.length).toBeLessThanOrEqual(24);
      expect(BUILTIN.has(category.key)).toBe(false);
    }

    const names = new Set();
    for (const item of templateToItems(template)) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.name.length).toBeLessThanOrEqual(80);
      expect(item.note.length).toBeLessThanOrEqual(255);
      expect(item.quantity).toBeGreaterThanOrEqual(1);
      expect(item.quantity).toBeLessThanOrEqual(999);
      expect(['un', 'kg']).toContain(item.unit);
      expect(BUILTIN.has(item.category) || own.has(item.category)).toBe(true);
      expect(names.has(item.name)).toBe(false);
      names.add(item.name);
    }
  });

  it('usam todas as categorias próprias que declaram', () => {
    for (const template of LIST_TEMPLATES) {
      const used = new Set(template.items.map((item) => item.category));
      for (const category of templateCategories(template)) expect(used.has(category.key)).toBe(true);
    }
  });
});

describe('categorias', () => {
  it('resolve uma categoria própria e cai em "Outros" quando ela não existe mais', () => {
    const custom = [{ id: 'c_1', name: 'Festa', emoji: '🎉' }];
    expect(resolveCategory('c_1', custom)).toMatchObject({ label: 'Festa', emoji: '🎉', isDefault: false });
    expect(resolveCategory('c_apagada', custom)).toMatchObject({ label: 'Outros', isDefault: true });
  });
});
