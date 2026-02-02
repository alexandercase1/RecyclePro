import { Town } from '../types';

/**
 * County information within a state's location hierarchy
 */
export interface CountyInfo {
  id: string;
  name: string;
  towns: Town[];
}

/**
 * State information in the location hierarchy
 */
export interface StateInfo {
  id: string;
  name: string;
  abbreviation: string;
  counties: Record<string, CountyInfo>;
}
