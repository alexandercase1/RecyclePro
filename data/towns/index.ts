import { Town } from '../types';
import { oradell } from './oradell';

// Array of all available towns
export const allTowns: Town[] = [
  oradell,
  // Add more towns here as we create them
  // riverEdge,
  // newMilford,
];

// Helper function to find a town by ID
export const getTownById = (id: string): Town | undefined => {
  return allTowns.find(town => town.id === id);
};

// Helper function to search towns by name
export const searchTowns = (query: string): Town[] => {
  const lowerQuery = query.toLowerCase();
  return allTowns.filter(town => 
    town.name.toLowerCase().includes(lowerQuery) ||
    town.county.toLowerCase().includes(lowerQuery)
  );
};

// Helper function to get all zones for a town
export const getTownZones = (townId: string) => {
  const town = getTownById(townId);
  return town?.zones || [];
};