import { RecyclingRule } from '@/data/types';

/**
 * New Jersey state-specific recycling rules
 *
 * These override national defaults for NJ residents
 */
export const newJerseyRules: RecyclingRule[] = [
  // Example: NJ accepts plastic bags at curbside (hypothetical)
  // {
  //   id: 'rule-nj-plastic-bag',
  //   itemId: 'item-plastic-bag',
  //   scope: 'state',
  //   stateCode: 'NJ',
  //   disposal: 'curbside_recycling',
  //   instructions: 'Place in separate bag marked for plastic film',
  //   specialNotes: 'NJ allows curbside collection of plastic bags',
  //   source: 'NJ DEP Recycling Guidelines 2026',
  // },
];
