import { RecyclingRule } from '@/data/types';

// National baseline rules (kept here)
import { nationalRules } from './national';

// Location-specific rules (imported from their locations)
import { newJerseyRules } from '@/data/locations/new-jersey/rules';
import { bergenCountyRules } from '@/data/locations/new-jersey/bergen/rules';
import { fairLawnRules } from '@/data/locations/new-jersey/bergen/towns/fair-lawn';
import { oradellRules } from '@/data/locations/new-jersey/bergen/towns/oradell';
import { waldwickRules } from '@/data/locations/new-jersey/bergen/towns/waldwick';

/**
 * All recycling rules in the database
 */
export const ALL_RULES: RecyclingRule[] = [
  ...nationalRules,
  ...newJerseyRules,
  ...bergenCountyRules,
  ...oradellRules,
  ...fairLawnRules,
  ...waldwickRules,
];

/**
 * Get all rules
 */
export const getAllRules = (): RecyclingRule[] => {
  return ALL_RULES;
};

/**
 * Get rules for a specific item
 */
export const getRulesForItem = (itemId: string): RecyclingRule[] => {
  return ALL_RULES.filter(rule => rule.itemId === itemId);
};

/**
 * Get rules by scope
 */
export const getRulesByScope = (scope: string): RecyclingRule[] => {
  return ALL_RULES.filter(rule => rule.scope === scope);
};
