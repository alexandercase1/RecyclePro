import { RecyclingRule, Town } from "@/data/types";

// Source: Alpine 2026 Curbside Recycling Schedule PDF (provided by user)
// Verified: false — TODO: cross-check against www.alpinenj07620.org for updates

export const alpine: Town = {
  id: "nj-bergen-alpine",
  name: "Alpine",
  state: "NJ",
  county: "Bergen",

  zones: [
    // Alpine schedule is borough-wide for recycling; garbage differs north/south of Closter Dock Rd.
    {
      id: "nj-bergen-alpine-zone-1",
      name: "Zone 1: North of Closter Dock Rd.",
      description: "Garbage pickup Tuesday & Friday (north of Closter Dock Rd.)",
      streets: [],
      schedule: {
        garbage: {
          days: [2, 5], // Tuesday & Friday
          time: "6:00 AM",
        },
        recycling: {
          // Recycling is every Wednesday, with stream by week-of-month:
          // 1st & 3rd Wed = commingled, 2nd & 4th Wed = paper/cardboard; no 5th Wed pickup.
          type: "alternating",
          day: 3, // Wednesday
          weeks: {
            even: "commingled",
            odd: "paper",
          },
          evenLabel: "Commingled (Cans, Plastic, Glass)",
          oddLabel: "Paper & Cardboard",
        },
        yardWaste: {
          days: [],
          seasonStart: "04-01",
          seasonEnd: "12-31",
        },
      },
    },
    {
      id: "nj-bergen-alpine-zone-2",
      name: "Zone 2: South of Closter Dock Rd.",
      description: "Garbage pickup Monday & Thursday (south of Closter Dock Rd.)",
      streets: [],
      schedule: {
        garbage: {
          days: [1, 4], // Monday & Thursday
          time: "6:00 AM",
        },
        recycling: {
          type: "alternating",
          day: 3, // Wednesday
          weeks: {
            even: "commingled",
            odd: "paper",
          },
          evenLabel: "Commingled (Cans, Plastic, Glass)",
          oddLabel: "Paper & Cardboard",
        },
        yardWaste: {
          days: [],
          seasonStart: "04-01",
          seasonEnd: "12-31",
        },
      },
    },
  ],

  specialInstructions: [
    "Dual stream recycling. Containers only — no garbage bags.",
    "Commingled (cans/plastic/glass): 1st and 3rd Wednesday of the month.",
    "Paper/Cardboard: 2nd and 4th Wednesday of the month.",
    "No recycling pickup on a 5th Wednesday (e.g., 4/29, 7/29, 9/30, 12/30 in 2026).",
    "Place recyclables at curbside the night before or no later than 6:00 AM on pickup day.",
    "Used clothing bins: Hilltop Lane (entrance to DPW & Swim Club).",
    "Electronic items drop-off: behind Borough Hall.",
    "Garbage pickup: south of Closter Dock Rd. is Monday & Thursday; north of Closter Dock Rd. is Tuesday & Friday.",
    "Holiday pickups (New Year's Day, Memorial Day, July 4th, Labor Day, Thanksgiving, Christmas): pickup resumes next regular pickup day.",
  ],
};

export const alpineRules: RecyclingRule[] = [];
