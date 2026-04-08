import { RecyclingRule, Town } from "@/data/types";

// Source: https://www.allendalenj.gov/residents-businesses/garbage-and-recycling/collection-schedule/
// Verified: false — TODO: confirm schedule details against official borough materials

export const allendale: Town = {
  id: "nj-bergen-allendale",
  name: "Allendale",
  state: "NJ",
  county: "Bergen",

  zones: [
    // ============================================================
    // WEST SIDE
    // ============================================================
    {
      id: "allendale-west-side",
      name: "West Side",
      description: "West side curbside collection zone",
      streets: [
        { name: "Allen St." },
        { name: "Beechwood Rd." },
        { name: "Beresford Rd." },
        { name: "Bonnie Way" },
        { name: "Bradrick Ln." },
        { name: "Brookside Ave." },
        { name: "Burtwood Ct." },
        { name: "Butternut Rd." },
        { name: "Byron Ct." },
        { name: "Cambridge Dr." },
        { name: "Canaan Pl." },
        { name: "Carriage Ct." },
        { name: "Carteret Ct." },
        { name: "Carteret Rd." },
        { name: "Cedar Dr." },
        { name: "Cebak Ct." },
        { name: "Ceely Ct." },
        { name: "Colonial Dr." },
        { name: "Conklin Ct." },
        { name: "Crescent Commons", rangeStart: 101, rangeEnd: 106 },
        { name: "Dale Ave." },
        { name: "Delta Ct." },
        { name: "Dogwood Dr." },
        { name: "Donnybrook Dr." },
        { name: "Duffy Dr." },
        { name: "E. Elbrook Dr." },
        { name: "Edgewood Rd." },
        { name: "Elbrook Rd." },
        { name: "Fairhaven Dr." },
        { name: "First St." },
        { name: "Forest Rd." },
        { name: "Fox Rd." },
        { name: "George St." },
        { name: "Hillside Ave." },
        { name: "Lawrence Ln." },
        { name: "Leigh Ct." },
        { name: "Linda Dr." },
        { name: "Lori Ln." },
        { name: "MacIntyre Ln." },
        { name: "Mallinson St." },
        { name: "Mark Rd." },
        { name: "New St." },
        { name: "Newton Pl." },
        { name: "Nidd Ct." },
        { name: "Oak St." },
        { name: "Oakwood Rd." },
        { name: "Park Ave." },
        { name: "Paul Ave." },
        { name: "Princeton Ln." },
        { name: "Schuyler Rd." },
        { name: "Scott Ct." },
        { name: "Sheri Dr." },
        { name: "Stone Fence Rd." },
        { name: "Stoney Ridge Rd." },
        { name: "Surrey Ln." },
        { name: "Thomas Ln." },
        { name: "Trotters Ln." },
        { name: "Valley Rd." },
        { name: "Walnut Dr." },
        { name: "Wehner Pl." },
        { name: "W. Allendale Ave.", rangeStart: 190, rangeEnd: 274 },
        { name: "W. Crescent Ave.", rangeStart: 303, rangeEnd: 999999 },
        { name: "W. Orchard St.", rangeStart: 125, rangeEnd: 180 },
        { name: "W. Maple Ave." },
      ],
      schedule: {
        garbage: {
          // Calendar legend shows "WG" on Mondays.
          days: [1], // Monday
          time: "6:00 AM",
        },
        recycling: {
          // Town materials indicate Thursday recycling with alternating streams.
          type: "alternating",
          day: 4, // Thursday
          weeks: {
            even: "commingled",
            odd: "paper",
          },
          evenLabel: "Commingled (Glass, Plastic, Metal, Cans)",
          oddLabel: "Paper & Cardboard",
        },
        yardWaste: {
          // Not clearly specified in the provided materials.
          days: [],
          seasonStart: "04-01",
          seasonEnd: "12-12",
        },
      },
    },

    // ============================================================
    // EAST SIDE
    // ============================================================
    {
      id: "allendale-east-side",
      name: "East Side",
      description: "East side curbside collection zone",
      streets: [
        { name: "Ackerson Rd." },
        { name: "Ada Pl." },
        { name: "Albert Rd." },
        { name: "Allison Ct." },
        { name: "Arcadia Rd." },
        { name: "Arlton Ave." },
        { name: "Bajor Ln." },
        { name: "Beatrice St." },
        { name: "Berkshire Pl." },
        { name: "Birch St." },
        { name: "Boroline Rd." },
        { name: "Canterbury Dr." },
        { name: "Central Ave." },
        { name: "Charles St." },
        { name: "Cherokee Ave." },
        { name: "Chestnut St." },
        { name: "Cottage Pl." },
        { name: "Couch Ct." },
        { name: "Crescent Bend" },
        { name: "Crescent Pl." },
        { name: "Crestwood Mews" },
        { name: "E. Allendale Ave." },
        { name: "E. Orchard St." },
        { name: "E. Crescent Ave." },
        { name: "Elm St." },
        { name: "Elmwood Ave." },
        { name: "Erold Ct." },
        { name: "Ethel Ave." },
        { name: "Farley Pl." },
        { name: "Fox Run" },
        { name: "Franklin Tpke." },
        { name: "Freeman Way" },
        { name: "Gloria Dr." },
        { name: "Green Way" },
        { name: "Grey Ave." },
        { name: "Hamilton St." },
        { name: "Harding Ave." },
        { name: "Harreton Rd." },
        { name: "Heather Ct." },
        { name: "Heights Rd." },
        { name: "High St." },
        { name: "Homewood Ave." },
        { name: "Hubbard Ct." },
        { name: "Iroquois Ave." },
        { name: "Ivers Rd." },
        { name: "Kayeaton Rd." },
        { name: "Knollton Rd." },
        { name: "Lakeview Dr." },
        { name: "Louise Ct." },
        { name: "Maple St." },
        { name: "McDermott Ct." },
        { name: "Meadow Ln." },
        { name: "Meeker Ave." },
        { name: "Michelle Ct." },
        { name: "Midwood Ave." },
        { name: "Montrose Terr." },
        { name: "Myrtle Ave." },
        { name: "Nadler Ct." },
        { name: "Pine Rd." },
        { name: "Pittis Ave." },
        { name: "Powell Rd." },
        { name: "Rio Vista Dr." },
        { name: "Rozmus Ct." },
        { name: "Sawyer Ct." },
        { name: "Schneider Rd." },
        { name: "Talman Pl." },
        { name: "Vreeland Pl." },
        { name: "Waibel Dr." },
        { name: "Weimer Ct." },
        { name: "W. Crescent Ave.", rangeStart: 10, rangeEnd: 301 },
        { name: "W. Orchard St.", rangeStart: 25, rangeEnd: 45 },
        { name: "Wilton Rd." },
        { name: "Whitney Dr." },
        { name: "Woodland Ave." },
        { name: "Yeomans Ln." },
      ],
      schedule: {
        garbage: {
          // Calendar legend shows "EG" on Tuesdays.
          days: [2], // Tuesday
          time: "6:00 AM",
        },
        recycling: {
          type: "alternating",
          day: 4, // Thursday
          weeks: {
            even: "commingled",
            odd: "paper",
          },
          evenLabel: "Commingled (Glass, Plastic, Metal, Cans)",
          oddLabel: "Paper & Cardboard",
        },
        yardWaste: {
          days: [],
          seasonStart: "04-01",
          seasonEnd: "12-12",
        },
      },
    },
  ],

  recyclingCenter: {
    name: "Allendale Recycling Center",
    address: "300 West Crescent Avenue, Allendale, NJ",
    hours: {
      weekday: "Wednesdays 4:00 PM – 7:00 PM (seasonal; closed in winter)",
      saturday: "Saturdays 9:00 AM – 3:00 PM (winter: 9:00 AM – 2:00 PM)",
      sunday: "Closed",
    },
  },

  specialInstructions: [
    "Recycling schedule uses alternating streams (paper/cardboard vs commingled) on Thursdays — verify even/odd week stream if unsure.",
    "Commingled curbside recycling takes place every other Thursday. Place recycling at curb by 6:00 PM the night before.",
    "No plastic bags for recycling; commingled recyclables must be loose (not in plastic bags).",
    "Recycling containers no larger than 30 gallons.",
    "Garbage receptacles should be set out after 6:00 PM the night before collection and removed by 9:00 PM on collection day.",
    "No collection on: New Year's Day (1/1), Memorial Day (5/25), Independence Day (7/4), Labor Day (9/7), Thanksgiving Day (11/26), Christmas Day (12/25).",
    "Bulk trash pickup: furniture and carpeting must be rolled up and tied/taped; no non-metal items (window/mirrors/panes) unless taped with an “X”.",
    "Scrap metal collection: once a month for both sides of the borough; curbside items must be at least 75% metal.",
    "Recycling Center address: 300 West Crescent Avenue. Regular hours: Sat 9:00 AM–3:00 PM; Wed 4:00 PM–7:00 PM (seasonal). Winter hours: Sat 9:00 AM–2:00 PM; Wednesdays closed.",
    "Recycling Center is closed on holiday weekends (e.g., Easter, July 4th, Memorial Day, Labor Day).",
  ],
};

export const allendaleRules: RecyclingRule[] = [];

// NEEDS MANUAL REVIEW
// Scrape attempted: 2026-04-08
// Source: https://www.allendalenj.gov/residents-businesses/garbage-and-recycling/collection-schedule/
// Extraction method: needs-manual-review
// Reason: No garbage or recycling days found in text
//
// To complete this file:
//   1. Visit the URL above and find the garbage/recycling schedule
//   2. Fill in the Town object below using the oradell.ts or fair-lawn.ts files as a reference
//   3. Add recycling center info if available
//   4. Or for AI-assisted extraction: npx ts-node scrape-town-ai.ts --town allendale
//
// import { Town, RecyclingRule } from '@/data/types';
// export const allendale: Town = {
//   id: 'nj-bergen-allendale',
//   name: 'Allendale',
//   state: 'NJ',
//   county: 'Bergen',
//   zones: [],
// };
// export const allendaleRules: RecyclingRule[] = [];
