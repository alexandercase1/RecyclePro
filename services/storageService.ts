import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_KEY = '@recycle_pro_location';

export interface SavedLocation {
  townId: string;        // e.g., "nj-bergen-oradell"
  zoneId?: string;       // e.g., "oradell-zone-1" - determined by address
  displayName: string;   // e.g., "Oradell, Bergen County, NJ"
  town: string;
  county: string;
  state: string;
  stateCode: string;
  streetAddress?: string; // e.g., "123 Main St"
  coordinates?: {        // GPS coordinates for zone matching
    lat: number;
    lng: number;
  };
}

/**
 * Save the user's selected location
 */
export const saveLocation = async (location: SavedLocation): Promise<void> => {
  try {
    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  } catch (error) {
    console.error('Error saving location:', error);
  }
};

/**
 * Get the user's saved location
 */
export const getSavedLocation = async (): Promise<SavedLocation | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(LOCATION_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

/**
 * Clear the saved location
 */
export const clearLocation = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LOCATION_KEY);
  } catch (error) {
    console.error('Error clearing location:', error);
  }
};
