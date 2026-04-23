import { RecyclingRule, Town } from '@/data/types';

// Source: Montclair sanitation/recycling calendar details provided by user (April 2026).
// Note: Montclair curbside recycling uses area-based pickup days (A/B/C/D) shown on the township calendar map.
// This file captures verified drop-off hours and refuse-section garbage schedules.
export const montclair: Town = {
  id: 'nj-essex-montclair',
  name: 'Montclair',
  state: 'NJ',
  county: 'Essex',

  zones: [
    {
      id: 'montclair-recycling-area-b',
      name: 'Recycling Area B (RB)',
      description:
        'Montclair Recycling Area B: curbside recycling pickup on Monday. Garbage follows Refuse Section 1 schedule.',
      streets: [],
      schedule: {
        garbage: {
          days: [1, 4], // Refuse Section 1: Monday & Thursday
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 1, // Monday
          weeks: {
            even: 'paper',
            odd: 'commingled',
          },
          evenLabel: 'Mixed Paper',
          oddLabel: 'Commingled Containers',
        },
      },
    },
    {
      id: 'montclair-recycling-area-c',
      name: 'Recycling Area C (RC)',
      description:
        'Montclair Recycling Area C: curbside recycling pickup on Tuesday. Garbage follows Refuse Section 1 schedule.',
      streets: [],
      schedule: {
        garbage: {
          days: [1, 4], // Refuse Section 1: Monday & Thursday
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 2, // Tuesday
          weeks: {
            even: 'paper',
            odd: 'commingled',
          },
          evenLabel: 'Mixed Paper',
          oddLabel: 'Commingled Containers',
        },
      },
    },
    {
      id: 'montclair-recycling-area-d',
      name: 'Recycling Area D (RD)',
      description:
        'Montclair Recycling Area D: curbside recycling pickup on Wednesday. Garbage follows Refuse Section 2 schedule.',
      streets: [],
      schedule: {
        garbage: {
          days: [2, 5], // Refuse Section 2: Tuesday & Friday
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 3, // Wednesday
          weeks: {
            even: 'paper',
            odd: 'commingled',
          },
          evenLabel: 'Mixed Paper',
          oddLabel: 'Commingled Containers',
        },
      },
    },
    {
      id: 'montclair-recycling-area-a',
      name: 'Recycling Area A (RA)',
      description:
        'Montclair Recycling Area A: curbside recycling pickup on Thursday. Garbage follows Refuse Section 2 schedule.',
      streets: [],
      schedule: {
        garbage: {
          days: [2, 5], // Refuse Section 2: Tuesday & Friday
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 4, // Thursday
          weeks: {
            even: 'paper',
            odd: 'commingled',
          },
          evenLabel: 'Mixed Paper',
          oddLabel: 'Commingled Containers',
        },
      },
    },
  ],

  recyclingCenter: {
    name: 'Montclair Public Works Yard',
    address: '219 N. Fullerton Avenue, Montclair, NJ',
    hours: {
      weekday: 'Call township for weekday access',
      saturday: 'Saturday 9:00 AM – 1:00 PM',
      sunday: 'Closed',
    },
  },

  specialInstructions: [
    'Recycling drop-off hours: Saturdays 9:00 AM – 1:00 PM at 219 N. Fullerton Avenue.',
    'Electronics waste drop-off hours: Saturdays 9:00 AM – 1:00 PM at 219 N. Fullerton Avenue.',
    'Garbage cans must be no more than 35 gallons and no more than 50 lbs.',
    'Maximum 3 garbage cans per household per collection.',
    'Garbage cans and bulky waste may be put out between 6:00 PM the day before and 6:00 AM on collection day (Township Code 292-23).',
    'For holiday schedule changes, check the official township calendar.',
    'Curbside recycling is one fixed day per zone (Monday, Tuesday, Wednesday, or Thursday) based on your Montclair area map.',
  ],
};

export const montclairRules: RecyclingRule[] = [];
