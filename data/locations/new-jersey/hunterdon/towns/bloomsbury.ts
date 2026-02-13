import { Town } from '@/data/types';

export const bloomsbury: Town = {
    id: 'nj-hunterdon-bloomsbury',
    name: 'Bloomsbury',
    state: 'NJ',
    county: 'Hunterdon',

    zones: [
        {
            id: 'bloomsbury',
            name: 'Church Street',
            description: 'Whole Town',
            streets: [
                {
                    name: 'Church Street',
                    rangeStart: 1,
                    rangeEnd: 500, //Temp Value
                    crossStreets: []
                }
            ],

            schedule: {
                garbage: {
                    days: [3], //Wed
                    time: 'All Day'
                },
                recycling: {
                    type: 'alternating',
                    day: 3, //Wed
                    weeks: {
                        even: 'commingled',
                        odd: 'none'
                    }
                }
            }
        }
    ]
}