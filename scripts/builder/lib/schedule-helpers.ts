const DAY_ALIASES: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

/**
 * Turn loose text like "Monday & Thursday" or "Mon/Thu" into weekday numbers (0–6).
 * Unknown tokens are skipped.
 */
export function parseWeekdaysFromText(text: string): number[] {
  const lower = text.toLowerCase();
  const tokens = lower.split(/[^a-z]+/u).filter(Boolean);
  const found = new Set<number>();
  for (const t of tokens) {
    const n = DAY_ALIASES[t];
    if (n !== undefined) found.add(n);
  }
  return [...found].sort((a, b) => a - b);
}
