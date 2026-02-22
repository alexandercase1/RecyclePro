# Adding New Towns and Recycling Rules

This guide explains how to add a new town's collection schedule to RecyclePro.

---

## Overview

Location data is organized as: **State > County > Town > Zones**

```
data/locations/
└── new-jersey/
    ├── index.ts          # State definition (lists all counties)
    ├── rules.ts          # State-level recycling rule overrides (optional)
    └── bergen/
        ├── index.ts      # County definition (lists all towns)
        ├── rules.ts      # County-level rule overrides (optional)
        └── towns/
            ├── index.ts  # Exports all town data
            └── oradell.ts  # Town data (zones, schedules, etc.)
```

---

## Step 1: Create the Town Data File

Create a new `.ts` file in the appropriate county's `towns/` folder.

**Example:** Adding Fair Lawn to Bergen County

File: `data/locations/new-jersey/bergen/towns/fairlawn.ts`

```typescript
import { Town, RecyclingRule } from '@/data/types';

export const fairLawn: Town = {
  id: 'nj-bergen-fair-lawn',    // Format: {stateCode}-{county}-{town}
  name: 'Fair Lawn',
  state: 'NJ',
  county: 'Bergen',

  zones: [
    {
      id: 'fair-lawn-zone-1',
      name: 'Zone 1 - North Side',
      description: 'North of Broadway',
      streets: [
        { name: 'River Rd', rangeStart: 1, rangeEnd: 500 },
        { name: 'Prospect St' },
        { name: 'Plaza Rd' },
      ],
      schedule: {
        garbage: {
          days: [1, 4],           // Monday & Thursday (0=Sun, 1=Mon, ... 6=Sat)
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 5,                 // Friday
          weeks: {
            even: 'commingled',   // 'commingled' | 'paper' | 'none'
            odd: 'paper',         // 'commingled' | 'paper' | 'none'
          },
          evenLabel: 'Commingled (Glass, Plastic, Metal)',
          oddLabel: 'Paper & Cardboard',
        },
        yardWaste: {              // Optional - omit if town doesn't collect
          days: [2],              // Tuesday
          seasonStart: '04-01',   // April 1
          seasonEnd: '11-30',     // November 30
        },
      },
    },
    // Add more zones as needed...
  ],

  // Optional: local recycling center
  recyclingCenter: {
    name: 'Fair Lawn Recycling Center',
    address: '123 Example St, Fair Lawn, NJ 07410',
    hours: {
      weekday: 'Monday-Friday 8:00 AM - 3:00 PM',
      saturday: 'Saturday 9:00 AM - 12:00 PM',
    },
    phone: '(201) 555-0100',
  },

  // Optional: special instructions for residents
  specialInstructions: [
    'Place bins at curb by 6:00 AM on collection day',
    'No pickup on major holidays',
  ],
};

// Town-level recycling rule overrides (leave empty if no overrides)
export const fairLawnRules: RecyclingRule[] = [];
```

### Key fields explained

**Town ID format:** Always use `{stateCode}-{county}-{town}` in lowercase with hyphens. This must match what the location search generates. Examples:
- `nj-bergen-oradell`
- `nj-bergen-fair-lawn`
- `nj-essex-newark`

**Day numbers:** `0` = Sunday, `1` = Monday, `2` = Tuesday, `3` = Wednesday, `4` = Thursday, `5` = Friday, `6` = Saturday

**Zones:** Most towns have at least one zone. If the town has a single schedule for everyone, create one zone and list all streets. If different areas have different pickup days, create multiple zones with their respective streets.

**Recycling schedule — `weeks` field:** The `weeks.even` and `weeks.odd` values control which calendar indicator appears on even and odd weeks of the year. They must be one of:

| Value | Calendar indicator | Meaning |
|---|---|---|
| `'commingled'` | Blue square | Commingled recycling (glass, plastic, metal) |
| `'paper'` | Green circle | Paper & cardboard recycling |
| `'none'` | No indicator | No recycling pickup this week |

The `evenLabel` and `oddLabel` fields are optional human-readable descriptions shown in the "Today's Collection" section.

**Common schedule patterns:**

```typescript
// Pattern 1: Alternates between commingled and paper every week (most common)
weeks: { even: 'commingled', odd: 'paper' },
evenLabel: 'Commingled (Glass, Plastic, Metal)',
oddLabel: 'Paper & Cardboard',

// Pattern 2: Recycling only every other week (even weeks only)
weeks: { even: 'commingled', odd: 'none' },
evenLabel: 'Recycling Pickup',
oddLabel: 'No Recycling',

// Pattern 3: Recycling only every other week (odd weeks only)
weeks: { even: 'none', odd: 'paper' },
evenLabel: 'No Recycling',
oddLabel: 'Paper & Cardboard',
```

**How even/odd weeks are determined:** The app uses the week number of the year (1-52). Week 1 is the first week of January. Even week numbers (2, 4, 6...) use the `even` value; odd week numbers (1, 3, 5...) use the `odd` value.

**Streets:** You can list streets with or without address ranges:
- `{ name: 'Main St' }` — entire street
- `{ name: 'Main St', rangeStart: 1, rangeEnd: 500 }` — specific house numbers
- `{ name: 'Main St', rangeStart: 1, rangeEnd: 500, crossStreets: ['Oak Ave', 'Elm St'] }` — with cross streets for reference

---

## Step 2: Export the Town

Add the new town to the county's `towns/index.ts`:

File: `data/locations/new-jersey/bergen/towns/index.ts`

```typescript
export { oradell, oradellRules } from './oradell';
export { fairLawn, fairLawnRules } from './fairlawn';
```

---

## Step 3: Register the Town in the County

Add the town to the county's `index.ts` towns array:

File: `data/locations/new-jersey/bergen/index.ts`

```typescript
import { CountyInfo } from '../../types';
import { oradell } from './towns/oradell';
import { fairLawn } from './towns/fairlawn';

export const bergenCounty: CountyInfo = {
  id: 'bergen',
  name: 'Bergen County',
  towns: [
    oradell,
    fairLawn,
  ],
};

export { bergenCountyRules } from './rules';
```

---

## Step 4: Register Rules (if any)

If your town has recycling rule overrides, add them to the rules index:

File: `data/recyclables/rules/index.ts`

```typescript
import { fairLawnRules } from '@/data/locations/new-jersey/bergen/towns/fairlawn';

export const ALL_RULES: RecyclingRule[] = [
  ...nationalRules,
  ...newJerseyRules,
  ...bergenCountyRules,
  ...oradellRules,
  ...fairLawnRules,    // Add here
];
```

If the town has no rule overrides (the `Rules` array is empty), you can still add the import — it just won't add any rules.

---

## Adding a Town to a New County

If the county doesn't have any towns yet (e.g., Essex County), you need to:

1. Create a `towns/` folder inside the county folder
2. Create the town data file inside `towns/`
3. Create a `towns/index.ts` that exports the town
4. Update the county's `index.ts` to import and list the town

Example for Essex County:

```
data/locations/new-jersey/essex/
├── index.ts           # Update to import town
└── towns/
    ├── index.ts       # Export the town
    └── newark.ts      # Town data
```

Update `data/locations/new-jersey/essex/index.ts`:
```typescript
import { CountyInfo } from '../../types';
import { newark } from './towns/newark';

export const essexCounty: CountyInfo = {
  id: 'essex',
  name: 'Essex County',
  towns: [
    newark,
  ],
};
```

---

## About County-Level Rules

County-level `rules.ts` files are **optional**. Only create one if the county has specific recycling policies that differ from the state or national defaults.

Currently only Bergen County has a `rules.ts` — and it's empty. Most counties won't need one. The rule system falls back through the hierarchy automatically:

**Zone rules > Town rules > County rules > State rules > National rules**

If no override exists at a given level, the system uses the next level up.

---

## Recycling Rule Overrides

Rules let you override the default disposal method for specific items in specific locations. For example, if a town doesn't accept styrofoam curbside:

```typescript
export const fairLawnRules: RecyclingRule[] = [
  {
    id: 'rule-fairlawn-styrofoam',
    itemId: 'item-styrofoam',
    scope: 'municipal',
    townId: 'nj-bergen-fair-lawn',
    disposal: 'special_recycling_center',
    instructions: 'Bring to recycling center - not accepted curbside',
    source: 'Fair Lawn DPW 2026',
  },
];
```

The `itemId` must match an item in `data/recyclables/items/common-items.ts`.

Available disposal methods:
- `curbside_recycling` — regular recycling bin
- `curbside_trash` — regular garbage
- `curbside_compost` — composting/organic waste
- `special_recycling_center` — drop-off at recycling center
- `hazardous_waste` — hazardous waste facility
- `e_waste` — electronics recycling
- `donation` — donate/reuse
- `return_to_store` — retail take-back program
- `mail_back` — mail-in recycling program

---
When you add a new town, you touch 3 files:
Say you're adding "Clinton" to Hunterdon County:

Create hunterdon/towns/clinton.ts — the town data
Add to hunterdon/towns/index.ts — add export { clinton } from './clinton'; (note: Hunterdon doesn't have a towns/index.ts yet, so you'd need to check if the county imports directly from the town file or via the barrel)
Add to hunterdon/index.ts — add clinton to the towns: [bloomsbury, clinton] array

## Finding Schedule Data

Town collection schedules can usually be found at:
- The town's official website (DPW or Public Works page)
- The county recycling coordinator's website
- Printed mailers/calendars sent to residents
- Calling the town's DPW office directly

Key information to collect for each town:
1. Garbage pickup days and time
2. Recycling pickup day and pattern (alternates commingled/paper, or every-other-week, etc.)
3. Yard waste season dates and pickup day
4. Zone boundaries (which streets belong to which zone)
5. Recycling center address and hours
6. Any special instructions or restrictions
