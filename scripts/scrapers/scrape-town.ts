/**
 * RecyclePro Town Data Scraper — Free Methods Only
 *
 * Fetches a town's DPW website using a waterfall of free extraction strategies:
 *   1. iCalendar (.ics) file detection and parsing
 *   2. CMS-specific pattern matching (CivicPlus, Vision Internet, Granicus)
 *   3. Generic keyword/regex extraction via cheerio
 *
 * If none succeed, writes a "NEEDS MANUAL REVIEW" placeholder with the source URL.
 * No API key required.
 *
 * Usage:
 *   npx ts-node scrape-town.ts --town hackensack
 *   npx ts-node scrape-town.ts --all
 *
 * For towns that free methods couldn't parse, use the AI fallback:
 *   npx ts-node scrape-town-ai.ts --town hackensack
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import townsToScrape from '../towns-to-scrape.json';

import { findIcalLink, extractFromIcal } from './extractors/ical';
import { detectCms, extractByCmsPattern } from './extractors/cms-patterns';
import { extractGeneric } from './extractors/generic';
import { ExtractionResult, EMPTY_RESULT } from './extractors/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TownConfig {
  id: string;
  name: string;
  state: string;
  stateId: string;
  county: string;
  countyId: string;
  varName: string;
  fileName: string;
  dpwUrl: string;
  notes: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_ROOT = path.resolve(__dirname, '../../RecyclePro');

// ─── Fetch HTML ───────────────────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const resp = await axios.get(url, {
    timeout: 15000,
    headers: { 'User-Agent': 'RecyclePro Data Collector (research/educational use)' },
  });
  return resp.data as string;
}

// ─── Free extraction waterfall ────────────────────────────────────────────────

async function extractFree(html: string, town: TownConfig): Promise<ExtractionResult> {
  // Step 1 — iCal
  const icsUrl = await findIcalLink(html, town.dpwUrl);
  if (icsUrl) {
    console.log(`    [iCal] Found .ics link: ${icsUrl}`);
    const result = await extractFromIcal(icsUrl);
    if (result.confidence !== 'none') {
      return result;
    }
    console.log(`    [iCal] Failed: ${result.reason}`);
  }

  // Step 2 — CMS pattern
  const cms = detectCms(html);
  if (cms !== 'unknown') {
    console.log(`    [CMS] Detected: ${cms}`);
    const result = extractByCmsPattern(html, cms);
    if (result.zones.length > 0) {
      return result;
    }
    console.log(`    [CMS] Failed: ${result.reason}`);
  }

  // Step 3 — Generic cheerio
  console.log(`    [Generic] Running keyword/regex extraction...`);
  const result = extractGeneric(html);
  return result;
}

// ─── TypeScript file generator ────────────────────────────────────────────────

function dayLabel(day: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day] ?? '?';
}

function generateTownFile(town: TownConfig, data: ExtractionResult, sourceUrl: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const hasData = data.zones.length > 0;

  if (!hasData) {
    return `// NEEDS MANUAL REVIEW
// Scrape attempted: ${today}
// Source: ${sourceUrl}
// Extraction method: ${data.method}
// Reason: ${data.reason}
//
// To complete this file:
//   1. Visit the URL above and find the garbage/recycling schedule
//   2. Fill in the Town object below using the oradell.ts or fair-lawn.ts files as a reference
//   3. Add recycling center info if available
//   4. Or for AI-assisted extraction: npx ts-node scrape-town-ai.ts --town ${town.fileName}
//
// import { Town, RecyclingRule } from '@/data/types';
// export const ${town.varName}: Town = {
//   id: '${town.id}',
//   name: '${town.name}',
//   state: '${town.state}',
//   county: '${town.county}',
//   zones: [],
// };
// export const ${town.varName}Rules: RecyclingRule[] = [];
`;
  }

  const zonesCode = data.zones.map((zone, i) => {
    const garbageComment = zone.garbageDays.map(d => dayLabel(d)).join(' & ');
    const recyclingComment = zone.recyclingDay !== null ? dayLabel(zone.recyclingDay) : 'Unknown';

    const recyclingBlock = zone.recyclingDay !== null
      ? `        recycling: {
          type: 'alternating',
          day: ${zone.recyclingDay}, // ${recyclingComment}
          weeks: {
            even: '${zone.recyclingAlternation.even}',
            odd: '${zone.recyclingAlternation.odd}',
          },
          evenLabel: '${zone.recyclingAlternation.even === 'commingled' ? 'Commingled (Glass, Plastic, Metal, Cans)' : 'Newspaper & Cardboard'}',
          oddLabel: '${zone.recyclingAlternation.odd === 'paper' ? 'Newspaper & Cardboard' : 'Commingled (Glass, Plastic, Metal, Cans)'}',
        },`
      : `        // recycling: day not found — verify at ${sourceUrl}`;

    const yardBlock = zone.yardWasteDays.length > 0 && zone.yardWasteStart
      ? `        yardWaste: {
          days: [${zone.yardWasteDays.join(', ')}], // ${zone.yardWasteDays.map(d => dayLabel(d)).join(' & ')}
          seasonStart: '${zone.yardWasteStart}',
          seasonEnd: '${zone.yardWasteEnd ?? '11-30'}',
        },`
      : `        // yardWaste: not found — verify at ${sourceUrl}`;

    return `    {
      id: '${town.id}-zone-${i + 1}',
      name: '${zone.name.replace(/'/g, "\\'")}',
      description: '${(zone.description ?? zone.name).replace(/'/g, "\\'")}',
      // TODO: streets not populated — add when zone-to-street data is available
      streets: [],
      schedule: {
        garbage: {
          days: [${zone.garbageDays.join(', ')}], // ${garbageComment}
          time: '6:00 AM',
        },
${recyclingBlock}
${yardBlock}
      },
    }`;
  }).join(',\n\n');

  const centerBlock = data.recyclingCenter
    ? `
  recyclingCenter: {
    name: '${(data.recyclingCenter.name ?? `${town.name} Recycling Center`).replace(/'/g, "\\'")}',
    address: '${(data.recyclingCenter.address ?? '').replace(/'/g, "\\'")}',
    hours: {
      weekday: '${(data.recyclingCenter.weekdayHours ?? 'Call for hours').replace(/'/g, "\\'")}',${data.recyclingCenter.saturdayHours ? `
      saturday: '${data.recyclingCenter.saturdayHours.replace(/'/g, "\\'")}',` : ''}
    },${data.recyclingCenter.phone ? `
    phone: '${data.recyclingCenter.phone}',` : ''}
  },`
    : `
  // recyclingCenter: not found — add when data is available`;

  const instructionsBlock = data.specialInstructions.length > 0
    ? `\n  specialInstructions: [\n${data.specialInstructions.map(i => `    '${i.replace(/'/g, "\\'")}'`).join(',\n')}\n  ],`
    : '';

  return `import { Town, RecyclingRule } from '@/data/types';

// Source: ${sourceUrl}
// Scraped: ${today}
// Extraction method: ${data.method}
// Confidence: ${data.confidence}
// Notes: ${data.reason}
// Verified: false — TODO: cross-check against official ${town.name} DPW website before publishing

export const ${town.varName}: Town = {
  id: '${town.id}',
  name: '${town.name}',
  state: '${town.state}',
  county: '${town.county}',

  zones: [
${zonesCode}
  ],
${centerBlock}${instructionsBlock}
};

export const ${town.varName}Rules: RecyclingRule[] = [];
`;
}

// ─── Process one town ─────────────────────────────────────────────────────────

async function processTown(town: TownConfig): Promise<void> {
  const outputPath = path.join(
    APP_ROOT, 'data', 'locations', town.stateId, town.countyId, 'towns', `${town.fileName}.ts`
  );

  console.log(`\n── ${town.name} ──`);
  console.log(`  URL: ${town.dpwUrl}`);

  // Fetch HTML
  let html = '';
  try {
    html = await fetchHtml(town.dpwUrl);
    const $ = cheerio.load(html);
    const textLen = $('body').text().replace(/\s+/g, ' ').trim().length;
    console.log(`  Fetched (${textLen.toLocaleString()} chars of text)`);
  } catch (err) {
    console.error(`  ✗ Fetch failed: ${(err as Error).message}`);
  }

  // Run free extraction waterfall
  let result: ExtractionResult;
  if (html.length > 200) {
    result = await extractFree(html, town);
  } else {
    result = {
      ...EMPTY_RESULT,
      reason: 'Page could not be fetched — check URL in towns-to-scrape.json',
    };
  }

  const statusIcon = result.confidence === 'none' ? '⚠' : result.confidence === 'high' ? '✓' : '~';
  console.log(`  ${statusIcon} Method: ${result.method} | Confidence: ${result.confidence}`);
  console.log(`    ${result.reason}`);

  // Write output file
  const tsContent = generateTownFile(town, result, town.dpwUrl);
  fs.writeFileSync(outputPath, tsContent, 'utf-8');
  console.log(`  → Written: ${path.relative(process.cwd(), outputPath)}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const allFlag = args.includes('--all');
  const townArg = args[args.indexOf('--town') + 1];

  let targets: TownConfig[];

  if (allFlag) {
    targets = townsToScrape as TownConfig[];
    console.log(`Processing all ${targets.length} towns from towns-to-scrape.json (free methods only)`);
  } else if (townArg) {
    const match = (townsToScrape as TownConfig[]).find(
      t => t.fileName === townArg || t.varName === townArg || t.name.toLowerCase() === townArg.toLowerCase()
    );
    if (!match) {
      console.error(`Town "${townArg}" not found in towns-to-scrape.json`);
      console.log('Available:', (townsToScrape as TownConfig[]).map(t => t.fileName).join(', '));
      process.exit(1);
    }
    targets = [match];
  } else {
    console.log('Usage:');
    console.log('  npx ts-node scrape-town.ts --town hackensack');
    console.log('  npx ts-node scrape-town.ts --all');
    console.log('\nNo API key needed. For towns that need AI assistance:');
    console.log('  npx ts-node scrape-town-ai.ts --town hackensack');
    console.log('\nAvailable towns:');
    (townsToScrape as TownConfig[]).forEach(t => console.log(`  ${t.fileName} (${t.name})`));
    process.exit(0);
  }

  for (const town of targets) {
    await processTown(town);
    if (targets.length > 1) {
      await new Promise(r => setTimeout(r, 1500)); // polite delay between requests
    }
  }

  console.log('\n── Summary ──');
  console.log('✓ Done. Check generated files for "NEEDS MANUAL REVIEW" or low-confidence results.');
  console.log('  Once verified, add exports to data/locations/{state}/{county}/towns/index.ts');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
