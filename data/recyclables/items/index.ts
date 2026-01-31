import { RecyclableItem } from '@/data/types';

// Import item files as we create them
// import { paperItems } from './paper';
// import { plasticItems } from './plastics';
// import { glassItems } from './glass';
// import { metalItems } from './metals';
// import { electronicsItems } from './electronics';
// import { hazardousItems } from './hazardous';
import { commonItems } from './common-items';

/**
 * All recyclable items in the database
 */
export const ALL_ITEMS: RecyclableItem[] = [
  ...commonItems,
  // ...paperItems,
  // ...plasticItems,
  // ...glassItems,
  // ...metalItems,
  // ...electronicsItems,
  // ...hazardousItems,
];

/**
 * Get all items
 */
export const getAllItems = (): RecyclableItem[] => {
  return ALL_ITEMS;
};

/**
 * Get item by ID
 */
export const getItemById = (id: string): RecyclableItem | undefined => {
  return ALL_ITEMS.find(item => item.id === id);
};

/**
 * Get items by category
 */
export const getItemsByCategory = (category: string): RecyclableItem[] => {
  return ALL_ITEMS.filter(item => item.category === category);
};
