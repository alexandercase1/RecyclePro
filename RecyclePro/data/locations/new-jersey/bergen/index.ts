import { CountyInfo } from '../../types';
import { fairLawn } from './towns/fair-lawn';
import { oradell } from './towns/oradell';
import { waldwick } from './towns/waldwick';

export const bergenCounty: CountyInfo = {
  id: 'bergen',
  name: 'Bergen County',
  towns: [
    oradell,
    fairLawn,
    waldwick,
  ],
};

export { bergenCountyRules } from './rules';
