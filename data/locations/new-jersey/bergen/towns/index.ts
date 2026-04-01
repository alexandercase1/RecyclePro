import { Town } from '@/data/types';
import { oradell } from './oradell';
import { fairLawn } from './fair-lawn';

export { oradell, oradellRules } from './oradell';
export { fairLawn, fairLawnRules } from './fair-lawn';

// Only towns with actual data are listed here.
// Placeholder files exist for all remaining Bergen municipalities but are not
// imported until populated.
export const bergenTowns: Town[] = [oradell, fairLawn];
