import { CountyInfo } from '../../types';
import { oradell } from './towns/oradell';

export const bergenCounty: CountyInfo = {
  id: 'bergen',
  name: 'Bergen County',
  towns: [
    oradell,
  ],
};

export { bergenCountyRules } from './rules';
