/**
 * RecyclePro Town Data Scraper — AI-Assisted (One-Off)
 *
 * Use this only for specific towns where free scraping failed.
 * Requires ANTHROPIC_API_KEY in .env
 *
 * Cost: ~$0.005 per town (Claude Haiku)
 *
 * Usage:
 *   cp .env.example .env          # add your ANTHROPIC_API_KEY
 *   npx ts-node scrape-town-ai.ts --town hackensack
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Anthropic from '@anthropic-ai/sdk';
import townsToScrape from '../towns-to-scrape.json';

dotenv.config();

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

interface AiExtractedZone {
  name: string;
  description: string | null;
  garbageDays: number[];
  recyclingDay: number | null;
  recyclingAlternation: { even: string; odd: string };
  yardWasteDays: number[];
  yardWasteStart: string | null;
  yardWasteEnd: string | null;
}

interface AiExtractedData {
  zones: AiExtractedZone[];
  recyclingCenter: {
    name: string | null;
    address: string | null;
    phone: string | null;
    weekdayHours: string | null;
    saturdayHours: string | null;
    sundayHours: string | null;
  } | null;
  specialInstructions: string[];
  confidence: string;
  notes: string;
}

const APP_ROOT = path.resolve(__dirname, '../../RecyclePro');

async function fetchPageText(url: string): Promise<string> {
  const resp = await axios.get(url, {
    timeout: 15000,
    headers: { 'User-Agent': 'RecyclePro Data Collector (research/educational use)' },
  });
  const $ = cheerio.load(resp.data as string);
  $('nav, header, footer, script, style, .sidebar, .navigation').remove();
  return $('body').text().replace(/\s+/g, ' ').trim();
}

async function extractWithClaude(pageText: string, town: TownConfig): Promise<AiExtractedData> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Extract the garbage and recycling schedule from this DPW webpage for ${town.name}, ${town.state}.

Return ONLY valid JSON (no markdown) matching:
{
  "zones": [{
    "name": "zone/section name",
    "description": "description or null",
    "garbageDays": [1,4],
    "recyclingDay": 3,
    "recyclingAlternation": { "even": "commingled", "odd": "paper" },
    "yardWasteDays": [4],
    "yardWasteStart": "04-01",
    "yardWasteEnd": "10-31"
  }],
  "recyclingCenter": { "name": null, "address": null, "phone": null, "weekdayHours": null, "saturdayHours": null, "sundayHours": null },
  "specialInstructions": [],
  "confidence": "high|medium|low",
  "notes": "any caveats"
}

Days: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
RecyclingAlternation values: "commingled", "paper", or "none"
If no zones: create one zone named "All Areas".
Use null for unknown fields.

Page:
${pageText.slice(0, 12000)}`;

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = ((msg.content[0] as { type: string; text: string }).text)
    .replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();

  return JSON.parse(raw) as AiExtractedData;
}

function dayLabel(d: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d] ?? '?';
}

function generateFile(town: TownConfig, data: AiExtractedData, sourceUrl: string): string {
  const today = new Date().toISOString().slice(0, 10);

  const zonesCode = data.zones.map((zone, i) => `    {
      id: '${town.id}-zone-${i + 1}',
      name: '${zone.name.replace(/'/g, "\\'")}',
      description: '${(zone.description ?? zone.name).replace(/'/g, "\\'")}',
      streets: [], // TODO: populate with zone-to-street data
      schedule: {
        garbage: {
          days: [${zone.garbageDays.join(', ')}], // ${zone.garbageDays.map(d => dayLabel(d)).join(' & ')}
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: ${zone.recyclingDay ?? 0}, // ${zone.recyclingDay !== null ? dayLabel(zone.recyclingDay) : 'TODO: verify'}
          weeks: {
            even: '${zone.recyclingAlternation.even}',
            odd: '${zone.recyclingAlternation.odd}',
          },
          evenLabel: '${zone.recyclingAlternation.even === 'commingled' ? 'Commingled (Glass, Plastic, Metal, Cans)' : 'Newspaper & Cardboard'}',
          oddLabel: '${zone.recyclingAlternation.odd === 'paper' ? 'Newspaper & Cardboard' : 'Commingled (Glass, Plastic, Metal, Cans)'}',
        },${zone.yardWasteDays.length > 0 ? `
        yardWaste: {
          days: [${zone.yardWasteDays.join(', ')}],
          seasonStart: '${zone.yardWasteStart ?? '04-01'}',
          seasonEnd: '${zone.yardWasteEnd ?? '11-30'}',
        },` : ''}
      },
    }`).join(',\n\n');

  const centerBlock = data.recyclingCenter?.address
    ? `
  recyclingCenter: {
    name: '${(data.recyclingCenter.name ?? `${town.name} Recycling Center`).replace(/'/g, "\\'")}',
    address: '${data.recyclingCenter.address.replace(/'/g, "\\'")}',
    hours: {
      weekday: '${(data.recyclingCenter.weekdayHours ?? 'Call for hours').replace(/'/g, "\\'")}',${data.recyclingCenter.saturdayHours ? `
      saturday: '${data.recyclingCenter.saturdayHours.replace(/'/g, "\\'")}',` : ''}
    },${data.recyclingCenter.phone ? `
    phone: '${data.recyclingCenter.phone}',` : ''}
  },` : `\n  // recyclingCenter: not found`;

  const instructionsBlock = data.specialInstructions.length > 0
    ? `\n  specialInstructions: [\n${data.specialInstructions.map(i => `    '${i.replace(/'/g, "\\'")}'`).join(',\n')}\n  ],`
    : '';

  return `import { Town, RecyclingRule } from '@/data/types';

// Source: ${sourceUrl}
// Scraped: ${today}
// Extraction method: ai (claude-haiku-4-5)
// Confidence: ${data.confidence}
// Notes: ${data.notes}
// AI-GENERATED — verify all data against official ${town.name} DPW website before publishing

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

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY not set in .env');
    console.error('Copy .env.example to .env and add your key.');
    process.exit(1);
  }

  const townArg = process.argv[process.argv.indexOf('--town') + 1];
  if (!townArg) {
    console.log('Usage: npx ts-node scrape-town-ai.ts --town hackensack');
    process.exit(0);
  }

  const town = (townsToScrape as TownConfig[]).find(
    t => t.fileName === townArg || t.varName === townArg || t.name.toLowerCase() === townArg.toLowerCase()
  );
  if (!town) {
    console.error(`Town "${townArg}" not found in towns-to-scrape.json`);
    process.exit(1);
  }

  console.log(`AI scraping: ${town.name}`);
  console.log(`URL: ${town.dpwUrl}`);

  const pageText = await fetchPageText(town.dpwUrl);
  console.log(`Fetched ${pageText.length.toLocaleString()} chars — sending to Claude Haiku...`);

  const data = await extractWithClaude(pageText, town);
  console.log(`✓ Extracted ${data.zones.length} zone(s) [confidence: ${data.confidence}]`);

  const outputPath = path.join(
    APP_ROOT, 'data', 'locations', town.stateId, town.countyId, 'towns', `${town.fileName}.ts`
  );

  fs.writeFileSync(outputPath, generateFile(town, data, town.dpwUrl), 'utf-8');
  console.log(`✓ Written: ${path.relative(process.cwd(), outputPath)}`);
  console.log('\nRemember to verify the output against the official DPW website before adding it to the barrel index.');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
