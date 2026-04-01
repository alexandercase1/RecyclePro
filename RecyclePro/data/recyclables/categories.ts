import { ItemCategory } from '../types';

/**
 * Material categories for browsing recyclable items
 */
export const MATERIAL_CATEGORIES: ItemCategory[] = [
  {
    id: 'paper_cardboard',
    name: 'Paper & Cardboard',
    icon: '📄',
    description: 'Newspapers, magazines, cardboard boxes, mail',
  },
  {
    id: 'plastic',
    name: 'Plastic',
    icon: '🧴',
    description: 'Bottles, containers, bags, packaging',
  },
  {
    id: 'glass',
    name: 'Glass',
    icon: '🍾',
    description: 'Bottles, jars, containers',
  },
  {
    id: 'metal',
    name: 'Metal',
    icon: '🥫',
    description: 'Aluminum cans, steel cans, foil, scrap metal',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '💻',
    description: 'Phones, computers, batteries, cables',
  },
  {
    id: 'hazardous',
    name: 'Hazardous',
    icon: '⚠️',
    description: 'Paint, chemicals, motor oil, cleaners',
  },
];

/**
 * Get category by ID
 */
export const getCategoryById = (id: string): ItemCategory | undefined => {
  return MATERIAL_CATEGORIES.find(cat => cat.id === id);
};

/**
 * Get category name by ID
 */
export const getCategoryName = (id: string): string => {
  return getCategoryById(id)?.name || 'Unknown';
};
