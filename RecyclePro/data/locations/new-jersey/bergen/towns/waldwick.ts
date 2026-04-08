import { RecyclingRule, Town } from '@/data/types';

export const waldwick: Town = {
  id: 'nj-bergen-waldwick',
  name: 'Waldwick',
  state: 'NJ',
  county: 'Bergen',

  zones: [
    {
      id: 'waldwick-zone-west',
      name: 'West of Franklin Turnpike',
      description: 'West of, and including, Franklin Turnpike to the Wyckoff border.',
      schedule: {
        garbage: {
          days: [1, 4], // Monday & Thursday
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 3, // Wednesday
          weeks: {
            // Per 2026 schedule: Jan 7 = Cardboard/Mixed Paper, Jan 14 = Commingled
            even: 'paper',
            odd: 'commingled',
          },
          evenLabel: 'Cardboard & Mixed Paper',
          oddLabel: 'Commingled (Plastics, Glass, Metal)',
        },
        yardWaste: {
          // Waldwick yard-waste days vary by sub-area (Tue/Wed/Thu/Fri).
          // Until street-level zoning is entered, keep curbside yard-waste days unset
          // so users choose the right zone manually if/when we add those sub-areas.
          days: [],
          seasonStart: '04-14',
          seasonEnd: '10-16',
        },
      },
    },
    {
      id: 'waldwick-zone-east',
      name: 'East of Franklin Turnpike',
      description: 'East of Franklin Turnpike to the Saddle River border.',
      schedule: {
        garbage: {
          days: [2, 5], // Tuesday & Friday
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 3, // Wednesday
          weeks: {
            even: 'paper',
            odd: 'commingled',
          },
          evenLabel: 'Cardboard & Mixed Paper',
          oddLabel: 'Commingled (Plastics, Glass, Metal)',
        },
        yardWaste: {
          days: [],
          seasonStart: '04-14',
          seasonEnd: '10-16',
        },
      },
    },
  ],

  recyclingCenter: {
    name: 'Waldwick Recycling Center',
    address: '19 Industrial Park, Waldwick, NJ',
    hours: {
      weekday: 'Monday–Friday 7:30 AM – 3:00 PM',
      saturday: 'Saturday 9:00 AM – 1:00 PM',
      sunday: 'Closed',
    },
    phone: '(201) 652-5900',
  },

  specialInstructions: [
    'Garbage and recycling must be at the curb by 6:00 AM on collection day.',
    'Recyclables must be loose in cans — no plastic bags.',
    'Garbage cans must be watertight and have lids.',
    'Wrap mattresses in mattress bags or garbage bags.',
    'Place tape in an “X” across any panels of glass or mirrors to help prevent shattering.',
    'Remove any batteries from items prior to disposal.',
    'Bulk items are scheduled; some materials are not accepted at bulk collections.',
    'Metal collection is scheduled; items must be metal and placed curbside by 6:00 AM on collection day.',
    'Electronics collection is scheduled; items must be at the curb by 6:00 AM on collection day.',
  ],
};

export const waldwickRules: RecyclingRule[] = [];

// PLACEHOLDER — to be completed
// Source: [Waldwick DPW website URL]
// import { Town, RecyclingRule } from '@/data/types';
// export const waldwick: Town = { id: 'nj-bergen-waldwick', name: 'Waldwick', state: 'NJ', county: 'Bergen', zones: [] };
// export const waldwickRules: RecyclingRule[] = [];
