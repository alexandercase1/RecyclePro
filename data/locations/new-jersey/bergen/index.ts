import { CountyInfo } from '../../types';
import { oradell } from './towns/oradell';

export const bergenCounty: CountyInfo = {
  id: 'bergen',
  name: 'Bergen County',
  towns: [
    oradell,
    fairlawn,
    paramus,
    wayne,
  ],
};

export { bergenCountyRules } from './rules';
