import { CountyInfo } from '../../types';
import { allendale } from './towns/allendale';
import { alpine } from './towns/alpine';
import { bogota } from './towns/bogota';
import { carlstadt } from './towns/carlstadt';
import { fairLawn } from './towns/fair-lawn';
import { oradell } from './towns/oradell';
import { waldwick } from './towns/waldwick';

export const bergenCounty: CountyInfo = {
  id: 'bergen',
  name: 'Bergen County',
  towns: [
    allendale,
    alpine,
    bogota,
    carlstadt,
    oradell,
    fairLawn,
    waldwick,
  ],
};

export { bergenCountyRules } from './rules';
