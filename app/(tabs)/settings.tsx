import { BackgroundContainer } from '@/components/BackgroundContainer';
import { useBackground } from '@/components/BackgroundContext';
import { BACKGROUND_PRESETS, BackgroundPreset, groupByCategory } from '@/constants/backgrounds';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Solid color options shown in the color swatch row.
const SOLID_COLORS = [
  { hex: '#efefef', label: 'Default Gray' },
  { hex: '#e8f5e9', label: 'Soft Green' },
  { hex: '#e3f2fd', label: 'Sky Blue' },
  { hex: '#fff8e1', label: 'Warm Yellow' },
  { hex: '#fce4ec', label: 'Blush Pink' },
  { hex: '#f3e5f5', label: 'Lavender' },
  { hex: '#e0f2f1', label: 'Mint' },
];

export default function SettingsScreen() {
  // We only need three things from context here:
  //   setPreset       — store a built-in background when a thumbnail is tapped
  //   setColor        — store a solid color when a swatch is tapped
  //   clearBackground — reset everything back to the default gray
  //   presetId        — know which thumbnail to highlight as active
  //   color           — know which swatch to highlight as active
  const { setPreset, setColor, clearBackground, presetId, color } = useBackground();

  // Tapping a thumbnail calls setPreset with the preset's id and its image
  // source. The context saves the id to AsyncStorage so the choice survives
  // an app restart, and keeps the source in React state for immediate rendering.
  const handlePickPreset = (preset: BackgroundPreset) => {
    setPreset(preset.id, preset.source);
  };

  // Tapping a swatch calls setColor, which also clears any active preset or
  // custom image so only one background mode is active at a time.
  const handlePickColor = (hex: string) => {
    setColor(hex);
  };

  // groupByCategory turns the flat BACKGROUND_PRESETS array into an object
  // like { Nature: [...], Minimal: [...], Community: [...] } so we can render
  // a labelled section per category.
  const grouped = groupByCategory(BACKGROUND_PRESETS);
  const categories = Object.keys(grouped);

  return (
    // BackgroundContainer reads from context, so this screen itself shows the
    // currently active background — acting as a live preview.
    <BackgroundContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Page header ────────────────────────────────────────── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Appearance</Text>
          <Text style={styles.pageSubtitle}>Choose a background for the app.</Text>
        </View>

        {/* ── Built-in backgrounds ──────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BACKGROUNDS</Text>

          {categories.length === 0 ? (
            // Shown while the catalog in constants/backgrounds.ts is still empty.
            // Guides you (the developer) to the right place to add images.
            <View style={styles.emptyPresets}>
              <Ionicons name="images-outline" size={40} color="#ccc" />
              <Text style={styles.emptyTitle}>No backgrounds added yet</Text>
              <Text style={styles.emptyBody}>
                Drop image files into the subfolders below, then uncomment the
                matching entries in{' '}
                <Text style={styles.mono}>constants/backgrounds.ts</Text>
              </Text>
              {[
                'assets/backgrounds/nature/',
                'assets/backgrounds/minimal/',
                'assets/backgrounds/community/',
              ].map((path) => (
                <View key={path} style={styles.pathRow}>
                  <Ionicons name="folder-outline" size={13} color="#aaa" />
                  <Text style={styles.pathText}>{path}</Text>
                </View>
              ))}
            </View>
          ) : (
            // One section per category — Nature, Minimal, Community, etc.
            categories.map((cat) => (
              <View key={cat} style={styles.categorySection}>
                <Text style={styles.categoryLabel}>{cat}</Text>

                {/* Horizontal scroll so many thumbnails don't push the card
                    out of view vertically. */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailRow}
                >
                  {grouped[cat].map((preset) => {
                    const isActive = presetId === preset.id;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        style={[styles.thumbnail, isActive && styles.thumbnailActive]}
                        onPress={() => handlePickPreset(preset)}
                        accessibilityLabel={preset.label}
                      >
                        {/* expo-image renders local require() sources and remote
                            URIs with the same API and caches them efficiently. */}
                        <Image
                          source={preset.source}
                          style={styles.thumbnailImage}
                          contentFit="cover"
                        />
                        {/* Green checkmark overlay on the active thumbnail. */}
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

        {/* ── Solid colors ──────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SOLID COLOR</Text>

          {/* flexWrap lets the swatches flow onto a second line automatically
              if there are more than can fit in one row. */}
          <View style={styles.swatchRow}>
            {SOLID_COLORS.map((c) => {
              // Only highlight the swatch when a solid color is active —
              // not when a preset image is overriding the color.
              const isActive = color === c.hex && !presetId;
              return (
                <TouchableOpacity
                  key={c.hex}
                  style={[
                    styles.swatch,
                    { backgroundColor: c.hex },
                    isActive && styles.swatchActive,
                  ]}
                  onPress={() => handlePickColor(c.hex)}
                  accessibilityLabel={c.label}
                />
              );
            })}
          </View>
        </View>

        {/* ── Reset ─────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.resetBtn} onPress={clearBackground}>
          <Ionicons name="refresh-outline" size={18} color="#666" />
          <Text style={styles.resetBtnText}>Reset to Default</Text>
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
    paddingBottom: 48,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
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
  pageSubtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },

  // ── Card ───────────────────────────────────────────────────────────────────
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
    marginBottom: 14,
  },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyPresets: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  emptyBody: {
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
    color: '#aaa',
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
    borderColor: '#00da5e',
  },
  thumbnailImage: {
    width: '100%',
    height: 70,
  },
  thumbnailCheck: {
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
