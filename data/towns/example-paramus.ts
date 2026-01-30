/**
 * Example town data structure showing advanced zone matching
 * This demonstrates:
 * 1. Address range matching with odd/even parity
 * 2. Different schedules for different sides of the same street
 * 3. Geographic boundary matching as fallback
 */

import { Town } from '../types';

export const paramus: Town = {
  id: 'paramus-nj',
  name: 'Paramus',
  state: 'NJ',
  county: 'Bergen',

  zones: [
    {
      id: 'paramus-zone-1',
      name: 'Zone 1 - North Side',
      description: 'North section - Monday/Thursday pickup',

      // Using addressRanges for precise odd/even matching
      addressRanges: [
        {
          street: 'Main Street',
          fromNumber: 1,
          toNumber: 500,
          parity: 'odd', // Only odd-numbered houses
        },
        {
          street: 'Oak Avenue',
          fromNumber: 100,
          toNumber: 300,
          parity: 'all', // All houses in this range
        },
      ],

      schedule: {
        garbage: {
          days: [1, 4], // Monday & Thursday
          time: '7:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 2, // Tuesday
          weeks: {
            even: 'Commingled (Glass, Plastic, Metal)',
            odd: 'Paper & Cardboard',
          },
        },
        yardWaste: {
          days: [1], // Monday
          seasonStart: '04-01',
          seasonEnd: '11-30',
        },
      },
    },
    {
      id: 'paramus-zone-2',
      name: 'Zone 2 - South Side',
      description: 'South section - Tuesday/Friday pickup',

      addressRanges: [
        {
          street: 'Main Street',
          fromNumber: 2,
          toNumber: 500,
          parity: 'even', // Only even-numbered houses
        },
        {
          street: 'Maple Drive',
          fromNumber: 1,
          toNumber: 999,
          parity: 'all',
        },
      ],

      schedule: {
        garbage: {
          days: [2, 5], // Tuesday & Friday
          time: '7:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 3, // Wednesday
          weeks: {
            even: 'Commingled (Glass, Plastic, Metal)',
            odd: 'Paper & Cardboard',
          },
        },
        yardWaste: {
          days: [2], // Tuesday
          seasonStart: '04-01',
          seasonEnd: '11-30',
        },
      },
    },
    {
      id: 'paramus-zone-3',
      name: 'Zone 3 - Downtown',
      description: 'Commercial district with different schedule',

      // Using simple street list for business district
      streets: [
        { name: 'Route 17' },
        { name: 'Bergen Boulevard' },
        { name: 'Paramus Road' },
      ],

      schedule: {
        garbage: {
          days: [1, 3, 5], // Monday, Wednesday, Friday
          time: '6:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 4, // Thursday
          weeks: {
            even: 'Commingled (Glass, Plastic, Metal)',
            odd: 'Paper & Cardboard',
          },
        },
        // No yard waste for commercial zone
      },
    },
    {
      id: 'paramus-zone-default',
      name: 'Default Zone',
      description: 'Catch-all for addresses not matching specific zones',

      // Geographic boundary as fallback - covers entire town
      boundary: {
        type: 'polygon',
        coordinates: [
          { lat: 40.9550, lng: -74.0850 },
          { lat: 40.9550, lng: -74.0500 },
          { lat: 40.9350, lng: -74.0500 },
          { lat: 40.9350, lng: -74.0850 },
          { lat: 40.9550, lng: -74.0850 }, // Close the polygon
        ],
      },

      schedule: {
        garbage: {
          days: [2, 5], // Tuesday & Friday (default)
          time: '7:00 AM',
        },
        recycling: {
          type: 'alternating',
          day: 3, // Wednesday
          weeks: {
            even: 'Commingled (Glass, Plastic, Metal)',
            odd: 'Paper & Cardboard',
          },
        },
        yardWaste: {
          days: [2],
          seasonStart: '04-01',
          seasonEnd: '11-30',
        },
      },
    },
  ],

  recyclingCenter: {
    name: 'Paramus Recycling Center',
    address: '375 Farview Avenue, Paramus, NJ 07652',
    coordinates: {
      lat: 40.9447,
      lng: -74.0755,
    },
    hours: {
      weekday: 'Monday-Friday 7:30 AM - 3:30 PM',
      saturday: 'Saturday 7:30 AM - 2:00 PM',
      sunday: 'Closed',
    },
    phone: '(201) 265-2100',
  },

  specialInstructions: [
    'Place containers at curb by 6:00 AM on collection day',
    'Remove containers same day by 9:00 PM',
    'Recycling must be in approved containers or tied bundles',
    'No plastic bags - use bins only',
    'Bulk items require separate pickup - call DPW',
  ],
};

/**
 * Usage Example:
 *
 * import { findMatchingZone } from '@/services/zoneMatchingService';
 * import { paramus } from '@/data/towns/example-paramus';
 *
 * // Example 1: Match by address with odd number
 * const zone1 = findMatchingZone('123 Main Street', paramus.zones);
 * // Returns Zone 1 (odd numbers on Main St)
 *
 * // Example 2: Match by address with even number
 * const zone2 = findMatchingZone('124 Main Street', paramus.zones);
 * // Returns Zone 2 (even numbers on Main St)
 *
 * // Example 3: Match with coordinates fallback
 * const zone3 = findMatchingZone(
 *   '999 Unknown Street',
 *   paramus.zones,
 *   { lat: 40.945, lng: -74.070 }
 * );
 * // Returns Default Zone (matched by geographic boundary)
 */
