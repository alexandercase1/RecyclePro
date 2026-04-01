import type { Street } from '@/data/types';

/**
 * Parse one line from a municipal street list into a Street object.
 *
 * Supported patterns (case-insensitive):
 * - "Main Street"
 * - "Main St 12-34"
 * - "Main St 12 - 34"
 * - "Main St: 100-200" (colon optional noise)
 */
export function parseStreetLine(line: string): Street | null {
  const raw = line.trim();
  if (!raw || raw.startsWith('//')) return null;

  const normalized = raw.replace(/\s+/g, ' ');
  const rangeMatch = normalized.match(
    /^(.+?)[\s:,-]+(\d+)\s*[-–—]\s*(\d+)\s*$/u,
  );
  if (rangeMatch) {
    const name = rangeMatch[1].replace(/[,:]$/u, '').trim();
    const rangeStart = Number(rangeMatch[2]);
    const rangeEnd = Number(rangeMatch[3]);
    if (!name) return null;
    return { name, rangeStart, rangeEnd };
  }

  return { name: normalized };
}

export function parseStreetLines(lines: string[]): Street[] {
  const out: Street[] = [];
  for (const line of lines) {
    const s = parseStreetLine(line);
    if (s) out.push(s);
  }
  return out;
}
