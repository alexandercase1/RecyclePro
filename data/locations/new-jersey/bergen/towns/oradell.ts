import { Town, RecyclingRule } from '@/data/types';

// Source: oradell.org/trash-recycling (verified March 2026)
// Street-to-zone assignments are not published online.
// To obtain the complete list, call Oradell DPW at (201) 261-8610 or file an OPRA request.

export const oradell: Town = {
  id: 'nj-bergen-oradell',
  name: 'Oradell',
  state: 'NJ',
  county: 'Bergen',

  zones: [
    // ============================================================
    // ZONE 1 — Monday & Thursday garbage
    // ============================================================
    {
      id: 'oradell-zone-1',
      name: 'Zone 1',
      description: 'Garbage collected Monday & Thursday',
      // TODO: Street assignments not publicly available online.
      // Call DPW (201) 261-8610 or submit an OPRA request to obtain the
      // complete street list for Zone 1.
      streets: [],
      schedule: {
        garbage: {
          days: [1, 4], // Monday & Thursday
          time: '6:00 AM',
        },
        recycling: {
          // Recycling is borough-wide every Wednesday, alternating streams.
          type: 'alternating',
          day: 3, // Wednesday
          weeks: {
            even: 'commingled',
            odd: 'paper',
          },
          evenLabel: 'Commingled (Glass, Plastic, Metal, Cans)',
          oddLabel: 'Newspaper & Cardboard',
        },
        yardWaste: {
          // Yard waste collected Thursdays, April through October.
          days: [4], // Thursday
          seasonStart: '04-01',
          seasonEnd: '10-31',
        },
      },
    },

    // ============================================================
    // ZONE 2 — Tuesday & Friday garbage
    // ============================================================
    {
      id: 'oradell-zone-2',
      name: 'Zone 2',
      description: 'Garbage collected Tuesday & Friday',
      // TODO: Street assignments not publicly available online.
      // Call DPW (201) 261-8610 or submit an OPRA request to obtain the
      // complete street list for Zone 2.
      streets: [],
      schedule: {
        garbage: {
          days: [2, 5], // Tuesday & Friday
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 3, // Wednesday (borough-wide)
          weeks: {
            even: 'commingled',
            odd: 'paper',
          },
          evenLabel: 'Commingled (Glass, Plastic, Metal, Cans)',
          oddLabel: 'Newspaper & Cardboard',
        },
        yardWaste: {
          days: [4], // Thursday
          seasonStart: '04-01',
          seasonEnd: '10-31',
        },
      },
    },
  ],

  recyclingCenter: {
    name: 'Oradell DPW Recycling Center',
    address: '2 Marginal Road, Oradell, NJ 07649',
    coordinates: {
      lat: 40.9545,
      lng: -74.0354,
    },
    hours: {
      weekday: 'Monday–Friday 8:00 AM – 3:00 PM',
      saturday: '1st & 3rd Saturday 9:00 AM – 12:00 PM',
      sunday: 'Closed',
    },
    phone: '(201) 261-8610',
  },

  specialInstructions: [
    'Containers may be placed at the curb no earlier than 5:00 PM the day before collection.',
    'Containers must be removed from the curb by 7:00 PM on the day of collection.',
    'Maximum 5 containers per collection day.',
    'Maximum 60 lbs per container.',
    'No plastic bags for recycling — use open bins or bundles.',
    'Yard waste: branches must not exceed 4 feet in length and must be bundled and tied.',
    'Leaf collection runs approximately mid-October through December (separate from yard waste).',
    'Christmas trees are picked up curbside throughout January — remove all bags, lights, and ornaments first.',
    'Bulk/appliance pickup: call (201) 261-8610 to schedule a Monday-only appointment.',
    'Recycling Center is open to Oradell residents only; no commercial dumping.',
  ],
};

export const oradellRules: RecyclingRule[] = [];
