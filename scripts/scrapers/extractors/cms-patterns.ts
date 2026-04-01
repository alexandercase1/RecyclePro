/**
 * CMS-specific pattern extractors
 *
 * Many NJ municipalities use the same government CMS platforms.
 * We can detect the platform from HTML signatures and apply targeted extractors
 * that work across all towns using that CMS.
 *
 * Supported:
 *   - CivicPlus / CivicEngage  (largest US gov CMS — covers hundreds of NJ towns)
 *   - Vision Internet           (common mid-size municipalities)
 *   - Granicus                  (larger cities)
 */

import * as cheerio from 'cheerio';
import { ExtractionResult, EMPTY_RESULT } from './types';
import { parseScheduleText } from './generic';

// ─── CMS Detection ────────────────────────────────────────────────────────────

export type CmsPlatform = 'civicplus' | 'vision-internet' | 'granicus' | 'unknown';

export function detectCms(html: string): CmsPlatform {
  if (
    html.includes('civicplus.com') ||
    html.includes('CivicPlus') ||
    html.includes('civicengage') ||
    html.includes('CivicEngage')
  ) {
    return 'civicplus';
  }
  if (
    html.includes('visioninternet.com') ||
    html.includes('Vision Internet') ||
    html.includes('vi-chat')
  ) {
    return 'vision-internet';
  }
  if (
    html.includes('granicus.com') ||
    html.includes('Granicus') ||
    html.includes('govDelivery')
  ) {
    return 'granicus';
  }
  return 'unknown';
}

// ─── CivicPlus Extractor ──────────────────────────────────────────────────────

/**
 * CivicPlus pages typically put DPW schedule content inside:
 *   <div class="fr-view"> ... </div>      (WYSIWYG content area)
 *   <div id="content"> ... </div>
 *   <article class="page-content"> ... </article>
 *
 * Schedule information is usually in plain text paragraphs or simple HTML tables.
 */
export function extractCivicPlus(html: string): ExtractionResult {
  const $ = cheerio.load(html);

  // Target the main content area — CivicPlus-specific selectors
  const contentSelectors = [
    '.fr-view',
    '#content .field-items',
    '.page-content',
    '.civicplus-content',
    'article',
    'main',
    '#mainContent',
  ];

  let text = '';
  for (const sel of contentSelectors) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 100) {
      text = el.text();
      break;
    }
  }

  if (!text) return { ...EMPTY_RESULT, reason: 'CivicPlus: no content area found' };

  const result = parseScheduleText(text);
  if (result.zones.length > 0) {
    return { ...result, method: 'civicplus-pattern' };
  }

  return { ...EMPTY_RESULT, reason: 'CivicPlus: content found but no schedule data extracted' };
}

// ─── Vision Internet Extractor ────────────────────────────────────────────────

/**
 * Vision Internet pages typically use:
 *   <div class="vi-content"> ... </div>
 *   <div class="pageContent"> ... </div>
 */
export function extractVisionInternet(html: string): ExtractionResult {
  const $ = cheerio.load(html);

  const contentSelectors = [
    '.vi-content',
    '.pageContent',
    '#pageContent',
    '.interior-content',
    'main',
  ];

  let text = '';
  for (const sel of contentSelectors) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 100) {
      text = el.text();
      break;
    }
  }

  if (!text) return { ...EMPTY_RESULT, reason: 'Vision Internet: no content area found' };

  const result = parseScheduleText(text);
  if (result.zones.length > 0) {
    return { ...result, method: 'vision-internet-pattern' };
  }

  return { ...EMPTY_RESULT, reason: 'Vision Internet: content found but no schedule data extracted' };
}

// ─── Granicus Extractor ───────────────────────────────────────────────────────

/**
 * Granicus / OpenGov pages typically use:
 *   <div class="field-item even"> ... </div>
 *   <div class="node__content"> ... </div>
 */
export function extractGranicus(html: string): ExtractionResult {
  const $ = cheerio.load(html);

  const contentSelectors = [
    '.field-item.even',
    '.node__content',
    '.view-content',
    '.page-content',
    'main .content',
  ];

  let text = '';
  for (const sel of contentSelectors) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 100) {
      text = el.text();
      break;
    }
  }

  if (!text) return { ...EMPTY_RESULT, reason: 'Granicus: no content area found' };

  const result = parseScheduleText(text);
  if (result.zones.length > 0) {
    return { ...result, method: 'granicus-pattern' };
  }

  return { ...EMPTY_RESULT, reason: 'Granicus: content found but no schedule data extracted' };
}

// ─── Router ───────────────────────────────────────────────────────────────────

export function extractByCmsPattern(html: string, platform: CmsPlatform): ExtractionResult {
  switch (platform) {
    case 'civicplus':       return extractCivicPlus(html);
    case 'vision-internet': return extractVisionInternet(html);
    case 'granicus':        return extractGranicus(html);
    default:
      return { ...EMPTY_RESULT, reason: 'Unknown CMS — skipping CMS pattern extraction' };
  }
}
