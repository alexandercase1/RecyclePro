import { RecyclingRule } from '@/data/types';

// Import rule files
import { nationalRules } from './national';
import { newJerseyRules } from './new-jersey';
import { bergenCountyRules } from './bergen-county';
import { oradellRules } from './oradell';

/**
 * All recycling rules in the database
 */
export const ALL_RULES: RecyclingRule[] = [
  ...nationalRules,
  ...newJerseyRules,
  ...bergenCountyRules,
  ...oradellRules,
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
