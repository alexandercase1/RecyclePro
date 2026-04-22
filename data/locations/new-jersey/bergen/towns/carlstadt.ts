import { RecyclingRule, Town } from '@/data/types';

// Source: Carlstadt Recycling & Garbage Calendar (user-provided PDF), verified April 2026.
export const carlstadt: Town = {
  id: 'nj-bergen-carlstadt',
  name: 'Carlstadt',
  state: 'NJ',
  county: 'Bergen',

  zones: [
    {
      id: 'carlstadt-zone-west',
      name: 'West Side',
      description: 'From Garden Street up to but not including Third Street.',
      streets: [],
      schedule: {
        garbage: {
          days: [1, 4], // Monday & Thursday
          time: '6:00 AM',
        },
        recycling: {
          // Commingled items are collected every Wednesday borough-wide.
          // We model this as an alternating schedule with the same stream both weeks.
          type: 'alternating',
          day: 3, // Wednesday
          weeks: {
            even: 'commingled',
            odd: 'commingled',
          },
          evenLabel: 'Commingled Items (Mixed Paper + Mixed Containers)',
          oddLabel: 'Commingled Items (Mixed Paper + Mixed Containers)',
        },
        yardWaste: {
          days: [2], // Tuesday
          seasonStart: '01-01',
          seasonEnd: '12-31',
        },
      },
    },
    {
      id: 'carlstadt-zone-east',
      name: 'East Side',
      description: 'From Third Street up to Route 17 Southbound.',
      streets: [],
      schedule: {
        garbage: {
          days: [2, 5], // Tuesday & Friday
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 3, // Wednesday
          weeks: {
            even: 'commingled',
            odd: 'commingled',
          },
          evenLabel: 'Commingled Items (Mixed Paper + Mixed Containers)',
          oddLabel: 'Commingled Items (Mixed Paper + Mixed Containers)',
        },
        yardWaste: {
          days: [1], // Monday
          seasonStart: '01-01',
          seasonEnd: '12-31',
        },
      },
    },
  ],

  recyclingCenter: {
    name: 'Carlstadt DPW',
    address: 'Carlstadt, NJ (call DPW for exact recycling drop-off details)',
    hours: {
      weekday: 'Call DPW for current hours',
      saturday: 'Call DPW for current hours',
      sunday: 'Closed',
    },
  },

  specialInstructions: [
    'If a holiday falls on your collection day, check the official borough calendar for makeup collection.',
    'Heavy trash: Thursday (West Side) and Friday (East Side).',
    'Christmas trees: Monday (East Side) and Tuesday (West Side) on posted calendar dates.',
    'Metal pickup is by scheduled appointment with DPW.',
    'Electronics pickup is by appointment.',
    'Yard waste must be in biodegradable paper bags or open cans marked "Yard Waste" — no plastic bags.',
    'Brush/branches under 6 inches must be bundled; max 35 lbs and less than 4 feet long.',
    'Logs/stumps/branches over 6 inches require DPW disposal arrangement.',
    'Wood scrap must be bundled in 4-foot lengths, max 35 lbs, with nails removed; place on heavy trash day.',
    'Household garbage cans must be no larger than 35 gallons and no heavier than 50 lbs.',
    'NO PLASTIC BAGS for paper recycling.',
    'Not accepted in recycling bins: toys, butter dishes, oil containers, Styrofoam, dishes, pots/pans, light bulbs, mirrors, or window glass.',
  ],
};

export const carlstadtRules: RecyclingRule[] = [];
