/**
 * iCalendar (.ics) extractor
 *
 * Many town DPW sites publish downloadable collection calendars as .ics files.
 * These are fully structured and machine-readable — the best free data source.
 *
 * Strategy:
 *   1. Scan the fetched DPW page HTML for .ics file links
 *   2. Fetch the .ics file
 *   3. Parse VEVENT records to extract garbage/recycling patterns
 */

import * as cheerio from 'cheerio';
import axios from 'axios';
import { ExtractionResult, ExtractedZone, EMPTY_RESULT } from './types';

// Day names used in iCal BYDAY rules
const DAY_MAP: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
};

// Keywords identifying event types in SUMMARY fields
const GARBAGE_KEYWORDS = /garbage|trash|refuse|rubbish|solid waste/i;
const RECYCLING_KEYWORDS = /recycl/i;
const COMMINGLED_KEYWORDS = /commingled|bottles|cans|glass|plastic|metal/i;
const PAPER_KEYWORDS = /paper|cardboard|newspaper/i;
const YARD_WASTE_KEYWORDS = /yard waste|leaves|brush|vegetation/i;

interface ICalEvent {
  summary: string;
  dtstart: string;
  rrule?: string;
  description?: string;
}

function parseIcal(icsText: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const blocks = icsText.split('BEGIN:VEVENT');

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const get = (key: string): string => {
      const match = block.match(new RegExp(`${key}[;:][^\r\n]+`, 'i'));
      if (!match) return '';
      // Handle folded lines (lines starting with space/tab continue the previous)
      return match[0].replace(new RegExp(`^${key}[;:][^:]*:?`, 'i'), '').trim();
    };

    events.push({
      summary: get('SUMMARY'),
      dtstart: get('DTSTART'),
      rrule: get('RRULE') || undefined,
      description: get('DESCRIPTION') || undefined,
    });
  }

  return events;
}

function dayFromDtstart(dtstart: string): number | null {
  // DTSTART:20260104 or DTSTART;TZID=...:20260104T060000
  const dateStr = dtstart.replace(/.*:/, '').slice(0, 8);
  if (dateStr.length < 8) return null;
  const date = new Date(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`);
  return isNaN(date.getTime()) ? null : date.getDay();
}

function daysFromRrule(rrule: string | undefined, dtstart: string): number[] {
  if (rrule) {
    const byday = rrule.match(/BYDAY=([^;]+)/i);
    if (byday) {
      return byday[1].split(',').map(d => DAY_MAP[d.replace(/[+-]\d+/g, '').trim()]).filter(d => d !== undefined);
    }
  }
  const day = dayFromDtstart(dtstart);
  return day !== null ? [day] : [];
}

export async function findIcalLink(html: string, baseUrl: string): Promise<string | null> {
  const $ = cheerio.load(html);
  let icsUrl: string | null = null;

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (href.endsWith('.ics') || href.includes('ical') || href.includes('calendar')) {
      icsUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
      return false; // break
    }
  });

  return icsUrl;
}

export async function extractFromIcal(icsUrl: string): Promise<ExtractionResult> {
  let icsText: string;
  try {
    const resp = await axios.get(icsUrl, {
      timeout: 10000,
      headers: { 'User-Agent': 'RecyclePro Data Collector' },
    });
    icsText = resp.data as string;
  } catch {
    return { ...EMPTY_RESULT, reason: `Could not fetch iCal file: ${icsUrl}` };
  }

  if (!icsText.includes('BEGIN:VCALENDAR')) {
    return { ...EMPTY_RESULT, reason: 'URL did not return a valid iCal file' };
  }

  const events = parseIcal(icsText);
  if (events.length === 0) {
    return { ...EMPTY_RESULT, reason: 'iCal file contained no events' };
  }

  // Group events by type and collect pickup days
  const garbageDaySet = new Set<number>();
  const recyclingDaySet = new Set<number>();
  const commingledDaySet = new Set<number>();
  const paperDaySet = new Set<number>();
  const yardWasteDaySet = new Set<number>();
  let yardWasteStart: string | null = null;
  let yardWasteEnd: string | null = null;

  for (const event of events) {
    const summary = event.summary;
    const days = daysFromRrule(event.rrule, event.dtstart);

    if (GARBAGE_KEYWORDS.test(summary)) {
      days.forEach(d => garbageDaySet.add(d));
    }
    if (RECYCLING_KEYWORDS.test(summary)) {
      days.forEach(d => recyclingDaySet.add(d));
      if (COMMINGLED_KEYWORDS.test(summary)) days.forEach(d => commingledDaySet.add(d));
      if (PAPER_KEYWORDS.test(summary)) days.forEach(d => paperDaySet.add(d));
    }
    if (YARD_WASTE_KEYWORDS.test(summary)) {
      days.forEach(d => yardWasteDaySet.add(d));
      // Try to infer season from event dates (rough heuristic)
      const dateStr = event.dtstart.replace(/.*:/, '').slice(0, 8);
      if (dateStr.length === 8) {
        const mmdd = `${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        if (!yardWasteStart || mmdd < yardWasteStart) yardWasteStart = mmdd;
        if (!yardWasteEnd || mmdd > yardWasteEnd) yardWasteEnd = mmdd;
      }
    }
  }

  const garbageDays = [...garbageDaySet].sort();
  const recyclingDays = [...recyclingDaySet].sort();

  if (garbageDays.length === 0 && recyclingDays.length === 0) {
    return { ...EMPTY_RESULT, reason: 'iCal events found but could not map to garbage/recycling days' };
  }

  // Determine recycling alternation
  const hasCommingled = commingledDaySet.size > 0;
  const hasPaper = paperDaySet.size > 0;
  const alternation = {
    even: (hasCommingled ? 'commingled' : hasPaper ? 'paper' : 'commingled') as 'commingled' | 'paper' | 'none',
    odd: (hasPaper ? 'paper' : hasCommingled ? 'commingled' : 'paper') as 'commingled' | 'paper' | 'none',
  };

  const zone: ExtractedZone = {
    name: 'All Areas',
    description: 'Town-wide schedule (extracted from iCal)',
    garbageDays,
    recyclingDay: recyclingDays[0] ?? null,
    recyclingAlternation: alternation,
    yardWasteDays: [...yardWasteDaySet].sort(),
    yardWasteStart,
    yardWasteEnd,
  };

  return {
    zones: [zone],
    recyclingCenter: null,
    specialInstructions: [],
    method: 'ical',
    confidence: garbageDays.length > 0 && recyclingDays.length > 0 ? 'high' : 'medium',
    reason: `iCal: ${events.length} events parsed. Garbage days: ${garbageDays.join(',')}. Recycling days: ${recyclingDays.join(',')}.`,
  };
}
