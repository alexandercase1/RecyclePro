import { StateInfo } from '../types';
import { atlanticCounty } from './atlantic';
import { bergenCounty } from './bergen';
import { burlingtonCounty } from './burlington';
import { camdenCounty } from './camden';
import { capeMayCounty } from './cape-may';
import { cumberlandCounty } from './cumberland';
import { essexCounty } from './essex';
import { gloucesterCounty } from './gloucester';
import { hudsonCounty } from './hudson';
import { hunterdonCounty } from './hunterdon';
import { mercerCounty } from './mercer';
import { middlesexCounty } from './middlesex';
import { monmouthCounty } from './monmouth';
import { morrisCounty } from './morris';
import { oceanCounty } from './ocean';
import { passaicCounty } from './passaic';
import { salemCounty } from './salem';
import { somersetCounty } from './somerset';
import { sussexCounty } from './sussex';
import { unionCounty } from './union';
import { warrenCounty } from './warren';

export const newJersey: StateInfo = {
  id: 'nj',
  name: 'New Jersey',
  abbreviation: 'NJ',
  counties: {
    atlantic: atlanticCounty,
    bergen: bergenCounty,
    burlington: burlingtonCounty,
    camden: camdenCounty,
    'cape-may': capeMayCounty,
    cumberland: cumberlandCounty,
    essex: essexCounty,
    gloucester: gloucesterCounty,
    hudson: hudsonCounty,
    hunterdon: hunterdonCounty,
    mercer: mercerCounty,
    middlesex: middlesexCounty,
    monmouth: monmouthCounty,
    morris: morrisCounty,
    ocean: oceanCounty,
    passaic: passaicCounty,
    salem: salemCounty,
    somerset: somersetCounty,
    sussex: sussexCounty,
    union: unionCounty,
    warren: warrenCounty,
  },
};

export { newJerseyRules } from './rules';
