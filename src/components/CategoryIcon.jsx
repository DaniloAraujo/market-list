import { createElement } from 'react';
import { getCategoryIcon } from '@/utils/categoryUtils';

export default function CategoryIcon({ category, ...props }) {
  return createElement(getCategoryIcon(category), props);
}
