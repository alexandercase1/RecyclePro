# RecyclePro Data Structure Design

## Overview
This document outlines the data structure design for matching user addresses to their municipal waste collection schedules.

## Key Requirements
1. Support multiple towns/municipalities
2. Each town can have multiple collection zones
3. Zones are determined by street address or geographic boundaries
4. Each zone has specific schedules for:
   - Garbage/trash pickup
   - Recycling (commingled and paper, often alternating)
   - Yard waste (seasonal)
   - Bulk/special item pickup

## Data Structure Hierarchy

```
State
  └─ County
      └─ Town/Municipality
          ├─ Zones (multiple)
          │   ├─ Zone Identifier
          │   ├─ Streets/Boundaries
          │   └─ Collection Schedule
          └─ Recycling Center Info
```

## Zone Matching Strategies

### Strategy 1: Street Name Matching (Simple)
Best for small towns with clear zone divisions by street name.

```typescript
interface StreetBasedZone {
  id: string;
  name: string;
  streets: string[]; // List of street names in this zone
  schedule: CollectionSchedule;
}
```

**Pros:** Simple to implement, easy to manage
**Cons:** Requires complete street list, doesn't handle partial street names

### Strategy 2: Address Range Matching (Precise)
Best for zones divided by specific address ranges (e.g., odd/even numbers, or number ranges).

```typescript
interface AddressRange {
  street: string;
  fromNumber?: number;
  toNumber?: number;
  parity?: 'odd' | 'even' | 'all'; // For odd/even side of street
}

interface RangeBasedZone {
  id: string;
  name: string;
  addressRanges: AddressRange[];
  schedule: CollectionSchedule;
}
```

**Pros:** Very precise, handles split streets
**Cons:** More complex data entry and maintenance

### Strategy 3: Geographic Boundary (Advanced)
Best for complex zone divisions using GPS coordinates.

```typescript
interface GeoBoundary {
  type: 'polygon' | 'circle';
  coordinates: {
    lat: number;
    lng: number;
  }[];
  radius?: number; // For circle type
}

interface GeoBasedZone {
  id: string;
  name: string;
  boundary: GeoBoundary;
  schedule: CollectionSchedule;
}
```

**Pros:** Most flexible, handles complex boundaries, uses Mapbox coordinates
**Cons:** Requires GPS data, more complex matching algorithm

### Strategy 4: Hybrid Approach (Recommended)
Combine street matching with fallback to geographic matching.

```typescript
interface HybridZone {
  id: string;
  name: string;
  description?: string;

  // Primary matching
  streets?: string[];
  addressRanges?: AddressRange[];

  // Fallback matching
  boundary?: GeoBoundary;

  schedule: CollectionSchedule;
}
```

## Collection Schedule Structure

```typescript
interface DaySchedule {
  days: number[]; // 0=Sunday, 1=Monday, etc.
  time?: string; // e.g., "7:00 AM"
  notes?: string;
}

interface RecyclingSchedule {
  day: number; // Single day of week
  time?: string;

  // Alternating weeks for commingled vs paper
  weekPattern: 'alternating' | 'weekly';

  // For alternating: which week is which type
  // Even weeks = commingled, Odd weeks = paper (or vice versa)
  evenWeekType?: 'commingled' | 'paper';
  oddWeekType?: 'commingled' | 'paper';
}

interface SeasonalSchedule {
  days: number[];
  time?: string;
  seasonStart: string; // MM-DD format
  seasonEnd: string;   // MM-DD format
}

interface CollectionSchedule {
  garbage: DaySchedule;
  recycling: RecyclingSchedule;
  yardWaste?: SeasonalSchedule;
  bulkPickup?: {
    schedule: 'monthly' | 'quarterly' | 'on-demand';
    dayOfMonth?: number; // For monthly
    months?: number[];   // For quarterly [3, 6, 9, 12]
    notes?: string;
  };
}
```

## Town/Municipality Structure

```typescript
interface Municipality {
  id: string; // e.g., "nj-bergen-oradell"
  name: string; // e.g., "Oradell"
  county: string;
  state: string;
  stateCode: string;

  // Collection zones
  zones: HybridZone[];

  // Default zone if no match found
  defaultZone?: string; // Zone ID

  // Contact information
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };

  // Recycling center
  recyclingCenter?: {
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    hours: {
      weekday: string;
      saturday?: string;
      sunday?: string;
    };
    acceptedMaterials?: string[];
  };

  // Special notes
  holidays?: {
    name: string;
    date: string; // MM-DD
    collectionDelay: number; // Days delayed (usually 1)
  }[];

  notes?: string;
}
```

## Zone Matching Algorithm

### For Street-Based Matching:
1. Parse user's street address to extract street name
2. Normalize street name (remove "Street", "St", "Avenue", "Ave", etc.)
3. Compare against zone street lists
4. Return matching zone

### For Address Range Matching:
1. Parse street number and street name
2. Check if street name matches any address range
3. Check if number falls within range
4. Check parity (odd/even) if specified
5. Return matching zone

### For Geographic Matching:
1. Use Mapbox geocoding to get coordinates from address
2. Check if coordinates fall within any zone boundary
3. For polygon: Use point-in-polygon algorithm
4. For circle: Calculate distance from center
5. Return matching zone

### Fallback Strategy:
1. Try street-based matching first (fastest)
2. If no match, try address range matching
3. If still no match, try geographic matching
4. If still no match, use default zone or prompt user

## Data Entry Process

### Phase 1: Basic Implementation
- Manually enter data for a few pilot towns
- Use simple street-based matching
- Focus on core features (garbage and recycling)

### Phase 2: Enhanced Features
- Add address range support
- Add seasonal schedules (yard waste)
- Add holiday calendar
- Add bulk pickup information

### Phase 3: Advanced Features
- Implement geographic boundary matching
- Add crowd-sourced verification
- Allow users to report incorrect zones
- Add notifications for schedule changes

## Sample Data Files Structure

```
data/
  ├── types.ts                 # TypeScript interfaces
  ├── municipalities/
  │   └── index.ts            # Export all municipalities
  ├── towns/
  │   ├── nj-bergen-oradell.ts
  │   ├── nj-bergen-paramus.ts
  │   └── ...
  └── utils/
      ├── zoneMatching.ts     # Zone matching algorithms
      └── dateUtils.ts        # Schedule calculation utilities
```

## Future Enhancements

1. **User Feedback System**: Allow users to confirm or correct their zone assignment
2. **Municipality Admin Portal**: Web interface for municipalities to update their data
3. **API Integration**: Pull data from municipal websites/APIs where available
4. **Notification System**: Push notifications day before pickup
5. **Calendar Integration**: Export to device calendar
6. **Reminder Settings**: Customizable reminder times
7. **Multi-property Support**: Users with multiple properties
8. **Historical Data**: Track when collection was missed or delayed

## Implementation Priority

### Phase 1 (MVP):
- [x] Basic SavedLocation interface with address
- [x] Location search and address input flow
- [ ] Implement street-based zone matching
- [ ] Create data for 2-3 pilot towns
- [ ] Display correct schedule based on zone

### Phase 2 (Enhanced):
- [ ] Add address range matching
- [ ] Expand to 10+ towns
- [ ] Add seasonal schedules
- [ ] Add holiday handling

### Phase 3 (Advanced):
- [ ] Geographic boundary matching
- [ ] User verification system
- [ ] Municipality data management
- [ ] Notification system
