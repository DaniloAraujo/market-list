import { createContext, useContext } from 'react';

export const CategoriesContext = createContext({
  custom: [],
  create: async () => {
    throw new Error('Categorias próprias indisponíveis.');
  },
  remove: async () => {},
  maxCustom: 20,
});

export const useCategories = () => useContext(CategoriesContext);
