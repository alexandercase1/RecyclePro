/**
 * Shared types for all extractor modules.
 */

export interface ExtractedZone {
  name: string;
  description?: string;
  garbageDays: number[];       // 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  recyclingDay: number | null;
  recyclingAlternation: {
    even: 'commingled' | 'paper' | 'none';
    odd: 'commingled' | 'paper' | 'none';
  };
  yardWasteDays: number[];
  yardWasteStart: string | null;  // MM-DD
  yardWasteEnd: string | null;    // MM-DD
}

export interface ExtractedRecyclingCenter {
  name: string | null;
  address: string | null;
  phone: string | null;
  weekdayHours: string | null;
  saturdayHours: string | null;
  sundayHours: string | null;
}

export type ExtractionMethod =
  | 'ical'
  | 'civicplus-pattern'
  | 'vision-internet-pattern'
  | 'granicus-pattern'
  | 'generic-cheerio'
  | 'needs-manual-review';

export type Confidence = 'high' | 'medium' | 'low' | 'none';

export interface ExtractionResult {
  zones: ExtractedZone[];
  recyclingCenter: ExtractedRecyclingCenter | null;
  specialInstructions: string[];
  method: ExtractionMethod;
  confidence: Confidence;
  reason: string;  // Human-readable note about what was found or why it failed
}

export const EMPTY_RESULT: ExtractionResult = {
  zones: [],
  recyclingCenter: null,
  specialInstructions: [],
  method: 'needs-manual-review',
  confidence: 'none',
  reason: 'No data extracted',
};
