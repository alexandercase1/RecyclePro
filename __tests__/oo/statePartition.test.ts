import { getItemDisposalInfo } from '@/services/recyclabilityService';
import { getPopularItems } from '@/services/searchService';
import { SavedLocation } from '@/services/storageService';
import { getAllItems } from '@/data/recyclables';

const NJ_LOC: SavedLocation = {
    townId: 'nj-bergen-teaneck',
    displayName: 'Teaneck, NJ',
    town: { id: 'nj-bergen-teaneck' } as any,
    county: 'Bergen',
    state: 'New Jersey',
    stateCode: 'NJ',
};

const newspaper = () => getAllItems().find(i => i.id === 'item-newspaper')!;
const pizzaBox  = () => getAllItems().find(i => i.id === 'item-pizza-box')!;

describe('State partition: no location vs. location set', () => {
    describe('No location (null) — falls back to item defaults', () => {
        it('newspaper disposal is curbside_recycling', () => {
            expect(getItemDisposalInfo(newspaper(), null).disposal).toBe('curbside_recycling');
        });

        it('pizza box disposal is curbside_trash', () => {
            expect(getItemDisposalInfo(pizzaBox(), null).disposal).toBe('curbside_trash');
        });

        it('getPopularItems returns results', () => {
            expect(getPopularItems(null, 5).length).toBeGreaterThan(0);
        });
    });

    describe('Location configured (NJ / Bergen / Teaneck)', () => {
        it('newspaper disposal is still defined with a location', () => {
            expect(getItemDisposalInfo(newspaper(), NJ_LOC).disposal).toBeDefined();
        });

        it('getPopularItems returns results with a location', () => {
            expect(getPopularItems(NJ_LOC, 5).length).toBeGreaterThan(0);
        });
    });
});
