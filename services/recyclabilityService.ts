import {
  RecyclableItem,
  RecyclingRule,
  DisposalMethod,
  RecyclingSearchResult,
} from '@/data/types';
import { SavedLocation } from './storageService';
import { getRulesForItem } from '@/data/recyclables';

/**
 * Rule priority order (most specific to least specific)
 */
const RULE_PRIORITY = ['zone', 'municipal', 'county', 'state', 'national'] as const;

/**
 * Get the most specific applicable rule for an item based on user location
 *
 * Rule priority: Zone > Municipal > County > State > National
 *
 * @param itemId - The ID of the recyclable item
 * @param location - The user's saved location
 * @returns The most applicable rule, or null if no rules exist
 */
export const getApplicableRule = (
  itemId: string,
  location: SavedLocation | null
): RecyclingRule | null => {
  const rules = getRulesForItem(itemId);

  if (rules.length === 0) {
    return null;
  }

  // If no location, return national rule if available
  if (!location) {
    return rules.find(rule => rule.scope === 'national') || null;
  }

  // Try each scope in priority order
  for (const scope of RULE_PRIORITY) {
    const matchedRule = findRuleByScope(rules, scope, location);
    if (matchedRule) {
      return matchedRule;
    }
  }

  return null;
};

/**
 * Find a rule matching a specific scope and location
 */
function findRuleByScope(
  rules: RecyclingRule[],
  scope: typeof RULE_PRIORITY[number],
  location: SavedLocation
): RecyclingRule | null {
  return rules.find(rule => {
    if (rule.scope !== scope) {
      return false;
    }

    switch (scope) {
      case 'zone':
        return location.zoneId && rule.zoneId === location.zoneId;

      case 'municipal':
        return rule.townId === location.townId;

      case 'county':
        return rule.countyName?.toLowerCase() === location.county.toLowerCase() &&
               rule.stateCode === location.stateCode;

      case 'state':
        return rule.stateCode === location.stateCode;

      case 'national':
        return true;

      default:
        return false;
    }
  }) || null;
}

/**
 * Get complete disposal information for an item based on user location
 *
 * @param item - The recyclable item
 * @param location - The user's saved location
 * @returns Disposal method, instructions, and applied rule
 */
export const getItemDisposalInfo = (
  item: RecyclableItem,
  location: SavedLocation | null
): {
  disposal: DisposalMethod;
  instructions: string | undefined;
  specialNotes: string | undefined;
  appliedRule: RecyclingRule | null;
} => {
  const rule = getApplicableRule(item.id, location);

  if (rule) {
    // Location-specific rule found
    return {
      disposal: rule.disposal,
      instructions: rule.instructions || item.defaultInstructions,
      specialNotes: rule.specialNotes,
      appliedRule: rule,
    };
  }

  // No rule found, use item defaults
  return {
    disposal: item.defaultDisposal,
    instructions: item.defaultInstructions,
    specialNotes: undefined,
    appliedRule: null,
  };
};

/**
 * Convert an item to a search result with location-aware disposal info
 *
 * @param item - The recyclable item
 * @param location - The user's saved location
 * @param matchScore - Search relevance score (0-1)
 * @param matchedTerm - The search term that matched
 * @returns A complete search result
 */
export const itemToSearchResult = (
  item: RecyclableItem,
  location: SavedLocation | null,
  matchScore: number = 1.0,
  matchedTerm?: string
): RecyclingSearchResult => {
  const disposalInfo = getItemDisposalInfo(item, location);

  return {
    item,
    disposal: disposalInfo.disposal,
    instructions: disposalInfo.instructions,
    specialNotes: disposalInfo.specialNotes,
    appliedRule: disposalInfo.appliedRule || undefined,
    matchScore,
    matchedTerm,
  };
};

/**
 * Get a user-friendly description of where a rule applies
 *
 * @param rule - The recycling rule
 * @returns A human-readable scope description
 */
export const getRuleScopeDescription = (rule: RecyclingRule): string => {
  switch (rule.scope) {
    case 'zone':
      return `Zone ${rule.zoneId}`;
    case 'municipal':
      return rule.townId || 'Municipal';
    case 'county':
      return `${rule.countyName} County`;
    case 'state':
      return rule.stateCode || 'State';
    case 'national':
      return 'National';
    default:
      return 'Unknown';
  }
};

/**
 * Get a user-friendly description of a disposal method
 *
 * @param method - The disposal method
 * @returns A human-readable description
 */
export const getDisposalMethodDescription = (method: DisposalMethod): string => {
  const descriptions: Record<DisposalMethod, string> = {
    curbside_recycling: 'Curbside Recycling',
    curbside_trash: 'Curbside Trash',
    curbside_compost: 'Curbside Compost',
    special_recycling_center: 'Recycling Center Drop-off',
    hazardous_waste: 'Hazardous Waste Facility',
    e_waste: 'Electronics Recycling',
    donation: 'Donate or Reuse',
    return_to_store: 'Return to Store',
    mail_back: 'Mail-in Recycling',
  };

  return descriptions[method] || method;
};

/**
 * Get an emoji icon for a disposal method
 *
 * @param method - The disposal method
 * @returns An emoji representing the method
 */
export const getDisposalMethodIcon = (method: DisposalMethod): string => {
  const icons: Record<DisposalMethod, string> = {
    curbside_recycling: '♻️',
    curbside_trash: '🗑️',
    curbside_compost: '🌱',
    special_recycling_center: '🏢',
    hazardous_waste: '⚠️',
    e_waste: '💻',
    donation: '🎁',
    return_to_store: '🏪',
    mail_back: '📦',
  };

  return icons[method] || '❓';
};
