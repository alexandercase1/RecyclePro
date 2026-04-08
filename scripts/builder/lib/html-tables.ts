import * as cheerio from 'cheerio';

export type HtmlTableScrapeOptions = {
  /** cheerio selector for each row (e.g. "table tbody tr") */
  rowSelector: string;
  /** 0-based column index for the street cell */
  columnIndex: number;
  /** Skip first N matching rows (e.g. header) */
  skipRows?: number;
};

/**
 * Pull plain text from a table column on each row. Good for saved municipality HTML pages.
 */
export function scrapeColumnText(
  html: string,
  options: HtmlTableScrapeOptions,
): string[] {
  const $ = cheerio.load(html);
  const { rowSelector, columnIndex, skipRows = 0 } = options;
  const rows: string[] = [];
  let seen = 0;

  $(rowSelector).each((_, el) => {
    if (seen++ < skipRows) return;
    const cells = $(el).find('th, td');
    const cell = cells.eq(columnIndex);
    const text = cell.text().trim().replace(/\s+/gu, ' ');
    if (text) rows.push(text);
  });

  return rows;
}

/**
 * When each row is a single cell or no table structure: collect direct text of matching elements.
 */
export function scrapeTextNodes(html: string, itemSelector: string): string[] {
  const $ = cheerio.load(html);
  const rows: string[] = [];
  $(itemSelector).each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/gu, ' ');
    if (text) rows.push(text);
  });
  return rows;
}
