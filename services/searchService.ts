import Fuse, { IFuseOptions } from 'fuse.js';
import {
  RecyclableItem,
  RecyclingSearchResult,
  MaterialCategory,
} from '@/data/types';
import { getAllItems, getItemsByCategory } from '@/data/recyclables';
import { SavedLocation } from './storageService';
import { itemToSearchResult } from './recyclabilityService';

// Fuse.js search instance (initialized lazily)
let fuseInstance: Fuse<RecyclableItem> | null = null;

/**
 * Fuse.js configuration for fuzzy search
 */
const FUSE_OPTIONS: IFuseOptions<RecyclableItem> = {
  keys: [
    { name: 'name', weight: 2.0 },              // Highest weight for exact name matches
    { name: 'aliases', weight: 1.5 },           // High weight for aliases
    { name: 'searchTerms', weight: 1.2 },       // Search terms
    { name: 'commonMisspellings', weight: 1.0 }, // Common misspellings
    { name: 'subcategory', weight: 0.5 },       // Lower weight for subcategory
  ],
  threshold: 0.4,        // 0 = exact match, 1 = match anything (0.4 is balanced)
  includeScore: true,    // Include relevance score
  minMatchCharLength: 2, // Minimum characters to start matching
  ignoreLocation: true,  // Search entire string, not just beginning
  useExtendedSearch: false,
  shouldSort: true,      // Sort by relevance
};

/**
 * Initialize or get the Fuse.js search index
 */
function getFuseInstance(): Fuse<RecyclableItem> {
  if (!fuseInstance) {
    const items = getAllItems();
    fuseInstance = new Fuse(items, FUSE_OPTIONS);
  }
  return fuseInstance;
}

/**
 * Reset the search index (useful if items are updated)
 */
export const resetSearchIndex = (): void => {
  fuseInstance = null;
};

/**
 * Search for recyclable items with fuzzy matching
 *
 * @param query - The search query
 * @param location - Optional user location for location-aware results
 * @param limit - Maximum number of results to return (default: 20)
 * @returns Array of search results sorted by relevance
 */
export const searchItems = (
  query: string,
  location: SavedLocation | null = null,
  limit: number = 20
): RecyclingSearchResult[] => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const fuse = getFuseInstance();
  const fuseResults = fuse.search(query.trim(), { limit });

  // Convert Fuse results to RecyclingSearchResult with location-aware disposal info
  return fuseResults.map(result => {
    const matchScore = result.score !== undefined ? 1 - result.score : 1.0;

    return itemToSearchResult(
      result.item,
      location,
      matchScore,
      query
    );
  });
};

/**
 * Get items by category with location-aware disposal info
 *
 * @param category - The material category to filter by
 * @param location - Optional user location for location-aware results
 * @returns Array of search results for the category
 */
export const getItemsByCategoryWithDisposal = (
  category: MaterialCategory,
  location: SavedLocation | null = null
): RecyclingSearchResult[] => {
  const items = getItemsByCategory(category);

  return items
    .map(item => itemToSearchResult(item, location, 1.0))
    .sort((a, b) => a.item.name.localeCompare(b.item.name));
};

/**
 * Get popular/featured items for the home screen
 *
 * @param location - Optional user location for location-aware results
 * @param limit - Maximum number of items to return (default: 10)
 * @returns Array of popular items
 */
export const getPopularItems = (
  location: SavedLocation | null = null,
  limit: number = 10
): RecyclingSearchResult[] => {
  const allItems = getAllItems();

  // Define popular item IDs (most commonly searched)
  const popularItemIds = [
    'item-plastic-bottle',
    'item-cardboard-box',
    'item-aluminum-can',
    'item-glass-jar',
    'item-newspaper',
    'item-plastic-bag',
    'item-pizza-box',
    'item-milk-carton',
    'item-batteries',
    'item-electronics',
  ];

  const popularItems = popularItemIds
    .map(id => allItems.find(item => item.id === id))
    .filter((item): item is RecyclableItem => item !== undefined)
    .slice(0, limit);

  return popularItems.map(item => itemToSearchResult(item, location, 1.0));
};

/**
 * Get recently added items
 *
 * @param location - Optional user location for location-aware results
 * @param limit - Maximum number of items to return (default: 5)
 * @returns Array of recently added items
 */
export const getRecentItems = (
  location: SavedLocation | null = null,
  limit: number = 5
): RecyclingSearchResult[] => {
  const allItems = getAllItems();

  // For now, just return the last N items
  // In the future, we could add a 'dateAdded' field to items
  const recentItems = allItems.slice(-limit);

  return recentItems.map(item => itemToSearchResult(item, location, 1.0));
};

/**
 * Get search suggestions based on partial input
 *
 * @param partialQuery - The partial search query
 * @param limit - Maximum number of suggestions (default: 5)
 * @returns Array of suggested item names
 */
export const getSearchSuggestions = (
  partialQuery: string,
  limit: number = 5
): string[] => {
  if (!partialQuery || partialQuery.trim().length < 2) {
    return [];
  }

  const query = partialQuery.trim().toLowerCase();
  const allItems = getAllItems();

  const suggestions = new Set<string>();

  // Add items where name starts with the query
  allItems.forEach(item => {
    if (item.name.toLowerCase().startsWith(query)) {
      suggestions.add(item.name);
    }
  });

  // Add items where any alias starts with the query
  allItems.forEach(item => {
    item.aliases.forEach(alias => {
      if (alias.toLowerCase().startsWith(query)) {
        suggestions.add(item.name);
      }
    });
  });

  return Array.from(suggestions).slice(0, limit);
};

/**
 * Get item by exact ID
 *
 * @param itemId - The item ID
 * @param location - Optional user location for location-aware disposal info
 * @returns Search result or null if not found
 */
export const getItemByIdWithDisposal = (
  itemId: string,
  location: SavedLocation | null = null
): RecyclingSearchResult | null => {
  const allItems = getAllItems();
  const item = allItems.find(i => i.id === itemId);

  if (!item) {
    return null;
  }

  return itemToSearchResult(item, location, 1.0);
};

/**
 * Search across multiple categories
 *
 * @param query - The search query
 * @param categories - Array of categories to search within
 * @param location - Optional user location
 * @param limit - Maximum results per category
 * @returns Categorized search results
 */
export const searchByCategories = (
  query: string,
  categories: MaterialCategory[],
  location: SavedLocation | null = null,
  limit: number = 5
): Record<MaterialCategory, RecyclingSearchResult[]> => {
  const results: Record<string, RecyclingSearchResult[]> = {};

  categories.forEach(category => {
    const categoryItems = getItemsByCategory(category);
    const fuse = new Fuse(categoryItems, FUSE_OPTIONS);
    const fuseResults = fuse.search(query.trim(), { limit });

    results[category] = fuseResults.map(result => {
      const matchScore = result.score !== undefined ? 1 - result.score : 1.0;
      return itemToSearchResult(result.item, location, matchScore, query);
    });
  });

  return results as Record<MaterialCategory, RecyclingSearchResult[]>;
};
