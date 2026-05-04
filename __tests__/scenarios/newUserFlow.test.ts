import { searchItems } from '@/services/searchService';
import { clearLocation, getSavedLocation, saveLocation } from '@/services/storageService';

const TEANECK_LOCATION = {
    townId: 'nj-bergen-teaneck',
    displayName: 'Teaneck, NJ',
    town: { id: 'nj-bergen-teaneck' } as any,
    county: 'Bergen',
    state: 'New Jersey',
    stateCode: 'NJ',
};

describe('Scenario: new user sets up location and searches', () => {
    beforeAll(async () => { await clearLocation(); });
    afterAll(async () => { await clearLocation(); });

    it('Step 1 — no location saved on first launch', async () => {
        expect(await getSavedLocation()).toBeNull();
    });

    it('Step 2 — search works without a location (national rules)', () => {
        const results = searchItems('cardboard', null, 5);
        expect(results.length).toBeGreaterThan(0);
    });

    it('Step 3 — user saves a location', async () => {
        await saveLocation(TEANECK_LOCATION);
        const loc = await getSavedLocation();
        expect(loc?.townId).toBe('nj-bergen-teaneck');
        expect(loc?.displayName).toBe('Teaneck, NJ');
    });

    it('Step 4 — search still returns results after setup', async () => {
        const loc = await getSavedLocation();
        const results = searchItems('cardboard', loc, 5);
        expect(results.length).toBeGreaterThan(0);
    });

    it('Step 5 — clearing location resets to null', async () => {
        await clearLocation();
        expect(await getSavedLocation()).toBeNull();
    });
});
