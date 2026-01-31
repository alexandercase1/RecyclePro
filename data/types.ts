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

export interface AddressRange {
  street: string;
  fromNumber?: number;
  toNumber?: number;
  parity?: 'odd' | 'even' | 'all'; // For odd/even side of street
}

export interface Street {
  name: string;
  rangeStart?: number;  // Address range start
  rangeEnd?: number;    // Address range end
  crossStreets?: string[];
}

export interface GeoBoundary {
  type: 'polygon' | 'circle';
  coordinates: {
    lat: number;
    lng: number;
  }[];
  radius?: number; // For circle type in meters
}

export interface CollectionZone {
  id: string;
  name: string;
  description?: string;

  // Zone matching options (use one or more)
  streets?: Street[];              // Simple street name list
  addressRanges?: AddressRange[];  // Precise address ranges
  boundary?: GeoBoundary;          // Geographic boundary

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

  // Recycling program details
  recyclingProgram?: {
    accepts: MaterialCategory[];       // What they accept curbside
    specialPrograms?: {
      eWaste?: boolean;
      hazardousWaste?: boolean;
      textiles?: boolean;
      composting?: boolean;
    };
    restrictions?: string[];           // Town-specific restrictions
    lastUpdated?: string;
  };
}

// ============================================================================
// RECYCLABILITY SEARCH TYPES
// ============================================================================

/**
 * Material categories for recyclable items
 */
export type MaterialCategory =
  | 'paper_cardboard'
  | 'plastic'
  | 'glass'
  | 'metal'
  | 'electronics'
  | 'organic'
  | 'textiles'
  | 'batteries'
  | 'hazardous'
  | 'mixed'
  | 'other';

/**
 * Disposal methods available for items
 */
export type DisposalMethod =
  | 'curbside_recycling'      // Regular recycling bin
  | 'curbside_trash'          // Regular garbage
  | 'curbside_compost'        // Composting/organic waste
  | 'special_recycling_center' // Drop-off at recycling center
  | 'hazardous_waste'         // Hazardous waste facility
  | 'e_waste'                 // Electronics recycling
  | 'donation'                // Donate/reuse
  | 'return_to_store'         // Retail take-back program
  | 'mail_back';              // Mail-in recycling program

/**
 * Geographic scope of a recycling rule
 */
export type RuleScope = 'national' | 'state' | 'county' | 'municipal' | 'zone';

/**
 * Core recyclable item definition
 */
export interface RecyclableItem {
  id: string;                          // e.g., "item-aluminum-can"
  name: string;                        // e.g., "Aluminum Can"
  aliases: string[];                   // e.g., ["soda can", "beverage can", "beer can"]
  category: MaterialCategory;
  subcategory?: string;                // e.g., "beverage containers"

  // Default disposal (national baseline)
  defaultDisposal: DisposalMethod;
  defaultInstructions?: string;        // e.g., "Rinse and remove cap"

  // Search optimization
  searchTerms: string[];               // Expanded search terms for matching
  commonMisspellings?: string[];       // e.g., ["aluminium"]

  // Additional metadata
  imageUrl?: string;                   // For future image reference
  moreInfoUrl?: string;                // Link to detailed recycling info
  epaCategory?: string;                // Reference to EPA material data
}

/**
 * Location-specific recycling rules that override defaults
 */
export interface RecyclingRule {
  id: string;
  itemId: string;                      // References RecyclableItem.id

  // Geographic targeting (use ONE of these)
  scope: RuleScope;
  stateCode?: string;                  // e.g., "NJ"
  countyName?: string;                 // e.g., "Bergen"
  townId?: string;                     // e.g., "nj-bergen-oradell"
  zoneId?: string;                     // e.g., "oradell-zone-1"

  // Override values
  disposal: DisposalMethod;
  instructions?: string;
  specialNotes?: string;               // e.g., "Not accepted due to facility limitations"
  effectiveDate?: string;              // When rule takes effect
  expirationDate?: string;             // When rule expires

  // Context
  reason?: string;                     // Why this override exists
  source?: string;                     // Where this rule came from
}

/**
 * Item category for browsing
 */
export interface ItemCategory {
  id: MaterialCategory;
  name: string;
  icon: string;                        // Emoji or icon name
  description?: string;
  itemCount?: number;
}

/**
 * Search result with matched item and applicable disposal method
 */
export interface RecyclingSearchResult {
  item: RecyclableItem;
  disposal: DisposalMethod;
  instructions?: string;
  specialNotes?: string;
  appliedRule?: RecyclingRule;         // If location override was applied
  matchScore: number;                  // Relevance score from search (0-1)
  matchedTerm?: string;                // Which search term matched
}