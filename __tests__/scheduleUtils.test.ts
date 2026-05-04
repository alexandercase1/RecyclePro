import { getWeekNumber, isInSeason } from '@/utils/scheduleUtils';

// Use new Date(year, month, day) — not ISO strings — to avoid UTC-vs-local
// timezone mismatch. ISO strings like '2025-01-01' parse as UTC midnight,
// which rolls back to Dec 31 in negative-offset (US) time zones.

describe('getWeekNumber — branch coverage', () => {
    it('returns 1 for Jan 1', () => {
        expect(getWeekNumber(new Date(2025, 0, 1))).toBe(1);
    });

    it('returns 2 for Jan 7', () => {
        expect(getWeekNumber(new Date(2025, 0, 7))).toBe(2);
    });

    it('returns an even week mid-year (commingled week)', () => {
        expect(getWeekNumber(new Date(2025, 5, 10)) % 2).toBe(0);
    });

    it('returns 52 or 53 for Dec 31', () => {
        expect(getWeekNumber(new Date(2025, 11, 31))).toBeGreaterThanOrEqual(52);
    });
});

describe('isInSeason — equivalence partitioning', () => {
    const START = '04-01';
    const END = '11-30';

    it('returns true inside the season window', () => {
        expect(isInSeason(new Date(2025, 4, 15), START, END)).toBe(true); // May 15
    });

    it('returns true on the start boundary date', () => {
        expect(isInSeason(new Date(2025, 3, 1), START, END)).toBe(true); // Apr 1
    });

    it('returns true on the end boundary date', () => {
        expect(isInSeason(new Date(2025, 10, 30), START, END)).toBe(true); // Nov 30
    });

    it('returns false before season start', () => {
        expect(isInSeason(new Date(2025, 2, 1), START, END)).toBe(false); // Mar 1
    });

    it('returns false after season end', () => {
        expect(isInSeason(new Date(2025, 11, 15), START, END)).toBe(false); // Dec 15
    });
});
