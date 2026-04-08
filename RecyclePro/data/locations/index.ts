import { Town } from '../types';
import { StateInfo, CountyInfo } from './types';

// Import all 50 states
import { alabama } from './alabama';
import { alaska } from './alaska';
import { arizona } from './arizona';
import { arkansas } from './arkansas';
import { california } from './california';
import { colorado } from './colorado';
import { connecticut } from './connecticut';
import { delaware } from './delaware';
import { florida } from './florida';
import { georgia } from './georgia';
import { hawaii } from './hawaii';
import { idaho } from './idaho';
import { illinois } from './illinois';
import { indiana } from './indiana';
import { iowa } from './iowa';
import { kansas } from './kansas';
import { kentucky } from './kentucky';
import { louisiana } from './louisiana';
import { maine } from './maine';
import { maryland } from './maryland';
import { massachusetts } from './massachusetts';
import { michigan } from './michigan';
import { minnesota } from './minnesota';
import { mississippi } from './mississippi';
import { missouri } from './missouri';
import { montana } from './montana';
import { nebraska } from './nebraska';
import { nevada } from './nevada';
import { newHampshire } from './new-hampshire';
import { newJersey } from './new-jersey';
import { newMexico } from './new-mexico';
import { newYork } from './new-york';
import { northCarolina } from './north-carolina';
import { northDakota } from './north-dakota';
import { ohio } from './ohio';
import { oklahoma } from './oklahoma';
import { oregon } from './oregon';
import { pennsylvania } from './pennsylvania';
import { rhodeIsland } from './rhode-island';
import { southCarolina } from './south-carolina';
import { southDakota } from './south-dakota';
import { tennessee } from './tennessee';
import { texas } from './texas';
import { utah } from './utah';
import { vermont } from './vermont';
import { virginia } from './virginia';
import { washington } from './washington';
import { westVirginia } from './west-virginia';
import { wisconsin } from './wisconsin';
import { wyoming } from './wyoming';

/**
 * All states in the system
 */
export const states: Record<string, StateInfo> = {
  'alabama': alabama,
  'alaska': alaska,
  'arizona': arizona,
  'arkansas': arkansas,
  'california': california,
  'colorado': colorado,
  'connecticut': connecticut,
  'delaware': delaware,
  'florida': florida,
  'georgia': georgia,
  'hawaii': hawaii,
  'idaho': idaho,
  'illinois': illinois,
  'indiana': indiana,
  'iowa': iowa,
  'kansas': kansas,
  'kentucky': kentucky,
  'louisiana': louisiana,
  'maine': maine,
  'maryland': maryland,
  'massachusetts': massachusetts,
  'michigan': michigan,
  'minnesota': minnesota,
  'mississippi': mississippi,
  'missouri': missouri,
  'montana': montana,
  'nebraska': nebraska,
  'nevada': nevada,
  'new-hampshire': newHampshire,
  'new-jersey': newJersey,
  'new-mexico': newMexico,
  'new-york': newYork,
  'north-carolina': northCarolina,
  'north-dakota': northDakota,
  'ohio': ohio,
  'oklahoma': oklahoma,
  'oregon': oregon,
  'pennsylvania': pennsylvania,
  'rhode-island': rhodeIsland,
  'south-carolina': southCarolina,
  'south-dakota': southDakota,
  'tennessee': tennessee,
  'texas': texas,
  'utah': utah,
  'vermont': vermont,
  'virginia': virginia,
  'washington': washington,
  'west-virginia': westVirginia,
  'wisconsin': wisconsin,
  'wyoming': wyoming,
};

/**
 * Get all towns across all states
 */
export const getAllTowns = (): Town[] => {
  const towns: Town[] = [];

  for (const state of Object.values(states)) {
    for (const county of Object.values(state.counties)) {
      towns.push(...county.towns);
    }
  }

  return towns;
};

/**
 * Get a town by its ID
 */
export const getTownById = (townId: string): Town | undefined => {
  const allTowns = getAllTowns();
  return allTowns.find(town => town.id === townId);
};

/**
 * Get all towns in a specific county
 */
export const getTownsByCounty = (stateId: string, countyId: string): Town[] => {
  const state = states[stateId.toLowerCase()];
  if (!state) return [];

  const county = state.counties[countyId.toLowerCase()];
  if (!county) return [];

  return county.towns;
};

/**
 * Get all towns in a state
 */
export const getTownsByState = (stateId: string): Town[] => {
  const state = states[stateId.toLowerCase()];
  if (!state) return [];

  const towns: Town[] = [];
  for (const county of Object.values(state.counties)) {
    towns.push(...county.towns);
  }

  return towns;
};

/**
 * Search towns by name across all states
 */
export const searchTowns = (query: string): Town[] => {
  const lowerQuery = query.toLowerCase();
  const allTowns = getAllTowns();

  return allTowns.filter(town =>
    town.name.toLowerCase().includes(lowerQuery) ||
    town.county.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get all zones for a town
 */
export const getTownZones = (townId: string) => {
  const town = getTownById(townId);
  return town?.zones || [];
};

// Export types for use in other modules
export type { StateInfo, CountyInfo };
