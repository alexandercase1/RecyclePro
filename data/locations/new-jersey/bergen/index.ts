import { CountyInfo } from '../../types';
import { fairLawn } from './towns/fairlawn';
import { oradell } from './towns/oradell';

export const bergenCounty: CountyInfo = {
  id: 'bergen',
  name: 'Bergen County',
  towns: [
    oradell,
    fairLawn,
  ],
};

export { bergenCountyRules } from './rules';
