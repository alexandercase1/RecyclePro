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
      id: 'montclair-recycling-area-monday',
      name: 'Recycling Area - Monday',
      description:
        'Montclair recycling area with Monday curbside recycling pickup. Garbage follows Refuse Section 1 schedule.',
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
            even: 'commingled',
            odd: 'commingled',
          },
          evenLabel: 'Curbside Recycling Pickup',
          oddLabel: 'Curbside Recycling Pickup',
        },
      },
    },
    {
      id: 'montclair-recycling-area-tuesday',
      name: 'Recycling Area - Tuesday',
      description:
        'Montclair recycling area with Tuesday curbside recycling pickup. Garbage follows Refuse Section 1 schedule.',
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
            even: 'commingled',
            odd: 'commingled',
          },
          evenLabel: 'Curbside Recycling Pickup',
          oddLabel: 'Curbside Recycling Pickup',
        },
      },
    },
    {
      id: 'montclair-recycling-area-wednesday',
      name: 'Recycling Area - Wednesday',
      description:
        'Montclair recycling area with Wednesday curbside recycling pickup. Garbage follows Refuse Section 2 schedule.',
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
            even: 'commingled',
            odd: 'commingled',
          },
          evenLabel: 'Curbside Recycling Pickup',
          oddLabel: 'Curbside Recycling Pickup',
        },
      },
    },
    {
      id: 'montclair-recycling-area-thursday',
      name: 'Recycling Area - Thursday',
      description:
        'Montclair recycling area with Thursday curbside recycling pickup. Garbage follows Refuse Section 2 schedule.',
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
            even: 'commingled',
            odd: 'commingled',
          },
          evenLabel: 'Curbside Recycling Pickup',
          oddLabel: 'Curbside Recycling Pickup',
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
