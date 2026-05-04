# RecyclePro — Test Case Documentation

Structured test cases organized by methodology from CSIT 415, applied to RecyclePro's actual services and data.

---

## Running Tests

```bash
npx jest                                    # run all tests
npx jest --coverage                         # with coverage report
npx jest services/searchService             # single service
npx jest --watch                            # re-run on save
```

---

## Stage 1 — Unit Tests

Unit tests verify individual functions in isolation with no external dependencies (no Mapbox, no ONNX, no AsyncStorage).

### 1.1 `normalizeStreetName` — White Box / Statement Coverage

Tests every normalization branch: abbreviation expansion, case folding, punctuation stripping.

```ts
// __tests__/zoneMatchingService.test.ts
import { normalizeStreetName } from '../services/zoneMatchingService';

describe('normalizeStreetName', () => {
  it('expands "St" to "Street"', () => {
    expect(normalizeStreetName('Main St')).toBe('main street');
  });

  it('strips punctuation and lowercases', () => {
    expect(normalizeStreetName("St. John's Rd.")).toBe('saint johns road');
  });
});
```

### 1.2 `matchesAddressRanges` — Boundary Value Analysis 

The parity logic (even/odd) and range start/end are classic BVA targets.

| Input | Expected | Reason |
|-------|----------|--------|
| 2 in even range 2–100 | `true` | start boundary, correct parity |
| 102 in even range 2–100 | `false` | just past upper boundary |
| 51 in even range 2–100 | `false` | in range, wrong parity |

```ts
import { matchesAddressRanges } from '../services/zoneMatchingService';

const evenRange = { start: 2, end: 100, side: 'even' as const, street: 'elm street' };

describe('matchesAddressRanges — BVA', () => {
  it('accepts the start boundary (2)', () => {
    expect(matchesAddressRanges(2, 'elm street', [evenRange])).toBe(true);
  });

  it('rejects one above end boundary (102)', () => {
    expect(matchesAddressRanges(102, 'elm street', [evenRange])).toBe(false);
  });

  it('rejects odd number inside an even range', () => {
    expect(matchesAddressRanges(51, 'elm street', [evenRange])).toBe(false);
  });
});
```

### 1.3 `getWeekNumber` — Branch Coverage

`getWeekNumber` drives the even/odd recycling schedule. Branch coverage needs year start, mid-year, and year-end.

```ts
// __tests__/homeScreen.test.ts
import { getWeekNumber } from '../app/(tabs)/index';

describe('getWeekNumber', () => {
  it('returns week 1 for Jan 1', () => {
    expect(getWeekNumber(new Date('2025-01-01'))).toBe(1);
  });

  it('returns an even week number mid-year', () => {
    expect(getWeekNumber(new Date('2025-06-10')) % 2).toBe(0);
  });

  it('returns week 52 or 53 for Dec 31', () => {
    expect(getWeekNumber(new Date('2025-12-31'))).toBeGreaterThanOrEqual(52);
  });
});
```

---

## Stage 2 — Integration Tests

Integration tests verify two or more services working together. Use bottom-up: test leaf services first, then compose upward.

### 2.1 Search → Recyclability Pipeline

`searchItems` → `getApplicableRule` → disposal info should be consistent for known items.

```ts
// __tests__/integration/searchToDisposal.test.ts
import { searchItems, getItemByIdWithDisposal } from '../../services/searchService';

const NJ_LOCATION = {
  townId: 'nj-bergen-teaneck',
  displayName: 'Teaneck, NJ',
  town: { id: 'nj-bergen-teaneck' } as any,
  county: 'Bergen', state: 'New Jersey', stateCode: 'NJ',
};

describe('Search → Disposal integration', () => {
  it('newspaper search returns curbside_recycling', () => {
    const results = searchItems('newspaper', NJ_LOCATION, 5);
    const newspaper = results.find(r => r.item.id === 'item-newspaper');
    expect(newspaper?.disposalMethod).toBe('curbside_recycling');
  });

  it('pizza box is curbside_trash at national level', () => {
    const result = getItemByIdWithDisposal('item-pizza-box', null);
    expect(result?.disposalMethod).toBe('curbside_trash');
  });
});
```

### 2.2 Zone Matching → Schedule Display

`findMatchingZone` feeds directly into the Home screen schedule.

```ts
// __tests__/integration/zoneToSchedule.test.ts
import { findMatchingZone } from '../../services/zoneMatchingService';
import teaneckData from '../../data/locations/new-jersey/bergen/teaneck';

describe('Zone matching → schedule', () => {
  it('matches a known address to a zone with a schedule', () => {
    const zone = findMatchingZone('100 Cedar Lane', teaneckData.zones);
    expect(zone?.schedule.garbage).toBeDefined();
  });

  it('returns null for an address outside all zones', () => {
    expect(findMatchingZone('1 Fake Road', teaneckData.zones)).toBeNull();
  });
});
```

---

## Stage 3 — OO Partition & Scenario Tests

### 3.1 State-Based Partitioning — Location Saved vs. Not Saved

The app has two primary states: location configured and location absent. Key services must handle both correctly.

```ts
// __tests__/oo/statePartition.test.ts
import { getApplicableRule } from '../../services/recyclabilityService';

const NJ_LOC = {
  townId: 'nj-bergen-teaneck', displayName: 'Teaneck, NJ',
  town: { id: 'nj-bergen-teaneck' } as any,
  county: 'Bergen', state: 'New Jersey', stateCode: 'NJ',
};

describe('State partition: no location vs. location set', () => {
  it('returns national scope when location is null', () => {
    expect(getApplicableRule('item-newspaper', null)?.scope).toBe('national');
  });

  it('returns a more-local scope when location is set', () => {
    expect(getApplicableRule('item-newspaper', NJ_LOC)?.scope).not.toBe('national');
  });
});
```

### 3.2 Scenario-Based Test — New User Setup Flow

Simulates full onboarding: no location → save location → search with local rules.

```ts
// __tests__/scenarios/newUserFlow.test.ts
import { getSavedLocation, saveLocation, clearLocation } from '../../services/storageService';
import { searchItems } from '../../services/searchService';

describe('Scenario: new user sets up location and searches', () => {
  beforeAll(async () => { await clearLocation(); });
  afterAll(async () => { await clearLocation(); });

  it('Step 1 — no location on first launch', async () => {
    expect(await getSavedLocation()).toBeNull();
  });

  it('Step 2 — search works with no location (national rules)', () => {
    expect(searchItems('cardboard', null, 5).length).toBeGreaterThan(0);
  });

  it('Step 3 — user saves a location', async () => {
    await saveLocation({
      townId: 'nj-bergen-teaneck', displayName: 'Teaneck, NJ',
      town: { id: 'nj-bergen-teaneck' } as any,
      county: 'Bergen', state: 'New Jersey', stateCode: 'NJ',
    });
    expect((await getSavedLocation())?.townId).toBe('nj-bergen-teaneck');
  });

  it('Step 4 — search uses local rules after setup', async () => {
    const loc = await getSavedLocation();
    const results = searchItems('cardboard', loc, 5);
    expect(results[0].ruleSource).not.toBe('national');
  });
});
```

---

## Stage 4 — Regression Tests

Run after any change to catch must-never-break behaviors.

```bash
npx jest --testPathPattern="regression"
```

```ts
// __tests__/regression/criticalPaths.test.ts
import { getApplicableRule } from '../../services/recyclabilityService';
import { searchItems } from '../../services/searchService';

describe('Regression — critical item behaviors', () => {
  it('pizza box is always curbside_trash at national level', () => {
    expect(getApplicableRule('item-pizza-box', null)?.disposalMethod).toBe('curbside_trash');
  });

  it('newspaper is always curbside_recycling at national level', () => {
    expect(getApplicableRule('item-newspaper', null)?.disposalMethod).toBe('curbside_recycling');
  });

  it('searchItems never throws on an empty query', () => {
    expect(() => searchItems('', null, 10)).not.toThrow();
  });
});
```

---

## Stage 5 — System / Validation Checklist

Manual checks that cannot be automated with Jest.

| # | Test | Expected | Phase |
|---|------|----------|-------|
| SYS-01 | Cold launch with no saved location | "Set your location" prompt visible | Alpha |
| SYS-02 | Search "newspaper" → tap result | Item detail with disposal + instructions | Alpha |
| SYS-03 | Camera → scan plastic bottle | Plastic items listed in bottom sheet | Beta |
| SYS-04 | Camera → scan low-contrast image | "Couldn't Identify" state, no items shown | Beta |
| SYS-05 | Kill app → reopen | Location still saved, no re-setup needed | Alpha |

---

## Test File Layout

```
__tests__/
├── zoneMatchingService.test.ts     # Unit: normalizeStreetName, BVA ranges
├── homeScreen.test.ts              # Unit: getWeekNumber branch coverage
├── integration/
│   ├── searchToDisposal.test.ts    # search → recyclability pipeline
│   └── zoneToSchedule.test.ts      # zone match → schedule display
├── oo/
│   └── statePartition.test.ts      # OO state-based partitioning
├── scenarios/
│   └── newUserFlow.test.ts         # full onboarding scenario
└── regression/
    └── criticalPaths.test.ts       # must-never-break checks
```