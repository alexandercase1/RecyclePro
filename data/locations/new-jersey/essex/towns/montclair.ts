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
      id: 'montclair-refuse-section-1',
      name: 'Refuse Section 1',
      description: 'Section 1 garbage schedule per township calendar.',
      streets: [],
      schedule: {
        garbage: {
          days: [1, 4], // Monday & Thursday
          time: '6:00 AM',
        },
        recycling: {
          // Curbside recycling in Montclair is area-based (A/B/C/D), not one borough-wide day.
          // Keep this neutral until street-level area mapping is added.
          type: 'alternating',
          day: 1, // Placeholder
          weeks: {
            even: 'none',
            odd: 'none',
          },
          evenLabel: 'Check Montclair recycling area calendar (A/B/C/D)',
          oddLabel: 'Check Montclair recycling area calendar (A/B/C/D)',
        },
      },
    },
    {
      id: 'montclair-refuse-section-2',
      name: 'Refuse Section 2',
      description: 'Section 2 garbage schedule per township calendar.',
      streets: [],
      schedule: {
        garbage: {
          days: [2, 5], // Tuesday & Friday
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 1, // Placeholder
          weeks: {
            even: 'none',
            odd: 'none',
          },
          evenLabel: 'Check Montclair recycling area calendar (A/B/C/D)',
          oddLabel: 'Check Montclair recycling area calendar (A/B/C/D)',
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
    'Curbside recycling day depends on your recycling area (A/B/C/D).',
  ],
};

export const montclairRules: RecyclingRule[] = [];
