import { AddressRange, CollectionZone, GeoBoundary } from '@/data/types';

/**
 * Parse a street address to extract the street number and name
 */
export function parseAddress(address: string): {
  number: number | null;
  street: string;
} {
  const trimmed = address.trim();

  // Extract leading number
  const numberMatch = trimmed.match(/^(\d+)/);
  const number = numberMatch ? parseInt(numberMatch[1], 10) : null;

  // Extract street name (everything after the number)
  let street = trimmed;
  if (numberMatch) {
    street = trimmed.substring(numberMatch[0].length).trim();
  }

  return { number, street: normalizeStreetName(street) };
}

/**
 * Normalize street name by removing common suffixes and variations
 */
export function normalizeStreetName(street: string): string {
  return street
    .toLowerCase()
    .replace(/\bstreet\b|\bst\.?\b/gi, '')
    .replace(/\bavenue\b|\bave\.?\b/gi, '')
    .replace(/\broad\b|\brd\.?\b/gi, '')
    .replace(/\bdrive\b|\bdr\.?\b/gi, '')
    .replace(/\blane\b|\bln\.?\b/gi, '')
    .replace(/\bcircle\b|\bcir\.?\b/gi, '')
    .replace(/\bcourt\b|\bct\.?\b/gi, '')
    .replace(/\bplace\b|\bpl\.?\b/gi, '')
    .replace(/\bboulevard\b|\bblvd\.?\b/gi, '')
    .replace(/\bparkway\b|\bpkwy\.?\b/gi, '')
    .replace(/\bterrace\b|\bter\.?\b/gi, '')
    .replace(/\bway\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a street name matches a zone's street list
 */
function matchesStreetList(
  parsedAddress: { number: number | null; street: string },
  zone: CollectionZone
): boolean {
  if (!zone.streets || zone.streets.length === 0) {
    return false;
  }

  for (const zoneStreet of zone.streets) {
    const normalizedZoneStreet = normalizeStreetName(zoneStreet.name);

    if (parsedAddress.street === normalizedZoneStreet) {
      // If no range specified, it matches
      if (
        zoneStreet.rangeStart === undefined &&
        zoneStreet.rangeEnd === undefined
      ) {
        return true;
      }

      // If range specified, check if address number is in range
      if (
        parsedAddress.number !== null &&
        zoneStreet.rangeStart !== undefined &&
        zoneStreet.rangeEnd !== undefined
      ) {
        if (
          parsedAddress.number >= zoneStreet.rangeStart &&
          parsedAddress.number <= zoneStreet.rangeEnd
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Check if an address matches a zone's address ranges
 */
function matchesAddressRanges(
  parsedAddress: { number: number | null; street: string },
  zone: CollectionZone
): boolean {
  if (!zone.addressRanges || zone.addressRanges.length === 0) {
    return false;
  }

  for (const range of zone.addressRanges) {
    const normalizedRangeStreet = normalizeStreetName(range.street);

    // Street name must match
    if (parsedAddress.street !== normalizedRangeStreet) {
      continue;
    }

    // If no number specified in address, can't match by range
    if (parsedAddress.number === null) {
      continue;
    }

    // Check number range
    const inRange =
      (range.fromNumber === undefined ||
        parsedAddress.number >= range.fromNumber) &&
      (range.toNumber === undefined || parsedAddress.number <= range.toNumber);

    if (!inRange) {
      continue;
    }

    // Check parity (odd/even)
    if (range.parity && range.parity !== 'all') {
      const isOdd = parsedAddress.number % 2 === 1;
      const isEven = parsedAddress.number % 2 === 0;

      if (range.parity === 'odd' && !isOdd) {
        continue;
      }
      if (range.parity === 'even' && !isEven) {
        continue;
      }
    }

    // All checks passed
    return true;
  }

  return false;
}

/**
 * Check if coordinates fall within a geographic boundary
 */
function matchesGeoBoundary(
  coordinates: { lat: number; lng: number },
  boundary: GeoBoundary
): boolean {
  if (boundary.type === 'circle') {
    // Check if point is within circle radius
    if (
      boundary.coordinates.length === 0 ||
      boundary.radius === undefined
    ) {
      return false;
    }

    const center = boundary.coordinates[0];
    const distance = getDistanceInMeters(coordinates, center);
    return distance <= boundary.radius;
  } else if (boundary.type === 'polygon') {
    // Check if point is inside polygon using ray casting algorithm
    return isPointInPolygon(coordinates, boundary.coordinates);
  }

  return false;
}

/**
 * Calculate distance between two coordinates in meters (Haversine formula)
 */
function getDistanceInMeters(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[]
): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Find the matching zone for a given street address
 *
 * @param streetAddress - The street address to match
 * @param zones - Array of collection zones to search
 * @param coordinates - Optional GPS coordinates for geo-matching
 * @returns The matching zone or null if no match found
 */
export function findMatchingZone(
  streetAddress: string,
  zones: CollectionZone[],
  coordinates?: { lat: number; lng: number }
): CollectionZone | null {
  if (!streetAddress || zones.length === 0) {
    return null;
  }

  const parsedAddress = parseAddress(streetAddress);

  // Try matching strategies in order
  for (const zone of zones) {
    // Strategy 1: Address range matching (most precise)
    if (matchesAddressRanges(parsedAddress, zone)) {
      return zone;
    }

    // Strategy 2: Street list matching
    if (matchesStreetList(parsedAddress, zone)) {
      return zone;
    }

    // Strategy 3: Geographic boundary matching (requires coordinates)
    if (coordinates && zone.boundary) {
      if (matchesGeoBoundary(coordinates, zone.boundary)) {
        return zone;
      }
    }
  }

  return null;
}

/**
 * Get all possible zones that might match an address (for user confirmation)
 */
export function getPossibleZones(
  streetAddress: string,
  zones: CollectionZone[],
  coordinates?: { lat: number; lng: number }
): CollectionZone[] {
  const matches: CollectionZone[] = [];
  const parsedAddress = parseAddress(streetAddress);

  for (const zone of zones) {
    if (
      matchesAddressRanges(parsedAddress, zone) ||
      matchesStreetList(parsedAddress, zone) ||
      (coordinates && zone.boundary && matchesGeoBoundary(coordinates, zone.boundary))
    ) {
      matches.push(zone);
    }
  }

  return matches;
}
