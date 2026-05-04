import { getItemByIdWithDisposal, searchItems } from '@/services/searchService';

describe('Regression — must-never-break behaviors', () => {
    it('pizza box is always curbside_trash', () => {
        expect(getItemByIdWithDisposal('item-pizza-box', null)?.disposal).toBe('curbside_trash');
    });

    it('newspaper is always curbside_recycling', () => {
        expect(getItemByIdWithDisposal('item-newspaper', null)?.disposal).toBe('curbside_recycling');
    });

    it('cardboard box is always curbside_recycling', () => {
        expect(getItemByIdWithDisposal('item-cardboard-box', null)?.disposal).toBe('curbside_recycling');
    });

    it('searchItems never throws on an empty query', () => {
        expect(() => searchItems('', null, 10)).not.toThrow();
    });

    it('searchItems returns no results for a single character', () => {
        expect(searchItems('p', null, 10)).toHaveLength(0);
    });

    it('CLASS_LABELS has exactly 8 entries', () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { CLASS_LABELS } = require('../../services/model');
        expect(CLASS_LABELS).toHaveLength(8);
    });
});
