import { SavedLocation } from '@/services/storageService';
import { getItemByIdWithDisposal, searchItems } from '@/services/searchService';

const NJ_LOCATION: SavedLocation = {
    townId: 'nj-bergen-teaneck',
    displayName: 'Teaneck, NJ',
    town: { id: 'nj-bergen-teaneck' } as any,
    county: 'Bergen',
    state: 'New Jersey',
    stateCode: 'NJ',
};

describe('Search → Disposal integration', () => {
    it('newspaper search returns a curbside_recycling result', () => {
        const results = searchItems('newspaper', NJ_LOCATION, 5);
        expect(results.length).toBeGreaterThan(0);
        const newspaper = results.find(r => r.item.id === 'item-newspaper');
        expect(newspaper?.disposal).toBe('curbside_recycling');
    });

    it('pizza box disposal falls back to curbside_trash (item default)', () => {
        const result = getItemByIdWithDisposal('item-pizza-box', null);
        expect(result).not.toBeNull();
        expect(result!.disposal).toBe('curbside_trash');
    });

    it('cardboard box is recyclable', () => {
        const result = getItemByIdWithDisposal('item-cardboard-box', null);
        expect(result?.disposal).toBe('curbside_recycling');
    });

    it('returns null for an unknown item id', () => {
        expect(getItemByIdWithDisposal('item-does-not-exist', null)).toBeNull();
    });
});
