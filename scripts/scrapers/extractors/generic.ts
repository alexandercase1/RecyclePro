/**
 * Generic cheerio extractor
 *
 * Uses keyword matching and regex patterns to extract schedule data from
 * any DPW page, regardless of CMS. Lower confidence than CMS-specific extractors
 * but works as a broad fallback.
 *
 * Approach:
 *   - Search for day-of-week patterns near collection keywords
 *   - Identify zones/sections from numbered headers or labeled blocks
 *   - Extract recycling center address and phone from contact patterns
 */

import * as cheerio from 'cheerio';
import { ExtractionResult, ExtractedZone, ExtractedRecyclingCenter, EMPTY_RESULT } from './types';

// ─── Day mapping ──────────────────────────────────────────────────────────────

const DAY_PATTERNS: [RegExp, number][] = [
  [/\bsunday\b/i, 0],
  [/\bmonday\b/i, 1],
  [/\btuesday\b/i, 2],
  [/\bwednesday\b/i, 3],
  [/\bthursday\b/i, 4],
  [/\bfriday\b/i, 5],
  [/\bsaturday\b/i, 6],
  [/\bsun\b/i, 0],
  [/\bmon\b/i, 1],
  [/\btues?\b/i, 2],
  [/\bwed\b/i, 3],
  [/\bthurs?\b/i, 4],
  [/\bfri\b/i, 5],
  [/\bsat\b/i, 6],
];

export function extractDays(text: string): number[] {
  const days = new Set<number>();
  for (const [pattern, day] of DAY_PATTERNS) {
    if (pattern.test(text)) days.add(day);
  }
  return [...days].sort();
}

// ─── Keywords ─────────────────────────────────────────────────────────────────

const GARBAGE_KW = /garbage|trash|refuse|solid\s*waste|rubbish/i;
const RECYCLING_KW = /recycl/i;
const COMMINGLED_KW = /commingled|bottles?\s*[&and]+\s*cans?|glass|plastic.*metal|curbside.*recycle/i;
const PAPER_KW = /paper\s*(&|and)\s*cardboard|newspaper|cardboard/i;
const YARD_WASTE_KW = /yard\s*waste|leaves|brush|vegetation|organic/i;
const SECTION_KW = /section\s*\d+|zone\s*\d+|district\s*\d+|area\s*[a-z\d]/i;
const CENTER_KW = /recycling\s*center|drop[- ]off|transfer\s*station/i;
const PHONE_PATTERN = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;
const ADDRESS_PATTERN = /\d+[-\s]\w+.{5,40}(?:street|st|avenue|ave|road|rd|drive|dr|blvd|lane|ln)/i;

// ─── Sentence-level extraction ────────────────────────────────────────────────

/**
 * Split text into sentences/clauses and find those containing
 * both a collection keyword and a day reference.
 */
function findScheduleSentences(text: string): {
  garbageSentences: string[];
  recyclingSentences: string[];
  yardWasteSentences: string[];
} {
  // Split on newlines and periods (basic sentence boundaries)
  const sentences = text.split(/[\n.;]+/).map(s => s.trim()).filter(s => s.length > 10);

  return {
    garbageSentences: sentences.filter(s => GARBAGE_KW.test(s) && DAY_PATTERNS.some(([p]) => p.test(s))),
    recyclingSentences: sentences.filter(s => RECYCLING_KW.test(s) && DAY_PATTERNS.some(([p]) => p.test(s))),
    yardWasteSentences: sentences.filter(s => YARD_WASTE_KW.test(s) && DAY_PATTERNS.some(([p]) => p.test(s))),
  };
}

// ─── Section/Zone detection ───────────────────────────────────────────────────

interface TextBlock {
  heading: string;
  body: string;
}

function extractSectionBlocks($: ReturnType<typeof cheerio.load>): TextBlock[] {
  const blocks: TextBlock[] = [];

  // Look for numbered headings (h2, h3, h4, strong, b) that match section patterns
  $('h2, h3, h4, strong, b, th, .section-title').each((_, el) => {
    const headingText = $(el).text().trim();
    if (SECTION_KW.test(headingText)) {
      // Grab the next sibling content
      const body = $(el).nextAll().slice(0, 3).text();
      if (body.length > 20) {
        blocks.push({ heading: headingText, body });
      }
    }
  });

  return blocks;
}

// ─── Recycling center extraction ──────────────────────────────────────────────

function extractRecyclingCenter(text: string): ExtractedRecyclingCenter | null {
  if (!CENTER_KW.test(text)) return null;

  const phoneMatch = text.match(PHONE_PATTERN);
  const addressMatch = text.match(ADDRESS_PATTERN);

  // Try to get hours from text around "recycling center"
  const centerIdx = text.search(CENTER_KW);
  const vicinity = text.slice(Math.max(0, centerIdx - 100), centerIdx + 500);
  const hoursMatch = vicinity.match(/(\d{1,2}(?::\d{2})?\s*[ap]m\s*[-–]\s*\d{1,2}(?::\d{2})?\s*[ap]m)/gi);

  return {
    name: null, // Hard to extract reliably — leave for manual fill
    address: addressMatch ? addressMatch[0].trim() : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    weekdayHours: hoursMatch ? hoursMatch[0] : null,
    saturdayHours: hoursMatch && hoursMatch.length > 1 ? hoursMatch[1] : null,
    sundayHours: null,
  };
}

// ─── Special instructions extraction ─────────────────────────────────────────

const INSTRUCTION_KW = /must be at curb|no plastic bags?|maximum|weight limit|set.?out|remove.*container|pm.*day before|before.*collection/i;

function extractInstructions(text: string): string[] {
  const sentences = text.split(/[\n.]+/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 200);
  return sentences.filter(s => INSTRUCTION_KW.test(s)).slice(0, 8);
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Attempt to parse schedule data from raw page text.
 * Used by both CMS-specific extractors and the generic fallback.
 */
export function parseScheduleText(text: string): ExtractionResult {
  const { garbageSentences, recyclingSentences, yardWasteSentences } = findScheduleSentences(text);

  const garbageDays = extractDays(garbageSentences.join(' '));
  const recyclingDays = extractDays(recyclingSentences.join(' '));
  const yardWasteDays = extractDays(yardWasteSentences.join(' '));

  const hasCommingled = COMMINGLED_KW.test(recyclingSentences.join(' '));
  const hasPaper = PAPER_KW.test(recyclingSentences.join(' '));

  if (garbageDays.length === 0 && recyclingDays.length === 0) {
    return { ...EMPTY_RESULT, reason: 'No garbage or recycling days found in text' };
  }

  const zone: ExtractedZone = {
    name: 'All Areas',
    description: 'Town-wide schedule (extracted via text parsing)',
    garbageDays,
    recyclingDay: recyclingDays[0] ?? null,
    recyclingAlternation: {
      even: hasCommingled ? 'commingled' : 'commingled',
      odd: hasPaper ? 'paper' : 'paper',
    },
    yardWasteDays,
    yardWasteStart: YARD_WASTE_KW.test(text) ? '04-01' : null,
    yardWasteEnd: YARD_WASTE_KW.test(text) ? '11-30' : null,
  };

  const recyclingCenter = extractRecyclingCenter(text);
  const specialInstructions = extractInstructions(text);

  const confidence =
    garbageDays.length > 0 && recyclingDays.length > 0 ? 'medium' : 'low';

  return {
    zones: [zone],
    recyclingCenter,
    specialInstructions,
    method: 'generic-cheerio',
    confidence,
    reason: `Generic: garbage days [${garbageDays}], recycling days [${recyclingDays}]${hasCommingled || hasPaper ? ', alternation detected' : ''}`,
  };
}

/**
 * Full generic extractor — fetches main content with cheerio,
 * then checks for multi-section structure before falling back to plain text parse.
 */
export function extractGeneric(html: string): ExtractionResult {
  const $ = cheerio.load(html);

  // Remove noise
  $('nav, header, footer, script, style, .sidebar, .navigation, .breadcrumb').remove();

  // Check for section/zone blocks first
  const sectionBlocks = extractSectionBlocks($);

  if (sectionBlocks.length >= 2) {
    // Multiple sections found — try to build a zone per section
    const zones: ExtractedZone[] = [];

    for (const block of sectionBlocks) {
      const combined = `${block.heading} ${block.body}`;
      const garbageDays = extractDays(combined.match(new RegExp(`${GARBAGE_KW.source}.{0,100}`, 'i'))?.[0] ?? combined);
      const recyclingDays = extractDays(combined.match(new RegExp(`${RECYCLING_KW.source}.{0,100}`, 'i'))?.[0] ?? '');

      if (garbageDays.length > 0 || recyclingDays.length > 0) {
        zones.push({
          name: block.heading,
          garbageDays,
          recyclingDay: recyclingDays[0] ?? null,
          recyclingAlternation: { even: 'commingled', odd: 'paper' },
          yardWasteDays: [],
          yardWasteStart: null,
          yardWasteEnd: null,
        });
      }
    }

    if (zones.length > 0) {
      return {
        zones,
        recyclingCenter: extractRecyclingCenter($('body').text()),
        specialInstructions: extractInstructions($('body').text()),
        method: 'generic-cheerio',
        confidence: 'medium',
        reason: `Generic: found ${zones.length} section block(s)`,
      };
    }
  }

  // Fall back to full-page text parse
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  return parseScheduleText(bodyText);
}
