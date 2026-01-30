// Data types for Recycle Pro

export interface ScheduleDay {
  days: number[];      // 0=Sunday, 1=Monday, etc.
  time?: string;       // e.g., "6:00 AM"
}

export interface AlternatingSchedule {
  type: 'alternating';
  day: number;         // Which day of the week
  weeks: {
    even: string;      // What gets collected on even weeks
    odd: string;       // What gets collected on odd weeks
  };
}

export interface SeasonalSchedule {
  days: number[];
  seasonStart: string; // Format: "MM-DD"
  seasonEnd: string;   // Format: "MM-DD"
}

export interface ZoneSchedule {
  garbage: ScheduleDay;
  recycling: AlternatingSchedule;
  yardWaste?: SeasonalSchedule;
}

export interface Street {
  name: string;
  rangeStart?: number;  // Address range start
  rangeEnd?: number;    // Address range end
  crossStreets?: string[];
}

export interface CollectionZone {
  id: string;
  name: string;
  description?: string;
  streets: Street[];
  schedule: ZoneSchedule;
}

export interface RecyclingCenter {
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  hours: {
    weekday: string;
    saturday?: string;
    sunday?: string;
  };
  phone?: string;
}

export interface Town {
  id: string;
  name: string;
  state: string;
  county: string;
  zones: CollectionZone[];
  recyclingCenter?: RecyclingCenter;
  specialInstructions?: string[];
}