import { ImageSourcePropType } from 'react-native';

// Describes one built-in background option shown in the picker.
export interface BackgroundPreset {
  // A unique string ID — this is what gets saved to AsyncStorage so we can
  // restore the right image when the app relaunches.
  id: string;

  // The human-readable name shown under the thumbnail in the picker.
  label: string;

  // Which section of the picker this image appears in.
  // Must match one of the strings used in BACKGROUND_PRESETS below.
  category: 'Nature' | 'Minimal' | 'Community';

  // The actual image source.  For local files this is a require() call;
  // React Native's Metro bundler resolves it to an asset ID at build time.
  source: ImageSourcePropType;
}

// ─── HOW TO ADD YOUR OWN BACKGROUNDS ────────────────────────────────────────
//
//  1. Drop your image file (.jpg / .png) into the matching subfolder:
//       assets/backgrounds/nature/        ← outdoor / scenic photos
//       assets/backgrounds/minimal/       ← clean, abstract, or pattern images
//       assets/backgrounds/community/     ← recycling / eco / earth-day themed
//
//  2. Copy one of the example entries below, remove the leading "//", and fill
//     in the fields:
//       id     — must be unique (no two entries can share the same id)
//       label  — shown under the thumbnail, keep it short (1-2 words)
//       category — must be exactly 'Nature', 'Minimal', or 'Community'
//       source — replace the filename with your actual file name
//
//  3. Save this file.  Metro will detect the new require() and bundle the
//     image automatically on your next `npx expo start`.
//
//  Example — uncomment and edit to activate an entry:
//
//  { id: 'nature-forest',    label: 'Forest',    category: 'Nature',    source: require('../assets/backgrounds/nature/forest.jpg') },
//  { id: 'nature-ocean',     label: 'Ocean',     category: 'Nature',    source: require('../assets/backgrounds/nature/ocean.jpg') },
//  { id: 'nature-mountain',  label: 'Mountain',  category: 'Nature',    source: require('../assets/backgrounds/nature/mountain.jpg') },
//  { id: 'nature-sunset',    label: 'Sunset',    category: 'Nature',    source: require('../assets/backgrounds/nature/sunset.jpg') },
//
//  { id: 'minimal-light',    label: 'Light',     category: 'Minimal',   source: require('../assets/backgrounds/minimal/light.jpg') },
//  { id: 'minimal-dark',     label: 'Dark',      category: 'Minimal',   source: require('../assets/backgrounds/minimal/dark.jpg') },
//  { id: 'minimal-paper',    label: 'Paper',     category: 'Minimal',   source: require('../assets/backgrounds/minimal/paper.jpg') },
//
//  { id: 'community-green',  label: 'Go Green',  category: 'Community', source: require('../assets/backgrounds/community/go-green.jpg') },
//  { id: 'community-earth',  label: 'Earth Day', category: 'Community', source: require('../assets/backgrounds/community/earth-day.jpg') },
//  { id: 'community-recycle',label: 'Recycle',   category: 'Community', source: require('../assets/backgrounds/community/recycle.jpg') },
//
// ────────────────────────────────────────────────────────────────────────────

// Add your uncommented entries here.  The array can be empty while you are
// still gathering images — the Settings screen handles that gracefully.
export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // Your entries go here once you have images ready.
];

// ─── Utilities used by the picker and the context ────────────────────────────

// Groups the flat presets array into { Nature: [...], Minimal: [...], ... }
// so the Settings screen can render one section per category.
export function groupByCategory(
  presets: BackgroundPreset[]
): Record<string, BackgroundPreset[]> {
  // reduce() walks the array once and builds the grouped object on the fly.
  return presets.reduce<Record<string, BackgroundPreset[]>>((acc, preset) => {
    // Create the category bucket the first time we see it.
    if (!acc[preset.category]) acc[preset.category] = [];
    acc[preset.category].push(preset);
    return acc;
  }, {});
}

// Finds a preset by its id string.
// Called on app launch: we load the saved id from AsyncStorage, then call
// this to get the actual ImageSourcePropType so BackgroundContainer can
// render the correct image without storing the require() number itself.
export function findPresetById(id: string): BackgroundPreset | undefined {
  return BACKGROUND_PRESETS.find((p) => p.id === id);
}
