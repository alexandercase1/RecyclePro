import { BackgroundContainer } from '@/components/BackgroundContainer';
import { useBackground } from '@/components/BackgroundContext';
import { BACKGROUND_PRESETS, BackgroundPreset, groupByCategory } from '@/constants/backgrounds';
import { clearLocation, getSavedLocation, SavedLocation } from '@/services/storageService';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Solid color presets shown in the color row of the picker.
const SOLID_COLORS = [
  { hex: '#efefef', label: 'Default Gray' },
  { hex: '#e8f5e9', label: 'Soft Green' },
  { hex: '#e3f2fd', label: 'Sky Blue' },
  { hex: '#fff8e1', label: 'Warm Yellow' },
  { hex: '#fce4ec', label: 'Blush Pink' },
  { hex: '#f3e5f5', label: 'Lavender' },
  { hex: '#e0f2f1', label: 'Mint' },
  { hex: '#1a1a2e', label: 'Dark Navy' },
];

export default function SettingsScreen() {
  const router = useRouter();

  // Pull everything we need from the background context.
  // setPreset       — called when the user taps a built-in thumbnail
  // setColor        — called when the user taps a solid color swatch
  // setImageUrl     — called when the user applies a custom URL
  // clearBackground — called by the Reset button
  // presetId        — used to highlight the active thumbnail
  // color           — used to highlight the active color swatch
  // imageUrl        — pre-fills the custom URL input on mount
  const { setPreset, setColor, setImageUrl, clearBackground, presetId, color, imageUrl } =
    useBackground();

  // Draft text for the custom URL input.  We keep a local copy so the field
  // can be edited freely without flickering the live background on each key.
  const [urlDraft, setUrlDraft] = useState<string>(imageUrl ?? '');

  // Currently saved location, loaded on every focus so it stays up to date.
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const loc = await getSavedLocation();
        setSavedLocation(loc);
      };
      load();
    }, [])
  );

  // ── Background preset handler ──────────────────────────────────────────────
  // Tapping a thumbnail calls setPreset with the preset's id and source.
  // setPreset (in context) stores the id in AsyncStorage and the source in
  // React state so BackgroundContainer can render it immediately.
  const handlePickPreset = (preset: BackgroundPreset) => {
    setPreset(preset.id, preset.source);
    // Clear the URL draft so the input doesn't show a stale URL after switching
    // to a preset — the two modes are mutually exclusive.
    setUrlDraft('');
  };

  // ── Color swatch handler ───────────────────────────────────────────────────
  const handlePickColor = (hex: string) => {
    setColor(hex);
    // setColor (in context) already clears any active image/preset.
    setUrlDraft('');
  };

  // ── Custom URL handler ─────────────────────────────────────────────────────
  // Trims whitespace so a trailing space doesn't silently break the URI.
  const handleApplyUrl = () => {
    const trimmed = urlDraft.trim();
    // An empty string means the user cleared the field — remove the image.
    setImageUrl(trimmed === '' ? undefined : trimmed);
  };

  // ── Clear location handler ─────────────────────────────────────────────────
  const handleClearLocation = () => {
    Alert.alert(
      'Clear Location',
      'Remove your saved location? You will need to set it again to see your schedule.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearLocation();
            setSavedLocation(null);
          },
        },
      ]
    );
  };

  // ── Build the category sections for the preset grid ───────────────────────
  // groupByCategory turns the flat array into { Nature: [...], Minimal: [...] }
  // so we can render a section header + row of thumbnails per category.
  const grouped = groupByCategory(BACKGROUND_PRESETS);
  const categories = Object.keys(grouped); // e.g. ['Nature', 'Minimal', 'Community']

  return (
    // BackgroundContainer reads from context so this screen shows whichever
    // background the user just picked — a live preview as they change it.
    <BackgroundContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Page header ────────────────────────────────────────────── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        {/* ── Location card ──────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>YOUR LOCATION</Text>

          {savedLocation ? (
            <>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color="#2E8B57" />
                <Text style={styles.locationText}>{savedLocation.displayName}</Text>
              </View>
              {savedLocation.streetAddress && (
                <Text style={styles.locationSub}>{savedLocation.streetAddress}</Text>
              )}
              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => router.push('/location-search')}
                >
                  <Text style={styles.primaryBtnText}>Change Location</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dangerBtn} onPress={handleClearLocation}>
                  <Text style={styles.dangerBtnText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.mutedText}>No location saved yet.</Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.push('/location-search')}
              >
                <Text style={styles.primaryBtnText}>Set Location</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Built-in backgrounds ────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BUILT-IN BACKGROUNDS</Text>

          {categories.length === 0 ? (
            // No images have been added to the catalog yet.
            // This empty state guides the developer (or the user in a dev build).
            <View style={styles.emptyPresets}>
              <Ionicons name="images-outline" size={36} color="#bbb" />
              <Text style={styles.emptyPresetsTitle}>No backgrounds added yet</Text>
              <Text style={styles.emptyPresetsBody}>
                Drop image files into the subfolders below, then add matching
                entries in{' '}
                <Text style={styles.mono}>constants/backgrounds.ts</Text>
              </Text>
              {/* Show the three folder paths so it's clear where to put files. */}
              {['assets/backgrounds/nature/', 'assets/backgrounds/minimal/', 'assets/backgrounds/community/'].map(
                (path) => (
                  <View key={path} style={styles.pathRow}>
                    <Ionicons name="folder-outline" size={14} color="#888" />
                    <Text style={styles.pathText}>{path}</Text>
                  </View>
                )
              )}
            </View>
          ) : (
            // Render one section per category.
            categories.map((cat) => (
              <View key={cat} style={styles.categorySection}>
                {/* Category label — e.g. "Nature" */}
                <Text style={styles.categoryLabel}>{cat}</Text>

                {/* Horizontal scrolling row of thumbnails so adding many images
                    doesn't push other sections off screen. */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailRow}
                >
                  {grouped[cat].map((preset) => {
                    // Highlight the thumbnail whose id matches the active preset.
                    const isActive = presetId === preset.id;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        style={[styles.thumbnail, isActive && styles.thumbnailActive]}
                        onPress={() => handlePickPreset(preset)}
                        accessibilityLabel={preset.label}
                      >
                        {/* expo-image handles local require() sources and remote
                            URIs with the same API and is more performant than
                            the built-in Image for thumbnails. */}
                        <Image
                          source={preset.source}
                          style={styles.thumbnailImage}
                          contentFit="cover"
                        />
                        {/* Active checkmark overlay */}
                        {isActive && (
                          <View style={styles.thumbnailCheck}>
                            <Ionicons name="checkmark-circle" size={22} color="#00da5e" />
                          </View>
                        )}
                        <Text style={styles.thumbnailLabel} numberOfLines={1}>
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ))
          )}
        </View>

        {/* ── Solid colors ────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SOLID COLOR</Text>
          <Text style={styles.cardSubtitle}>Tap a swatch to use a plain color background.</Text>

          {/* Wrap lets the swatches reflow naturally across multiple lines
              without needing a FlatList. */}
          <View style={styles.swatchRow}>
            {SOLID_COLORS.map((c) => {
              // Show the green ring only when this color is active AND no image
              // is overriding it (preset or custom URL).
              const isActive = color === c.hex && !presetId && !imageUrl;
              return (
                <TouchableOpacity
                  key={c.hex}
                  style={[styles.swatch, { backgroundColor: c.hex }, isActive && styles.swatchActive]}
                  onPress={() => handlePickColor(c.hex)}
                  accessibilityLabel={c.label}
                />
              );
            })}
          </View>
        </View>

        {/* ── Custom image URL ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CUSTOM IMAGE</Text>
          <Text style={styles.cardSubtitle}>
            Paste any public image URL (https://...) and tap Apply.
          </Text>

          <TextInput
            style={styles.input}
            value={urlDraft}
            onChangeText={setUrlDraft}
            placeholder="https://example.com/photo.jpg"
            // Prevents iOS from capitalising the first letter of the URL.
            autoCapitalize="none"
            // On iOS, shows a URL-optimised keyboard layout.
            keyboardType="url"
            placeholderTextColor="#bbb"
          />

          <TouchableOpacity style={styles.applyBtn} onPress={handleApplyUrl}>
            <Text style={styles.applyBtnText}>Apply Image</Text>
          </TouchableOpacity>

          {/* Confirm to the user that the custom URL is currently active. */}
          {imageUrl ? (
            <Text style={styles.activeNote}>
              Custom image is active. Pick a color or preset to remove it.
            </Text>
          ) : null}
        </View>

        {/* ── Reset ───────────────────────────────────────────────────── */}
        {/* Gives the user a quick way back to defaults without having to
            manually pick the gray swatch and clear the URL field. */}
        <TouchableOpacity style={styles.resetBtn} onPress={clearBackground}>
          <Ionicons name="refresh-outline" size={18} color="#666" />
          <Text style={styles.resetBtnText}>Reset to Default Background</Text>
        </TouchableOpacity>

      </ScrollView>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    // Extra bottom padding so the reset button isn't hidden behind the tab bar.
    paddingBottom: 48,
  },

  // ── Page header ────────────────────────────────────────────────────────────
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },

  // ── Card ───────────────────────────────────────────────────────────────────
  // Every section sits inside a white card that lifts off the background so
  // content is always readable regardless of the chosen background image.
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#777',
    marginBottom: 14,
  },

  // ── Location ───────────────────────────────────────────────────────────────
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
    flexShrink: 1,
  },
  locationSub: {
    fontSize: 14,
    color: '#777',
    marginBottom: 12,
  },
  mutedText: {
    fontSize: 15,
    color: '#999',
    marginBottom: 14,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#2E8B57',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  dangerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e53935',
    alignItems: 'center',
  },
  dangerBtnText: {
    color: '#e53935',
    fontWeight: '600',
    fontSize: 15,
  },

  // ── Empty presets state ────────────────────────────────────────────────────
  emptyPresets: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyPresetsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  emptyPresetsBody: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#555',
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  pathText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },

  // ── Preset thumbnails ──────────────────────────────────────────────────────
  categorySection: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  thumbnailRow: {
    // gap between thumbnails in the horizontal scroll view
    gap: 10,
    paddingRight: 4,
  },
  thumbnail: {
    width: 90,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    // Green border highlights the currently selected preset.
    borderColor: '#00da5e',
  },
  thumbnailImage: {
    width: '100%',
    height: 70,
  },
  thumbnailCheck: {
    // Absolute overlay so the checkmark sits on top of the image.
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 11,
  },
  thumbnailLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444',
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: 'white',
  },

  // ── Solid color swatches ───────────────────────────────────────────────────
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  swatchActive: {
    borderWidth: 3,
    borderColor: '#00da5e',
  },

  // ── Custom URL input ───────────────────────────────────────────────────────
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  applyBtn: {
    backgroundColor: '#0051b3',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  activeNote: {
    marginTop: 10,
    fontSize: 13,
    color: '#2E8B57',
    fontStyle: 'italic',
  },

  // ── Reset button ───────────────────────────────────────────────────────────
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  resetBtnText: {
    fontSize: 15,
    color: '#666',
  },
});
