# How to Add New Towns to RecyclePro

This guide explains how to add new town data to the app using the simplified directory structure.

## Directory Structure Overview

The data is organized in a clean hierarchy:

```
data/
├── states/
│   ├── index.ts              # Exports all states + helper functions
│   ├── new-jersey.ts         # NJ state with counties (ACTIVE)
│   ├── new-york.ts           # Future (placeholder)
│   ├── pennsylvania.ts       # Future (placeholder)
│   └── connecticut.ts        # Future (placeholder)
├── towns/
│   ├── index.ts              # Backwards compatibility layer
│   └── new-jersey/
│       ├── bergen/
│       │   ├── oradell.ts    # Example town file
│       │   └── ...           # Add more towns here
│       ├── passaic/          # Future county
│       └── hudson/           # Future county
└── types.ts
```

**How it works:**
- Each **state** is a single file in `data/states/`
- Each state file defines its counties and imports town data
- Town data files live in `data/towns/{state}/{county}/{town}.ts`
- The `data/states/index.ts` provides helper functions used by the app
- The `data/towns/index.ts` re-exports everything for backwards compatibility

## Step-by-Step: Adding a New Town

### Step 1: Create the Town File

Create a new file in the appropriate county directory:

**File**: `data/towns/new-jersey/bergen/{town-name}.ts`

**Template**:
```typescript
import { Town } from '../../../types';

export const townName: Town = {
  id: 'town-name-nj',
  name: 'Town Name',
  state: 'New Jersey',
  county: 'Bergen',

  zones: [
    {
      id: 'town-zone-1',
      name: 'Zone 1 - Description',
      description: 'Collection Zone 1',
      streets: [
        {
          name: 'Main Street',
          rangeStart: 1,
          rangeEnd: 500,
          crossStreets: ['1st Ave', '5th Ave']
        },
        {
          name: 'Oak Avenue'
          // No range = entire street
        }
      ],
      schedule: {
        garbage: {
          days: [1, 4],        // 0=Sunday, 1=Monday, 2=Tuesday, etc.
          time: '7:00 AM'
        },
        recycling: {
          type: 'alternating',
          day: 3,              // Wednesday
          weeks: {
            even: 'Commingled (Glass, Plastic, Metal)',
            odd: 'Paper & Cardboard'
          }
        },
        yardWaste: {
          days: [1],           // Monday
          seasonStart: '04-01',
          seasonEnd: '10-31'
        }
      }
    },
    // Add more zones as needed
  ],

  recyclingCenter: {
    name: 'Town Name Recycling Center',
    address: '123 Main St, Town Name, NJ 07XXX',
    coordinates: {
      lat: 40.1234,
      lng: -74.1234
    },
    hours: {
      weekday: 'Monday-Friday 8:00 AM - 3:00 PM',
      saturday: '1st & 3rd Saturday 9:00 AM - 12:00 PM',
      sunday: 'Closed'
    },
    phone: '(201) XXX-XXXX'
  },

  specialInstructions: [
    'Place containers at curb after 5 PM the day before collection',
    'Remove containers before 7 PM on collection day',
    'Maximum 5 containers per collection day'
  ]
};
```

### Step 2: Add Import to State File

**File**: `data/states/new-jersey.ts`

Add your town to the imports at the top:

```typescript
import { oradell } from '../towns/new-jersey/bergen/oradell';
import { hackensack } from '../towns/new-jersey/bergen/hackensack';  // Add this line
```

Then add it to the county's towns array:

```typescript
export const bergenCounty: County = {
  id: 'bergen',
  name: 'Bergen County',
  towns: [
    oradell,
    hackensack,  // Add this line
  ]
};
```

### Step 3: Test Compilation

Run TypeScript compiler to check for errors:

```bash
cd "/Users/alexcase/ReactNative - RecyclePro/RecyclePro"
npx tsc --noEmit
```

If there are errors, check:
- Import path is `../../../types` (3 levels up)
- All required fields are present
- Street days are numbers 0-6 (0=Sunday)
- Date formats are correct (MM-DD for seasonal dates)

### Step 4: Test in App

1. Run the app
2. Search for your new town in location search
3. Select the town
4. Enter a street address that should match one of your zones
5. Verify the correct schedule displays on home screen

## Data Collection Template

When researching a town's schedule, collect this information:

```
TOWN NAME: [e.g., Hackensack]

GARBAGE COLLECTION:
- Days: [e.g., Monday and Thursday]
- Time: [e.g., 7:00 AM]

RECYCLING COLLECTION:
- Type: [Single-stream OR Alternating]
- Days: [e.g., Wednesday]
- If Alternating:
  - Even weeks: [e.g., Commingled - glass, plastic, metal]
  - Odd weeks: [e.g., Paper & cardboard]

YARD WASTE:
- Days: [e.g., Monday]
- Season: [e.g., April 1 - October 31]

ZONES:
- Zone 1: [Streets or description]
- Zone 2: [Streets or description]

RECYCLING CENTER:
- Name: [e.g., Hackensack Recycling Center]
- Address: [e.g., 123 Main St]
- Hours: [Mon-Fri, Sat, Sun]
- Phone: [if available]

SPECIAL INSTRUCTIONS:
- [Any rules, restrictions, bulk pickup info]

SOURCE URL: [Where you found this information]
```

## Adding a New County

If you need to add a new county to New Jersey:

1. Create the county directory:
   ```bash
   mkdir -p "data/towns/new-jersey/{county-name}"
   ```

2. Add county definition to `data/states/new-jersey.ts`:
   ```typescript
   export const newCounty: County = {
     id: 'county-name',
     name: 'County Name County',
     towns: []
   };
   ```

3. Add to state's counties object:
   ```typescript
   export const newJersey: State = {
     id: 'nj',
     name: 'New Jersey',
     abbreviation: 'NJ',
     counties: {
       bergen: bergenCounty,
       newCounty: newCounty,  // Add here
     }
   };
   ```

## Adding a New State

If you need to add a completely new state:

1. Create state directory structure:
   ```bash
   mkdir -p "data/towns/{state-name}/{county-name}"
   ```

2. Create or update the state file: `data/states/{state-name}.ts`
   - Use `data/states/new-jersey.ts` as a template
   - Define counties and import towns

3. Import and add to `data/states/index.ts`:
   ```typescript
   import { stateName } from './state-name';

   export const states: Record<string, State> = {
     'new-jersey': newJersey,
     'state-name': stateName,  // Add here
   };
   ```

## Example: Complete Workflow

**Adding Hackensack, NJ:**

1. Create file: `data/towns/new-jersey/bergen/hackensack.ts`
2. Copy template, fill in schedule data
3. Edit `data/states/new-jersey.ts`:
   ```typescript
   import { hackensack } from '../towns/new-jersey/bergen/hackensack';

   export const bergenCounty: County = {
     id: 'bergen',
     name: 'Bergen County',
     towns: [
       oradell,
       hackensack,  // Add here
     ]
   };
   ```
4. Run `npx tsc --noEmit` to check for errors
5. Test in app

**That's it!** No need to touch `data/states/index.ts` or `data/towns/index.ts` - they automatically pick up the new town.

## Quick Reference

### Day Numbers
```
0 = Sunday
1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday
```

### Current File Structure
```
data/
├── states/
│   ├── index.ts              ✅ Main export with helper functions
│   ├── new-jersey.ts         ✅ NJ state (ACTIVE - add towns here)
│   ├── new-york.ts           📋 Placeholder
│   ├── pennsylvania.ts       📋 Placeholder
│   └── connecticut.ts        📋 Placeholder
├── towns/
│   ├── index.ts              ✅ Backwards compatibility layer
│   └── new-jersey/
│       └── bergen/
│           └── oradell.ts    ✅ Example town
└── types.ts                  ✅ All TypeScript types
```

## Need Help?

- See [data/towns/new-jersey/bergen/oradell.ts](data/towns/new-jersey/bergen/oradell.ts) for a complete example
- See [data/states/new-jersey.ts](data/states/new-jersey.ts) for how states are structured
- Check [data/types.ts](data/types.ts) for all available fields and types
- TypeScript compiler errors will tell you if required fields are missing
