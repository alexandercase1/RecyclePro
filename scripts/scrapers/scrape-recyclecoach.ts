/**
 * scrape-recyclecoach.ts
 *
 * Fetches pickup schedule data from RecycleCoach's API and generates
 * TypeScript data files matching RecyclePro's data format.
 *
 * Usage:
 *   npx ts-node scrape-recyclecoach.ts --town "Hackensack"
 *   npx ts-node scrape-recyclecoach.ts --town "Hackensack" --state "NJ"
 *   npx ts-node scrape-recyclecoach.ts --all
 *   npx ts-node scrape-recyclecoach.ts --all --county "Bergen"
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface TownConfig {
  id: string;
  name: string;
  state: string;
  stateId: string;
  county: string;
  countyId: string;
  varName: string;
  fileName: string;
  skipScrape?: boolean;
  rcSearchName?: string; // Override city name used in RecycleCoach lookup
  notes?: string;
}

interface RCCity {
  project_id: string;
  district_id: string;
  url: string;
  city_nm: string;
  state_cd: string;
}

interface RCCollectionType {
  title: string;
  curbTime?: string;
  colour?: string;
}

interface RCCollectionTypes {
  [key: string]: RCCollectionType; // "collection-XXXX": { title, ... }
}

interface RCScheduleEvent {
  date: string; // "YYYY-MM-DD"
  collections: { id: number; status: string }[];
}

interface RCZoneResult {
  address: string;
  district_id: string;
  zones: { [key: string]: string }; // e.g. {"3782": "z14032"}
  full_address: string;
}

type CollectionCategory =
  | 'garbage'
  | 'paper_recycling'
  | 'commingled_recycling'
  | 'recycling_generic'
  | 'yard_waste'
  | 'other';

interface ZoneAnalysis {
  rcZoneId: string; // e.g. "zone-z14032"
  garbageDays: number[];
  recycling: {
    day: number;
    even: 'commingled' | 'paper' | 'none';
    odd: 'commingled' | 'paper' | 'none';
    evenLabel: string;
    oddLabel: string;
  } | null;
  yardWaste: {
    day: number;
    seasonStart: string;
    seasonEnd: string;
  } | null;
}

// ============================================================================
// Helpers
// ============================================================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function mostCommonValue(values: number[]): number {
  const counts: Record<number, number> = {};
  for (const v of values) counts[v] = (counts[v] || 0) + 1;
  return Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]);
}

function categorizeCollection(title: string): CollectionCategory {
  const t = title.toLowerCase();
  // Check recycling subtypes before generic recycling
  if (t.includes('paper') || t.includes('cardboard') || t.includes('newspaper')) {
    return 'paper_recycling';
  }
  if (
    t.includes('commingled') ||
    t.includes('comingled') ||
    t.includes('mixed recycl') ||
    (t.includes('glass') && t.includes('plastic'))
  ) {
    return 'commingled_recycling';
  }
  if (t.includes('recycl')) return 'recycling_generic';
  if (t.includes('yard') || t.includes('leaf') || t.includes('leaves') || t.includes('green waste')) {
    return 'yard_waste';
  }
  // Bulk goes to 'other' — we don't want it showing as garbage
  if (t.includes('bulk')) return 'other';
  if (
    t.includes('garbage') ||
    t.includes('trash') ||
    t.includes('refuse') ||
    (t.includes('waste') && !t.includes('yard') && !t.includes('hazard') && !t.includes('bulk'))
  ) {
    return 'garbage';
  }
  return 'other';
}

// ============================================================================
// RecycleCoach API
// ============================================================================

const RC_API = 'https://api-city.recyclecoach.com';
const RC_US_API = 'https://us-api-city.recyclecoach.com';
const RC_APIGW = 'https://us-web.apigw.recyclecoach.com';

async function lookupCity(city: string, state: string): Promise<RCCity | null> {
  try {
    const res = await axios.get(`${RC_API}/city/search`, {
      params: { term: `${city}, ${state}, USA` },
      timeout: 10000,
    });
    const results: RCCity[] = Array.isArray(res.data) ? res.data : [];
    // Prefer exact name + state match
    const exact = results.find(
      r => r.city_nm.toLowerCase() === city.toLowerCase() && r.state_cd === state
    );
    return exact || results[0] || null;
  } catch {
    return null;
  }
}

async function discoverZones(
  projectId: string,
  districtId: string,
  _townName: string,
  _state: string
): Promise<string[]> {
  // The zone-setup endpoint uses project/district context from params — street
  // addresses should NOT include city/state. Each call returns multiple nearby
  // addresses, often spanning different zones.
  const probeTerms = [
    '250 Main St',
    '1 Main St',
    '500 Main St',
    '100 Center Ave',
    '1 Valley Rd',
    '1 Broad St',
    '100 Broad St',
    '1 Park Ave',
    '100 Park Ave',
    '1 River Rd',
    '100 Church St',
    '1 High St',
    '100 Bergen Blvd',
    '1 Maple Ave',
    '100 Washington Ave',
    '1 Kinderkamack Rd',
    '100 Broadway',
  ];

  const zoneIds = new Set<string>();

  for (const term of probeTerms) {
    try {
      const res = await axios.get(`${RC_US_API}/zone-setup/address`, {
        params: { sku: projectId, district: districtId, prompt: 'undefined', term },
        timeout: 10000,
      });
      const results: RCZoneResult[] = res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
      for (const r of results) {
        for (const zoneId of Object.values(r.zones)) {
          zoneIds.add(`zone-${zoneId}`);
        }
      }
      await delay(300);
    } catch {
      // continue to next probe
    }
  }

  return Array.from(zoneIds).sort();
}

async function getCollectionTypes(
  projectId: string,
  districtId: string,
  zoneId: string
): Promise<RCCollectionTypes> {
  try {
    const res = await axios.get(`${RC_US_API}/collections`, {
      params: { project_id: projectId, district_id: districtId, zone_id: zoneId, lang_cd: 'en_US' },
      timeout: 10000,
    });
    if (res.data?.status === 'success') {
      return res.data.collection?.types ?? {};
    }
    return {};
  } catch {
    return {};
  }
}

async function getSchedule(
  projectId: string,
  districtId: string,
  zoneId: string
): Promise<RCScheduleEvent[]> {
  const params = { project_id: projectId, district_id: districtId, zone_id: zoneId };

  // Try both known endpoints — different regions use different ones
  const urls = [
    `${RC_APIGW}/zone-setup/zone/schedules`,
    `${RC_API}/app_data_zone_schedules`,
  ];

  for (const url of urls) {
    try {
      const res = await axios.get(url, { params, timeout: 10000 });
      const data = res.data;
      if (!data?.DATA || !Array.isArray(data.DATA)) continue;

      const events: RCScheduleEvent[] = [];
      for (const yearData of data.DATA) {
        for (const monthData of yearData.months ?? []) {
          for (const event of monthData.events ?? []) {
            // Skip events where all collections have status 'is_none'
            if (event.collections.some((c: { id: number; status: string }) => c.status !== 'is_none')) {
              events.push(event);
            }
          }
        }
      }
      return events;
    } catch {
      // try next URL
    }
  }

  return [];
}

// ============================================================================
// Pattern Analysis
// ============================================================================

function analyzeZone(
  events: RCScheduleEvent[],
  collectionTypes: RCCollectionTypes,
  rcZoneId: string
): ZoneAnalysis {
  // Build a map of typeId → category
  const typeCategories: Record<number, CollectionCategory> = {};
  for (const key of Object.keys(collectionTypes)) {
    const id = parseInt(key.replace('collection-', ''));
    if (!isNaN(id)) {
      typeCategories[id] = categorizeCollection(collectionTypes[key].title);
    }
  }

  // Group dates by category
  const datesByCategory: Record<CollectionCategory, string[]> = {
    garbage: [],
    paper_recycling: [],
    commingled_recycling: [],
    recycling_generic: [],
    yard_waste: [],
    other: [],
  };

  for (const event of events) {
    for (const c of event.collections) {
      if (c.status === 'is_none') continue;
      const cat = typeCategories[c.id] ?? 'other';
      datesByCategory[cat].push(event.date);
    }
  }

  // ---- Garbage days ----
  const garbageDays: number[] = [];
  const garbageDateList = datesByCategory.garbage;
  if (garbageDateList.length > 0) {
    const dows = garbageDateList.map(d => new Date(d + 'T00:00:00Z').getUTCDay());
    const counts: Record<number, number> = {};
    for (const d of dows) counts[d] = (counts[d] || 0) + 1;
    // Include any day that accounts for >15% of garbage events
    // (handles towns with 2 pickup days per week)
    const total = garbageDateList.length;
    for (const [day, count] of Object.entries(counts)) {
      if (count / total > 0.15) garbageDays.push(parseInt(day));
    }
    garbageDays.sort();
  }

  // ---- Recycling ----
  let recycling: ZoneAnalysis['recycling'] = null;

  const paperDates = datesByCategory.paper_recycling;
  const commingledDates = datesByCategory.commingled_recycling;
  const genericDates = datesByCategory.recycling_generic;

  if (paperDates.length > 0 && commingledDates.length > 0) {
    // Alternating paper / commingled
    const allRecyclingDates = [...paperDates, ...commingledDates];
    const dows = allRecyclingDates.map(d => new Date(d + 'T00:00:00Z').getUTCDay());
    const recyclingDay = mostCommonValue(dows);

    // Determine which ISO week parity gets paper
    const paperWeeks = paperDates.map(d => getISOWeekNumber(new Date(d + 'T00:00:00Z')));
    const evenPaperCount = paperWeeks.filter(w => w % 2 === 0).length;
    const paperIsEven = evenPaperCount >= paperWeeks.length - evenPaperCount;

    const paperKey = Object.keys(collectionTypes).find(
      k => categorizeCollection(collectionTypes[k].title) === 'paper_recycling'
    );
    const commingledKey = Object.keys(collectionTypes).find(
      k => categorizeCollection(collectionTypes[k].title) === 'commingled_recycling'
    );
    const paperLabel = paperKey ? collectionTypes[paperKey].title : 'Paper & Cardboard';
    const commingledLabel = commingledKey ? collectionTypes[commingledKey].title : 'Commingled Recycling';

    recycling = {
      day: recyclingDay,
      even: paperIsEven ? 'paper' : 'commingled',
      odd: paperIsEven ? 'commingled' : 'paper',
      evenLabel: paperIsEven ? paperLabel : commingledLabel,
      oddLabel: paperIsEven ? commingledLabel : paperLabel,
    };
  } else {
    const sourceDates = commingledDates.length > 0 ? commingledDates : genericDates;
    if (sourceDates.length > 0) {
      const dows = sourceDates.map(d => new Date(d + 'T00:00:00Z').getUTCDay());
      const recyclingDay = mostCommonValue(dows);

      // Detect weekly vs biweekly via average interval
      const sorted = [...sourceDates].sort();
      let avgInterval = 7; // default: weekly
      if (sorted.length > 1) {
        const intervals: number[] = [];
        for (let i = 1; i < sorted.length; i++) {
          const ms = new Date(sorted[i] + 'T00:00:00Z').getTime() - new Date(sorted[i - 1] + 'T00:00:00Z').getTime();
          intervals.push(ms / 86400000);
        }
        // Filter out large gaps (holiday periods, data gaps) before averaging
        const normalIntervals = intervals.filter(n => n < 30);
        if (normalIntervals.length > 0) {
          avgInterval = normalIntervals.reduce((a, b) => a + b, 0) / normalIntervals.length;
        }
      }

      const isBiweekly = avgInterval > 10;

      let even: 'commingled' | 'none' = 'commingled';
      let odd: 'commingled' | 'none' = isBiweekly ? 'none' : 'commingled';

      if (isBiweekly) {
        // Determine which week parity has pickup
        const weeks = sourceDates.map(d => getISOWeekNumber(new Date(d + 'T00:00:00Z')));
        const evenCount = weeks.filter(w => w % 2 === 0).length;
        const oddCount = weeks.length - evenCount;
        if (evenCount < oddCount) {
          even = 'none';
          odd = 'commingled';
        }
      }

      const typeKey = Object.keys(collectionTypes).find(k =>
        ['commingled_recycling', 'recycling_generic'].includes(
          categorizeCollection(collectionTypes[k].title)
        )
      );
      const label = typeKey ? collectionTypes[typeKey].title : 'Recycling';

      recycling = {
        day: recyclingDay,
        even,
        odd,
        evenLabel: even !== 'none' ? label : 'No pickup',
        oddLabel: odd !== 'none' ? label : 'No pickup',
      };
    }
  }

  // ---- Yard waste ----
  let yardWaste: ZoneAnalysis['yardWaste'] = null;
  const yardDates = datesByCategory.yard_waste;
  if (yardDates.length > 0) {
    const dows = yardDates.map(d => new Date(d + 'T00:00:00Z').getUTCDay());
    const ywDay = mostCommonValue(dows);
    const months = yardDates.map(d => new Date(d + 'T00:00:00Z').getUTCMonth() + 1);
    const minMonth = Math.min(...months);
    const maxMonth = Math.max(...months);
    yardWaste = {
      day: ywDay,
      seasonStart: `${String(minMonth).padStart(2, '0')}-01`,
      seasonEnd: `${String(maxMonth).padStart(2, '0')}-30`,
    };
  }

  return { rcZoneId, garbageDays, recycling, yardWaste };
}

// ============================================================================
// TypeScript Code Generation
// ============================================================================

function generateTownFile(config: TownConfig, zones: ZoneAnalysis[]): string {
  const { id, name, state, county, varName } = config;
  const today = new Date().toISOString().split('T')[0];

  const zoneBlocks = zones.map((zone, idx) => {
    const hasMultipleZones = zones.length > 1;
    const zoneName = hasMultipleZones ? `Zone ${idx + 1}` : name;
    const zoneId = `${varName}-zone-${idx + 1}`;
    const garbayDayNames = zone.garbageDays.map(d => DAY_NAMES[d]).join(' & ') || 'TODO: verify';

    const garbageComment = zone.garbageDays.map(d => DAY_NAMES[d]).join(', ');

    let recyclingBlock: string;
    if (zone.recycling) {
      const r = zone.recycling;
      recyclingBlock = `        recycling: {
          type: 'alternating',
          day: ${r.day}, // ${DAY_NAMES[r.day]}
          weeks: {
            even: '${r.even}',
            odd: '${r.odd}',
          },
          evenLabel: '${r.evenLabel}',
          oddLabel: '${r.oddLabel}',
        },`;
    } else {
      recyclingBlock = `        // TODO: Recycling schedule not detected — verify manually
        recycling: {
          type: 'alternating',
          day: 0, // TODO: day unknown
          weeks: { even: 'commingled', odd: 'paper' },
          evenLabel: 'Commingled Recycling',
          oddLabel: 'Paper Recycling',
        },`;
    }

    const yardWasteBlock = zone.yardWaste
      ? `        yardWaste: {
          days: [${zone.yardWaste.day}], // ${DAY_NAMES[zone.yardWaste.day]}
          seasonStart: '${zone.yardWaste.seasonStart}',
          seasonEnd: '${zone.yardWaste.seasonEnd}',
        },`
      : `        // yardWaste: { days: [], seasonStart: 'MM-DD', seasonEnd: 'MM-DD' }, // TODO: verify`;

    return `    // Zone ${idx + 1} (RecycleCoach zone: ${zone.rcZoneId})
    {
      id: '${zoneId}',
      name: '${zoneName}',
      description: 'Garbage collected ${garbayDayNames}',
      streets: [], // TODO: Street assignments not available via RecycleCoach
      schedule: {
        garbage: {
          days: [${zone.garbageDays.join(', ')}], // ${garbageComment || 'TODO'}
          time: '6:00 AM', // TODO: verify curb-out time
        },
${recyclingBlock}
${yardWasteBlock}
      },
    }`;
  });

  return `import { Town } from '@/data/types';

// Source: RecycleCoach API (recyclecoach.com)
// Scraped: ${today} — auto-generated by scripts/scrape-recyclecoach.ts
//
// TODOs before this file is production-ready:
//   1. Verify schedule accuracy against the municipal website
//   2. Add recyclingCenter (address, hours, phone)
//   3. Add specialInstructions from the DPW page
//   4. Add street-to-zone assignments if the town has multiple zones
//   5. Check yard waste season dates

export const ${varName}: Town = {
  id: '${id}',
  name: '${name}',
  state: '${state}',
  county: '${county}',

  zones: [
${zoneBlocks.join(',\n\n')}
  ],

  // recyclingCenter: {
  //   name: '${name} Recycling Center',
  //   address: 'TODO',
  //   hours: { weekday: 'TODO', saturday: 'TODO' },
  //   phone: 'TODO',
  // },

  // specialInstructions: [],
};
`;
}

// ============================================================================
// File I/O
// ============================================================================

function getTownFilePath(config: TownConfig): string {
  return path.resolve(
    __dirname,
    '../../RecyclePro/data/locations',
    config.stateId,
    config.countyId,
    'towns',
    `${config.fileName}.ts`
  );
}

function writeTownFile(config: TownConfig, content: string): void {
  const filePath = getTownFilePath(config);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ Written → ${path.relative(path.join(__dirname, '..'), filePath)}`);
}

// ============================================================================
// Single Town Processing
// ============================================================================

type ProcessResult = 'success' | 'not_found' | 'error' | 'skipped';

async function processOneTown(config: TownConfig): Promise<ProcessResult> {
  const { name, state } = config;

  try {
    console.log(`\n▶ ${name}, ${state}`);

    // 1. City lookup (use rcSearchName override if provided)
    const searchName = config.rcSearchName ?? name;
    const city = await lookupCity(searchName, state);
    if (!city) {
      console.log(`  ✗ Not found on RecycleCoach`);
      return 'not_found';
    }
    const { project_id: projectId, district_id: districtId } = city;
    console.log(`  Found: project=${projectId}  district=${districtId}`);
    await delay(300);

    // 2. Zone discovery
    const zoneIds = await discoverZones(projectId, districtId, name, state); // name/state unused internally but kept for logging
    if (zoneIds.length === 0) {
      console.log(`  ✗ No zones found`);
      return 'error';
    }
    console.log(`  Zones: ${zoneIds.join(', ')}`);
    await delay(300);

    // 3. Analyze each zone
    const analyses: ZoneAnalysis[] = [];
    let lastKnownTypes: RCCollectionTypes = {};

    for (const zoneId of zoneIds) {
      console.log(`  Analyzing ${zoneId}...`);

      const types = await getCollectionTypes(projectId, districtId, zoneId);
      if (Object.keys(types).length > 0) lastKnownTypes = types;
      await delay(300);

      const events = await getSchedule(projectId, districtId, zoneId);
      await delay(300);

      if (events.length === 0) {
        console.log(`    No schedule data`);
        continue;
      }

      const analysis = analyzeZone(events, types || lastKnownTypes, zoneId);

      const gDays = analysis.garbageDays.map(d => DAY_NAMES[d]).join(', ') || '?';
      const rDay = analysis.recycling ? DAY_NAMES[analysis.recycling.day] : '?';
      const rPattern =
        analysis.recycling
          ? `${analysis.recycling.even}/${analysis.recycling.odd}`
          : 'unknown';
      console.log(`    Garbage: ${gDays}  |  Recycling: ${rDay} (${rPattern})`);

      analyses.push(analysis);
    }

    if (analyses.length === 0) {
      console.log(`  ✗ No usable schedule data`);
      return 'error';
    }

    // 4. Generate and write TypeScript file
    const content = generateTownFile(config, analyses);
    writeTownFile(config, content);
    return 'success';
  } catch (err) {
    console.error(`  ✗ Error:`, err instanceof Error ? err.message : err);
    return 'error';
  }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
RecycleCoach Scraper
Usage:
  npx ts-node scrape-recyclecoach.ts --town "Hackensack"
  npx ts-node scrape-recyclecoach.ts --town "Hackensack" --state "NJ"
  npx ts-node scrape-recyclecoach.ts --all
  npx ts-node scrape-recyclecoach.ts --all --county "Bergen"
    `);
    process.exit(0);
  }

  const townsFile = path.join(__dirname, '../towns-to-scrape.json');
  const allTowns: TownConfig[] = JSON.parse(fs.readFileSync(townsFile, 'utf8'));

  const runAll = args.includes('--all');
  const townArg = getArg(args, '--town');
  const stateArg = getArg(args, '--state') ?? 'NJ';
  const countyArg = getArg(args, '--county');

  let townsToProcess: TownConfig[];

  if (townArg) {
    const found = allTowns.find(
      t => t.name.toLowerCase() === townArg.toLowerCase() && t.state === stateArg
    );
    if (!found) {
      console.error(
        `Town "${townArg}" (${stateArg}) not found in towns-to-scrape.json.\n` +
        `Available towns: ${allTowns.map(t => t.name).join(', ')}`
      );
      process.exit(1);
    }
    townsToProcess = [found];
  } else if (runAll) {
    townsToProcess = allTowns.filter(t => {
      if (t.skipScrape) return false;
      if (countyArg && t.county.toLowerCase() !== countyArg.toLowerCase()) return false;
      return true;
    });
  } else {
    console.error('Provide --town "Name" or --all');
    process.exit(1);
  }

  console.log(`Processing ${townsToProcess.length} town(s)...`);
  if (townsToProcess.some(t => t.skipScrape)) {
    const skipped = allTowns.filter(t => t.skipScrape).map(t => t.name);
    console.log(`Skipped (existing data): ${skipped.join(', ')}`);
  }

  const results: Record<ProcessResult, number> = { success: 0, not_found: 0, error: 0, skipped: 0 };

  for (const town of townsToProcess) {
    const status = await processOneTown(town);
    results[status]++;
    await delay(500);
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Results
  ✓ Success:              ${results.success}
  ✗ Not on RecycleCoach:  ${results.not_found}
  ✗ Errors:               ${results.error}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next steps:
  1. Review generated .ts files for accuracy
  2. Add recyclingCenter info for each town
  3. Add specialInstructions from DPW pages
  4. Update RecyclePro/data/locations/.../towns/index.ts to import new towns
`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
