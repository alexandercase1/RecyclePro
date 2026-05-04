# RecyclePro — Test Case Documentation

Structured test cases organized by methodology from CSIT 415, applied to RecyclePro's actual services and data. All tests are runnable — see the setup notes below.

---

## Setup

Jest is configured in `package.json` under the `"jest"` key using the `jest-expo` preset. Two things were required beyond a basic install:

- **Path alias** — `"^@/(.*)$": "<rootDir>/$1"` in `moduleNameMapper` resolves the `@/` import alias used throughout the app.
- **AsyncStorage mock** — `@react-native-async-storage/async-storage` is mapped to its bundled jest mock, since the real native module can't run in a Node.js test environment.

```json
// package.json (jest section)
"jest": {
  "preset": "jest-expo",
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/$1",
    "@react-native-async-storage/async-storage": "@react-native-async-storage/async-storage/jest/async-storage-mock"
  }
}
```

Two source-code changes were also made to enable unit testing:

1. **`utils/scheduleUtils.ts`** — `getWeekNumber` and `isInSeason` were extracted out of the `HomeScreen` component (where they were private `const` functions) into this standalone exported module. The component now imports them from here.
2. **`matchesAddressRanges`** in `services/zoneMatchingService.ts` — changed from an unexported private function to an exported one so it can be tested directly.

---

## Running Tests

```bash
# Run all tests
npm test

# Run with a coverage report
npx jest --coverage

# Run a single test file
npx jest __tests__/scheduleUtils

# Run a group of related files
npx jest --testPathPattern="integration"

# Watch mode — re-runs affected tests on every save
npx jest --watch
```

---

## Test File Map

```
__tests__/
├── zoneMatchingService.test.ts     ← Unit: normalizeStreetName, parseAddress, matchesAddressRanges
├── scheduleUtils.test.ts           ← Unit: getWeekNumber, isInSeason
├── integration/
│   ├── searchToDisposal.test.ts    ← Integration: search → recyclability pipeline
│   └── zoneToSchedule.test.ts      ← Integration: zone matching → schedule display
├── oo/
│   └── statePartition.test.ts      ← OO: state-based partition (no location vs. location set)
├── scenarios/
│   └── newUserFlow.test.ts         ← Scenario: full new-user onboarding sequence
└── regression/
    └── criticalPaths.test.ts       ← Regression: must-never-break disposal behaviors
```

---

## Stage 1 — Unit Tests

Unit tests verify individual functions in isolation with no external dependencies (no Mapbox, no ONNX, no AsyncStorage).

### 1.1 `normalizeStreetName` — White Box / Statement Coverage

**File:** [__tests__/zoneMatchingService.test.ts](__tests__/zoneMatchingService.test.ts)

`normalizeStreetName` strips common street-type suffixes and lowercases the result so that "Main St", "Main Street", and "MAIN ST." all normalize to the same value for comparison. Each regex branch (street, ave, rd, ln, etc.) is a statement coverage target.

> **Note:** This function *strips* suffixes — it does not expand abbreviations. `'Elm Street'` → `'elm'`, not `'elm street'`.

```ts
it('strips street type suffix and lowercases', () => {
    expect(normalizeStreetName('Elm Street')).toBe('elm');
});

it('strips abbreviated suffix', () => {
    expect(normalizeStreetName('Oak Ave')).toBe('oak');
});
```

### 1.2 `parseAddress` — Equivalence Partitioning (Black Box, Lecture 4)

**File:** [__tests__/zoneMatchingService.test.ts](__tests__/zoneMatchingService.test.ts)

Inputs are partitioned into three equivalence classes: full address (number + street), street-only (no number), and empty string.

| Partition | Input | `number` | `street` |
|-----------|-------|----------|----------|
| Full address | `"42 Elm Street"` | `42` | `"elm"` |
| No number | `"Elm Street"` | `null` | `"elm"` |
| Empty | `""` | `null` | `""` |

```ts
it('parses a standard house number + street', () => {
    const result = parseAddress('42 Elm Street');
    expect(result.number).toBe(42);
    expect(result.street).toBe('elm');
});
```

### 1.3 `matchesAddressRanges` — Boundary Value Analysis (Black Box, Lecture 4)

**File:** [__tests__/zoneMatchingService.test.ts](__tests__/zoneMatchingService.test.ts)

`matchesAddressRanges` checks whether a parsed address falls within a zone's defined address ranges, including parity (odd/even side of the street). The range boundaries and the parity check are classic BVA targets.

The function signature takes a `parsedAddress` object and a full `CollectionZone`. In tests, a minimal mock zone is constructed:

```ts
const zone = {
    addressRanges: [
        { street: 'Elm Street', fromNumber: 2, toNumber: 100, parity: 'even' },
    ],
} as unknown as CollectionZone;
```

> **Important:** The street string in `addressRanges` is the raw name (e.g. `'Elm Street'`), which the function normalizes internally to `'elm'`. So `parsedAddress.street` must be the already-normalized form (`'elm'`) to match.

| Input | Expected | Reason |
|-------|----------|--------|
| `{ number: 2, street: 'elm' }` | `true` | start boundary, correct parity |
| `{ number: 50, street: 'elm' }` | `true` | mid-range, even |
| `{ number: 102, street: 'elm' }` | `false` | one above end boundary |
| `{ number: 51, street: 'elm' }` | `false` | in range, wrong parity |
| `{ number: 50, street: 'oak' }` | `false` | wrong street |

### 1.4 `getWeekNumber` — Branch Coverage (White Box, Lecture 4)

**File:** [__tests__/scheduleUtils.test.ts](__tests__/scheduleUtils.test.ts)

`getWeekNumber` returns the ISO week number of a date, which drives the even/odd recycling schedule on the Home screen. Branch coverage requires hitting the year-start, mid-year, and year-end cases.

> **Important:** Always use `new Date(year, month, day)` in tests — NOT ISO strings like `new Date('2025-01-01')`. ISO strings parse as **UTC midnight**, which rolls back to the previous day in US time zones and causes wrong results.

```ts
it('returns 1 for Jan 1', () => {
    expect(getWeekNumber(new Date(2025, 0, 1))).toBe(1);  // month is 0-indexed
});

it('returns an even week mid-year (commingled pickup)', () => {
    expect(getWeekNumber(new Date(2025, 5, 10)) % 2).toBe(0);
});
```

### 1.5 `isInSeason` — Equivalence Partitioning

**File:** [__tests__/scheduleUtils.test.ts](__tests__/scheduleUtils.test.ts)

Three equivalence classes: before the season window, inside it, and after it. Boundary dates (first and last day of season) are also tested.

```ts
it('returns true inside the season window', () => {
    expect(isInSeason(new Date(2025, 4, 15), '04-01', '11-30')).toBe(true); // May 15
});

it('returns false before season start', () => {
    expect(isInSeason(new Date(2025, 2, 1), '04-01', '11-30')).toBe(false); // Mar 1
});
```

---

## Stage 2 — Integration Tests (Lecture 1)

Integration tests verify that two or more services work correctly together. These use a bottom-up strategy — the leaf services (`zoneMatchingService`, `searchService`) are tested in Stage 1, then composed here.

### 2.1 Search → Recyclability Pipeline

**File:** [__tests__/integration/searchToDisposal.test.ts](__tests__/integration/searchToDisposal.test.ts)

Tests that `searchItems` → `itemToSearchResult` → `getItemDisposalInfo` returns consistent, correct disposal data for known items. Results come back as `RecyclingSearchResult` objects — the disposal field is `.disposal`, not `.disposalMethod`.

> **Note:** The `nationalRules` array in `data/recyclables/rules/national.ts` is intentionally empty. Items fall back to their `defaultDisposal` field, which `getItemDisposalInfo` handles. Tests verify the fallback works correctly rather than expecting a rule object.

```ts
it('pizza box disposal falls back to curbside_trash (item default)', () => {
    const result = getItemByIdWithDisposal('item-pizza-box', null);
    expect(result!.disposal).toBe('curbside_trash');
});
```

### 2.2 Zone Matching → Schedule Display

**File:** [__tests__/integration/zoneToSchedule.test.ts](__tests__/integration/zoneToSchedule.test.ts)

Tests that `findMatchingZone` correctly identifies a zone from a street address and that the returned zone has a populated schedule. Uses a self-contained mock `CollectionZone` (not a real town file) so the test doesn't break if street data changes.

```ts
it('matches an address on a listed street', () => {
    const zone = findMatchingZone('42 Elm Street', [mockZone]);
    expect(zone?.schedule.garbage).toBeDefined();
});

it('returns null for an address on an unlisted street', () => {
    expect(findMatchingZone('1 Fake Road', [mockZone])).toBeNull();
});
```

---

## Stage 3 — OO Partition & Scenario Tests (Lecture 8)

### 3.1 State-Based Partitioning — Location Saved vs. Not Saved

**File:** [__tests__/oo/statePartition.test.ts](__tests__/oo/statePartition.test.ts)

The app has two primary states: no location configured (national/default rules) and a location configured (local rule overrides possible). `getItemDisposalInfo` is tested in both states to confirm the fallback logic and override logic work correctly.

```ts
describe('No location (null) — falls back to item defaults', () => {
    it('newspaper disposal is curbside_recycling', () => {
        expect(getItemDisposalInfo(newspaper(), null).disposal).toBe('curbside_recycling');
    });

    it('pizza box disposal is curbside_trash', () => {
        expect(getItemDisposalInfo(pizzaBox(), null).disposal).toBe('curbside_trash');
    });
});
```

### 3.2 Scenario-Based Test — New User Setup Flow

**File:** [__tests__/scenarios/newUserFlow.test.ts](__tests__/scenarios/newUserFlow.test.ts)

Walks through the full new-user onboarding sequence as a series of ordered `it` blocks. This tests the interaction between `storageService` and `searchService` across lifecycle steps. `beforeAll`/`afterAll` ensure AsyncStorage is clean before and after the suite.

```
Step 1 — no location on first launch       → getSavedLocation() returns null
Step 2 — search works without location     → searchItems('cardboard', null) returns results
Step 3 — user saves a location             → getSavedLocation() returns the saved town
Step 4 — search still returns results      → searchItems('cardboard', savedLoc) returns results
Step 5 — clearing location resets to null  → getSavedLocation() returns null again
```

---

## Stage 4 — Regression Tests (Lecture 1)

**File:** [__tests__/regression/criticalPaths.test.ts](__tests__/regression/criticalPaths.test.ts)

These are the "must-never-break" behaviors — the first things to run after any change to the recyclables data or services. If any of these fail, something fundamental broke.

```bash
npx jest --testPathPattern="regression"
```

| Test | What it guards |
|------|----------------|
| pizza box → `curbside_trash` | Greasy cardboard must never appear as recyclable |
| newspaper → `curbside_recycling` | Basic paper recycling rule must always resolve |
| cardboard box → `curbside_recycling` | Same for clean cardboard |
| `searchItems('')` doesn't throw | Empty query must be handled gracefully |
| `searchItems('p')` returns `[]` | Single-char queries must return nothing (below min length) |
| `CLASS_LABELS.length === 8` | ML model label count must match the ONNX model's output layer |

---

## Stage 5 — System / Validation Checklist (Lecture 1)

Manual checks that cannot be automated with Jest — run on a physical device or simulator.

| # | Test | Expected | Phase |
|---|------|----------|-------|
| SYS-01 | Cold launch with no saved location | "Set your location" prompt visible | Alpha |
| SYS-02 | Search "newspaper" → tap result | Item detail with disposal + instructions | Alpha |
| SYS-03 | Camera → scan plastic bottle | Plastic items listed in bottom sheet | Beta |
| SYS-04 | Camera → scan low-contrast image | "Couldn't Identify" state, no items shown | Beta |
| SYS-05 | Kill app → reopen | Location still saved, no re-setup needed | Alpha |
