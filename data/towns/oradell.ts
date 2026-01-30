import { Town } from '../types';

export const oradell: Town = {
  id: 'oradell-nj',
  name: 'Oradell',
  state: 'NJ',
  county: 'Bergen',
  
  zones: [
    {
      id: 'oradell-zone-1',
      name: 'Oradell Ave (Kinderkamack Rd - Grant Ave)',
      description: 'Collection Zone 1',
      streets: [
        {
          name: 'Oradell Ave',
          rangeStart: 1,
          rangeEnd: 700,
          crossStreets: ['Kinderkamack Rd', 'Grant Ave']
        }
      ],
      schedule: {
        garbage: {
          days: [1, 4], // Monday & Thursday
          time: '6:00 AM'
        },
        recycling: {
          type: 'alternating',
          day: 3, // Wednesday
          weeks: {
            even: 'Commingled (Glass, Plastic, Metal)',
            odd: 'Paper & Cardboard'
          }
        },
        yardWaste: {
          days: [1], // Monday
          seasonStart: '04-01',
          seasonEnd: '10-31'
        }
      }
    },
    {
      id: 'oradell-zone-2',
      name: 'Oradell Ave (Prospect St - Kinderkamack Ave)',
      description: 'Collection Zone 2',
      streets: [
        {
          name: 'Oradell Ave',
          rangeStart: 701,
          rangeEnd: 1200,
          crossStreets: ['Prospect St', 'Kinderkamack Ave']
        }
      ],
      schedule: {
        garbage: {
          days: [1, 4], // Monday & Thursday (assuming same for now)
          time: '6:00 AM'
        },
        recycling: {
          type: 'alternating',
          day: 3, // Wednesday
          weeks: {
            even: 'Commingled (Glass, Plastic, Metal)',
            odd: 'Paper & Cardboard'
          }
        },
        yardWaste: {
          days: [1],
          seasonStart: '04-01',
          seasonEnd: '10-31'
        }
      }
    },
    {
      id: 'oradell-zone-3',
      name: 'Other Streets - Zone A',
      description: 'General collection zone for remaining areas',
      streets: [
        { name: 'Demarest Ave' },
        { name: 'Forest Ave' },
        { name: 'Kinderkamack Ave' }
        // Add more streets as needed
      ],
      schedule: {
        garbage: {
          days: [1, 4],
          time: '6:00 AM'
        },
        recycling: {
          type: 'alternating',
          day: 3,
          weeks: {
            even: 'Commingled (Glass, Plastic, Metal)',
            odd: 'Paper & Cardboard'
          }
        },
        yardWaste: {
          days: [1],
          seasonStart: '04-01',
          seasonEnd: '10-31'
        }
      }
    }
  ],
  
  recyclingCenter: {
    name: 'Oradell Recycling Center',
    address: '2 Marginal Road, Oradell, NJ 07649',
    coordinates: {
      lat: 40.9545,
      lng: -74.0354
    },
    hours: {
      weekday: 'Monday-Friday 8:00 AM - 3:00 PM',
      saturday: '1st & 3rd Saturday 9:00 AM - 12:00 PM',
      sunday: 'Closed'
    },
    phone: '(201) 261-8610'
  },
  
  specialInstructions: [
    'Place containers at curb after 5 PM the day before collection',
    'Remove containers before 7 PM on collection day',
    'Maximum 5 containers per collection day',
    'Maximum 60 lbs per container',
    'No plastic bags for recycling - use bins or bundles'
  ]
};