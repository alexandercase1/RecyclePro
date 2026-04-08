import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

// Lazy-initialize the Mapbox client so a missing token doesn't crash at startup
let geocodingClient: ReturnType<typeof mbxGeocoding> | null = null;

function getGeocodingClient() {
  if (!geocodingClient) {
    const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    if (!token) return null;
    geocodingClient = mbxGeocoding({ accessToken: token });
  }
  return geocodingClient;
}

export interface LocationResult {
  id: string;
  placeName: string;
  town: string;
  county: string;
  state: string;
  stateCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

/**
 * Search for locations (cities/towns) in the US
 */
export const searchLocations = async (query: string): Promise<LocationResult[]> => {
  try {
    if (query.length < 2) {
      return [];
    }

    const client = getGeocodingClient();
    if (!client) return [];

    const response = await client
      .forwardGeocode({
        query: query,
        countries: ['US'],
        types: ['place', 'locality'], // Cities and towns
        limit: 10,
      })
      .send();

    if (!response || !response.body || !response.body.features) {
      return [];
    }

    // Parse the results into our format
    const results: LocationResult[] = response.body.features.map((feature: any) => {
      // Mapbox returns context array with place hierarchy
      const context = feature.context || [];
      
      // Extract county and state from context
      const countyData = context.find((c: any) => c.id.startsWith('district'));
      const stateData = context.find((c: any) => c.id.startsWith('region'));
      
      // Extract county name (remove "County" suffix if present)
      let county = countyData?.text || '';
      county = county.replace(' County', '');
      
      return {
        id: feature.id,
        placeName: feature.place_name,
        town: feature.text,
        county: county,
        state: stateData?.text || '',
        stateCode: stateData?.short_code?.replace('US-', '') || '',
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1],
        },
      };
    });

    return results;
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};

/**
 * Get a location by specific town, state, and optionally county
 */
export const getLocation = async (
  town: string,
  state: string,
  county?: string
): Promise<LocationResult | null> => {
  try {
    const query = county
      ? `${town}, ${county} County, ${state}`
      : `${town}, ${state}`;

    const client = getGeocodingClient();
    if (!client) return null;

    const response = await client
      .forwardGeocode({
        query: query,
        countries: ['US'],
        types: ['place'],
        limit: 1,
      })
      .send();

    if (!response?.body?.features?.[0]) {
      return null;
    }

    const feature = response.body.features[0];
    const context = feature.context || [];
    const countyData = context.find((c: any) => c.id.startsWith('district'));
    const stateData = context.find((c: any) => c.id.startsWith('region'));

    return {
      id: feature.id,
      placeName: feature.place_name,
      town: feature.text,
      county: countyData?.text?.replace(' County', '') || '',
      state: stateData?.text || '',
      stateCode: stateData?.short_code?.replace('US-', '') || '',
      coordinates: {
        lng: feature.center[0],
        lat: feature.center[1],
      },
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};
