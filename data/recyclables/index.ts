/**
 * Main export file for recyclables data
 */

// Export categories
export { MATERIAL_CATEGORIES, getCategoryById, getCategoryName } from './categories';

// Export items
export { ALL_ITEMS, getAllItems, getItemById, getItemsByCategory } from './items';

// Export rules
export { ALL_RULES, getAllRules, getRulesForItem, getRulesByScope } from './rules';

// Export types (re-export from main types file)
export type {
  RecyclableItem,
  RecyclingRule,
  RecyclingSearchResult,
  ItemCategory,
  MaterialCategory,
  DisposalMethod,
  RuleScope,
} from '../types';
