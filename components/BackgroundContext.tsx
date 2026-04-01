import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import { findPresetById } from '@/constants/backgrounds';

// The AsyncStorage key where we save the user's background choice.
const BACKGROUND_KEY = '@recycle_pro_background';

// What we actually write to AsyncStorage.
// We store primitive values only (strings) because require() returns a number
// (an asset ID) that is only valid for the current app session.
// On the next launch we use presetId to look up the correct source again via
// findPresetById(), which gives us the real ImageSourcePropType.
interface PersistedBackground {
  color: string | undefined;
  imageUrl: string | undefined;
  // The id string from BackgroundPreset — e.g. 'nature-forest'.
  // undefined means no preset is active.
  presetId: string | undefined;
}

// Everything a consuming component can read or change about the background.
export interface BackgroundContextType {
  // ── Solid color ──────────────────────────────────────────────────────────
  // A hex string like '#efefef'.  Active when no imageUrl or preset is set.
  color: string | undefined;
  setColor: (color: string | undefined) => void;

  // ── Custom URL ───────────────────────────────────────────────────────────
  // A remote https:// URI entered by the user.
  imageUrl: string | undefined;
  setImageUrl: (url: string | undefined) => void;

  // ── Built-in preset ──────────────────────────────────────────────────────
  // presetId is the string key stored in AsyncStorage (e.g. 'nature-forest').
  // presetSource is the resolved ImageSourcePropType used by BackgroundContainer.
  // Both are undefined when no preset is selected.
  presetId: string | undefined;
  presetSource: ImageSourcePropType | undefined;
  // Call this when the user picks a thumbnail in the Settings picker.
  // id   — the BackgroundPreset.id value
  // source — the BackgroundPreset.source value (the require() result)
  setPreset: (id: string, source: ImageSourcePropType) => void;

  // ── Reset ────────────────────────────────────────────────────────────────
  // Clears preset, imageUrl, and resets color to the default gray.
  clearBackground: () => void;
}

// Create the context.  undefined default forces the hook to guard against
// being called outside a provider.
const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  // The three independent pieces of background state.
  // Only one should be "active" at a time — the priority order is:
  //   presetSource  →  imageUrl  →  color
  // BackgroundContainer applies that same priority when deciding what to render.
  const [color, setColorState] = useState<string | undefined>('#efefef');
  const [imageUrl, setImageUrlState] = useState<string | undefined>(undefined);
  const [presetId, setPresetId] = useState<string | undefined>(undefined);
  const [presetSource, setPresetSource] = useState<ImageSourcePropType | undefined>(undefined);

  // ── Restore persisted choice on app launch ──────────────────────────────
  // Runs exactly once after the first render.  Reads AsyncStorage and
  // reconstructs the full state from the saved primitive values.
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(BACKGROUND_KEY);
        if (raw === null) return; // Nothing saved yet — keep defaults.

        const saved: PersistedBackground = JSON.parse(raw);

        // Restore solid color if one was saved.
        if (saved.color !== undefined) setColorState(saved.color);

        // Restore custom URL if one was saved.
        if (saved.imageUrl !== undefined) setImageUrlState(saved.imageUrl);

        // Restore preset: look up the source using the saved id because we
        // cannot store require() numbers in AsyncStorage.
        if (saved.presetId !== undefined) {
          const preset = findPresetById(saved.presetId);
          if (preset) {
            // The preset still exists in the catalog — restore it.
            setPresetId(preset.id);
            setPresetSource(preset.source);
          }
          // If the preset was removed from the catalog since last launch,
          // we simply skip it and fall back to color.
        }
      } catch (error) {
        console.error('Error loading background preference:', error);
      }
    };
    load();
  }, []);

  // ── Helper: write current state to AsyncStorage ─────────────────────────
  // Accepts the next values so callers can pass them in before the React
  // state update has flushed (useState setters are async).
  const persist = async (
    nextColor: string | undefined,
    nextImageUrl: string | undefined,
    nextPresetId: string | undefined
  ) => {
    try {
      const toSave: PersistedBackground = {
        color: nextColor,
        imageUrl: nextImageUrl,
        presetId: nextPresetId,
      };
      await AsyncStorage.setItem(BACKGROUND_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving background preference:', error);
    }
  };

  // ── setColor ─────────────────────────────────────────────────────────────
  // Selecting a solid color clears any active image or preset so only one
  // mode is active at a time.
  const setColor = (newColor: string | undefined) => {
    setColorState(newColor);
    setImageUrlState(undefined); // clear custom URL
    setPresetId(undefined);      // clear preset id
    setPresetSource(undefined);  // clear preset image source
    persist(newColor, undefined, undefined);
  };

  // ── setImageUrl ──────────────────────────────────────────────────────────
  // Entering a custom URL clears preset so the URL takes effect.
  // We keep the last solid color so if the user later clears the URL the
  // color background is still there as a fallback.
  const setImageUrl = (newUrl: string | undefined) => {
    setImageUrlState(newUrl);
    setPresetId(undefined);
    setPresetSource(undefined);
    persist(color, newUrl, undefined);
  };

  // ── setPreset ────────────────────────────────────────────────────────────
  // Picking a built-in background clears the custom URL.
  // We only store the id in AsyncStorage (not the source) because require()
  // returns a session-only number that cannot be serialised safely.
  const setPreset = (id: string, source: ImageSourcePropType) => {
    setPresetId(id);
    setPresetSource(source);
    setImageUrlState(undefined); // clear custom URL — preset takes over
    persist(color, undefined, id);
  };

  // ── clearBackground ──────────────────────────────────────────────────────
  // Resets everything back to the original default gray.
  const clearBackground = () => {
    const defaultColor = '#efefef';
    setColorState(defaultColor);
    setImageUrlState(undefined);
    setPresetId(undefined);
    setPresetSource(undefined);
    persist(defaultColor, undefined, undefined);
  };

  return (
    <BackgroundContext.Provider
      value={{
        color,
        setColor,
        imageUrl,
        setImageUrl,
        presetId,
        presetSource,
        setPreset,
        clearBackground,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
}

// Custom hook — always use this instead of useContext(BackgroundContext).
export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
