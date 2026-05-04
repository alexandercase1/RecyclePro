import { CollectionZone } from '@/data/types';
import { findMatchingZone } from '@/services/zoneMatchingService';

// A self-contained mock zone so this test doesn't depend on specific street data
// being present in any particular town file.
const mockZone: CollectionZone = {
    id: 'zone-test',
    name: 'Test Zone',
    streets: [{ name: 'Elm Street' }],
    addressRanges: [{ street: 'Oak Avenue', fromNumber: 1, toNumber: 200 }],
    schedule: {
        garbage: { days: [1] },
        recycling: { day: 3, weeks: { even: 'commingled', odd: 'paper' } },
    },
} as unknown as CollectionZone;

describe('Zone matching → schedule integration', () => {
    it('matches an address on a listed street', () => {
        const zone = findMatchingZone('42 Elm Street', [mockZone]);
        expect(zone).not.toBeNull();
        expect(zone!.schedule.garbage).toBeDefined();
        expect(zone!.schedule.recycling).toBeDefined();
    });

    it('matches an address within a listed address range', () => {
        const zone = findMatchingZone('100 Oak Avenue', [mockZone]);
        expect(zone).not.toBeNull();
    });

    it('returns null for an address on an unlisted street', () => {
        expect(findMatchingZone('1 Fake Road', [mockZone])).toBeNull();
    });

    it('returns null when the zone list is empty', () => {
        expect(findMatchingZone('42 Elm Street', [])).toBeNull();
    });
});
