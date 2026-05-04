import { CollectionZone } from '@/data/types';
import {
    matchesAddressRanges,
    normalizeStreetName,
    parseAddress,
} from '@/services/zoneMatchingService';

describe('normalizeStreetName — white box / statement coverage', () => {
    it('strips street type suffix and lowercases', () => {
        expect(normalizeStreetName('Elm Street')).toBe('elm');
    });

    it('strips abbreviated suffix', () => {
        expect(normalizeStreetName('Oak Ave')).toBe('oak');
    });

    it('strips multiple words down to base name', () => {
        expect(normalizeStreetName('Cedar Lane')).toBe('cedar');
    });
});

describe('parseAddress — equivalence partitioning', () => {
    it('parses a standard house number + street', () => {
        const result = parseAddress('42 Elm Street');
        expect(result.number).toBe(42);
        expect(result.street).toBe('elm');
    });

    it('handles address with no house number', () => {
        const result = parseAddress('Elm Street');
        expect(result.number).toBeNull();
        expect(result.street).toBe('elm');
    });

    it('returns empty street for empty string', () => {
        const result = parseAddress('');
        expect(result.street).toBe('');
    });
});

describe('matchesAddressRanges — boundary value analysis', () => {
    // street 'Elm Street' normalizes to 'elm' inside the function,
    // so parsedAddress.street must also be 'elm' to match
    const zone = {
        addressRanges: [
            { street: 'Elm Street', fromNumber: 2, toNumber: 100, parity: 'even' },
        ],
    } as unknown as CollectionZone;

    it('accepts the start boundary (2, even)', () => {
        expect(matchesAddressRanges({ number: 2, street: 'elm' }, zone)).toBe(true);
    });

    it('accepts a mid-range even number (50)', () => {
        expect(matchesAddressRanges({ number: 50, street: 'elm' }, zone)).toBe(true);
    });

    it('rejects one above the end boundary (102)', () => {
        expect(matchesAddressRanges({ number: 102, street: 'elm' }, zone)).toBe(false);
    });

    it('rejects an odd number inside an even range (51)', () => {
        expect(matchesAddressRanges({ number: 51, street: 'elm' }, zone)).toBe(false);
    });

    it('rejects a matching number on the wrong street', () => {
        expect(matchesAddressRanges({ number: 50, street: 'oak' }, zone)).toBe(false);
    });

    it('returns false when zone has no addressRanges', () => {
        const emptyZone = { addressRanges: [] } as unknown as CollectionZone;
        expect(matchesAddressRanges({ number: 50, street: 'elm' }, emptyZone)).toBe(false);
    });
});
