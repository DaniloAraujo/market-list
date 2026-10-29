import { createContext, useContext } from 'react';

/**
 * Categorias próprias da lista aberta. As padrão vêm de utils/categoryUtils.
 * `create({ name, emoji })` devolve a categoria criada (ou lança um Error com a mensagem para exibir).
 */
export const CategoriesContext = createContext({
  custom: [],
  create: async () => {
    throw new Error('Categorias próprias indisponíveis.');
  },
  remove: async () => {},
  maxCustom: 20,
});

export const useCategories = () => useContext(CategoriesContext);
