import { RecyclingRule, Town } from '@/data/types';

// Source: Borough of Bogota 2026 Recycling and Garbage Calendar
// and Borough DPW recycling center page (verified April 2026).
export const bogota: Town = {
  id: 'nj-bergen-bogota',
  name: 'Bogota',
  state: 'NJ',
  county: 'Bergen',

  zones: [
    {
      id: 'bogota-townwide',
      name: 'Town-wide',
      description: 'Borough-wide schedule for trash, recycling, and vegetative waste.',
      streets: [],
      schedule: {
        garbage: {
          // Borough-wide regular household garbage collection
          days: [2, 5], // Tuesday & Friday
          time: '6:00 AM',
        },
        recycling: {
          // Alternates every Wednesday: Paper/Cardboard then Bottles/Cans
          type: 'alternating',
          day: 3, // Wednesday
          weeks: {
            even: 'paper',
            odd: 'commingled',
          },
          evenLabel: 'Paper & Cardboard',
          oddLabel: 'Bottles, Cans, Plastics, Glass',
        },
        yardWaste: {
          // Vegetative waste is collected town-wide on Mondays
          days: [1], // Monday
          seasonStart: '01-01',
          seasonEnd: '12-31',
        },
      },
    },
  ],

  recyclingCenter: {
    name: 'Bogota Recycling Center',
    address: '157 West Fort Lee Road, Bogota, NJ 07603',
    hours: {
      weekday: 'Monday–Friday 8:00 AM – 2:00 PM',
      saturday: 'Saturday 9:00 AM – 1:00 PM',
      sunday: 'Closed',
    },
    phone: '(201) 487-1041',
  },

  specialInstructions: [
    'All garbage must be placed in garbage cans or heavy-duty black garbage bags.',
    'Plastic bags are not accepted in recycling.',
    'Vegetative waste must be in cans or biodegradable paper bags; branches must be tied.',
    'Styrofoam and pizza boxes are not accepted at the recycling center.',
    'Alkaline batteries and carpets are treated as regular garbage.',
    'If Monday is a holiday, vegetative waste is collected the following day.',
  ],
};

export const bogotaRules: RecyclingRule[] = [];
