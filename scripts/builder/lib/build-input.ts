import type {
  CollectionZone,
  Street,
  Town,
  ZoneSchedule,
} from '../../../RecyclePro/data/types';
import { parseStreetLines } from './parse-street-lines';
import { scrapeColumnText } from './html-tables';
import * as fs from 'fs';

/** One zone while authoring: same as app zone but streets can come from lines or HTML scrape. */
export type ZoneBuildInput = {
  id: string;
  name: string;
  description?: string;
  addressRanges?: CollectionZone['addressRanges'];
  boundary?: CollectionZone['boundary'];
  schedule: ZoneSchedule;
  /** Pre-built streets (copied from existing towns) */
  streets?: Street[];
  /** "Main St", "Oak Ave 10-99", … */
  streetLines?: string[];
  /** Scrape streets from a local HTML file for this zone */
  html?: {
    file: string;
    rowSelector: string;
    columnIndex: number;
    skipRows?: number;
  };
};

export type TownBuildInput = {
  id: string;
  name: string;
  state: string;
  county: string;
  zones: ZoneBuildInput[];
  recyclingCenter?: Town['recyclingCenter'];
  specialInstructions?: string[];
  recyclingProgram?: Town['recyclingProgram'];
};

function resolveZoneStreets(zone: ZoneBuildInput): Street[] {
  const chunks: Street[][] = [];

  if (zone.streets?.length) chunks.push(zone.streets);
  if (zone.streetLines?.length) chunks.push(parseStreetLines(zone.streetLines));

  if (zone.html) {
    const html = fs.readFileSync(zone.html.file, 'utf8');
    const lines = scrapeColumnText(html, {
      rowSelector: zone.html.rowSelector,
      columnIndex: zone.html.columnIndex,
      skipRows: zone.html.skipRows,
    });
    chunks.push(parseStreetLines(lines));
  }

  const merged = chunks.flat();
  if (!merged.length) {
    throw new Error(
      `Zone "${zone.id}" has no streets: set streets, streetLines, or html.`,
    );
  }

  return merged;
}

/** Turn authoring JSON (+ optional HTML files) into a Town ready for the app. */
export function townFromBuildInput(input: TownBuildInput): Town {
  const zones: CollectionZone[] = input.zones.map(z => {
    const { streetLines: _sl, streets: _s, html: _h, ...rest } = z;
    return {
      ...rest,
      streets: resolveZoneStreets(z),
    };
  });

  return {
    id: input.id,
    name: input.name,
    state: input.state,
    county: input.county,
    zones,
    recyclingCenter: input.recyclingCenter,
    specialInstructions: input.specialInstructions,
    recyclingProgram: input.recyclingProgram,
  };
}

export function parseBuildInputJson(raw: string): TownBuildInput {
  const data = JSON.parse(raw) as TownBuildInput;
  if (!data.id || !data.name || !data.state || !data.county) {
    throw new Error('Build input must include id, name, state, county');
  }
  if (!Array.isArray(data.zones) || data.zones.length === 0) {
    throw new Error('Build input must include a non-empty zones array');
  }
  return data;
}
