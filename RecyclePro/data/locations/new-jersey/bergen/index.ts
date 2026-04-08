import { CountyInfo } from '../../types';
import { allendale } from './towns/allendale';
import { alpine } from './towns/alpine';
import { fairLawn } from './towns/fair-lawn';
import { oradell } from './towns/oradell';
import { waldwick } from './towns/waldwick';

export const bergenCounty: CountyInfo = {
  id: 'bergen',
  name: 'Bergen County',
  towns: [
    allendale,
    alpine,
    oradell,
    fairLawn,
    waldwick,
  ],
};

export { bergenCountyRules } from './rules';
