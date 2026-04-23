import type { Town } from '@/data/types';
import { allendale } from './allendale';
import { alpine } from './alpine';
import { bogota } from './bogota';
import { carlstadt } from './carlstadt';
import { oradell } from './oradell';
import { fairLawn } from './fair-lawn';
import { bergenfield } from './bergenfield';
import { cliffsidePark } from './cliffside-park';
import { cresskill } from './cresskill';
import { dumont } from './dumont';
import { edgewater } from './edgewater';
import { elmwoodPark } from './elmwood-park';
import { emerson } from './emerson';
import { englewood } from './englewood';
import { fairview } from './fairview';
import { fortLee } from './fort-lee';
import { franklinLakes } from './franklin-lakes';
import { garfield } from './garfield';
import { hackensack } from './hackensack';
import { hasbrouckHeights } from './hasbrouck-heights';
import { hillsdale } from './hillsdale';
import { hoHoKus } from './ho-ho-kus';
import { lodi } from './lodi';
import { lyndhurst } from './lyndhurst';
import { mahwah } from './mahwah';
import { montvale } from './montvale';
import { newMilford } from './new-milford';
import { waldwick } from './waldwick';

export { oradell, oradellRules } from './oradell';
export { fairLawn, fairLawnRules } from './fair-lawn';
export { waldwick, waldwickRules } from './waldwick';
export { allendale, allendaleRules } from './allendale';
export { alpine, alpineRules } from './alpine';
export { bogota, bogotaRules } from './bogota';
export { carlstadt, carlstadtRules } from './carlstadt';
export { bergenfield } from './bergenfield';
export { cliffsidePark } from './cliffside-park';
export { cresskill } from './cresskill';
export { dumont } from './dumont';
export { edgewater } from './edgewater';
export { elmwoodPark } from './elmwood-park';
export { emerson } from './emerson';
export { englewood } from './englewood';
export { fairview } from './fairview';
export { fortLee } from './fort-lee';
export { franklinLakes } from './franklin-lakes';
export { garfield } from './garfield';
export { hackensack } from './hackensack';
export { hasbrouckHeights } from './hasbrouck-heights';
export { hillsdale } from './hillsdale';
export { hoHoKus } from './ho-ho-kus';
export { lodi } from './lodi';
export { lyndhurst } from './lyndhurst';
export { mahwah } from './mahwah';
export { montvale } from './montvale';
export { newMilford } from './new-milford';

// Only towns with actual schedule data are listed here.
// Placeholder files exist for remaining Bergen municipalities but are not
// imported until populated.
export const bergenTowns: Town[] = [
  allendale,
  alpine,
  bogota,
  carlstadt,
  oradell,
  fairLawn,
  waldwick,
  bergenfield,
  cliffsidePark,
  cresskill,
  dumont,
  edgewater,
  elmwoodPark,
  emerson,
  englewood,
  fairview,
  fortLee,
  franklinLakes,
  garfield,
  hackensack,
  hasbrouckHeights,
  hillsdale,
  hoHoKus,
  lodi,
  lyndhurst,
  mahwah,
  montvale,
  newMilford,
];
