import { CountyInfo } from '../../types';
import { bergenTowns } from './towns';

export const bergenCounty: CountyInfo = {
  id: 'bergen',
  name: 'Bergen County',
  towns: bergenTowns,
};

export { bergenCountyRules } from './rules';
