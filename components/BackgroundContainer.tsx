import React from 'react';
import { ImageBackground, ImageSourcePropType, StyleSheet, View, ViewStyle } from 'react-native';
import { useBackground } from './BackgroundContext';

interface BackgroundContainerProps {
  children: React.ReactNode;
  // Optional direct overrides — if provided, these take priority over context.
  // Useful if a specific screen always needs a fixed background regardless of
  // the user's global setting.
  color?: string;
  imageUrl?: string;
  style?: ViewStyle;
}

export function BackgroundContainer({ children, color, imageUrl, style }: BackgroundContainerProps) {
  const ctx = useBackground();

  // ── Resolve which image source to use ─────────────────────────────────────
  // Priority (highest to lowest):
  //   1. Direct prop imageUrl  — screen-level override (rare)
  //   2. Context presetSource  — built-in background the user picked
  //   3. Context imageUrl      — custom URL the user entered
  //   4. Direct prop color     — screen-level color override
  //   5. Context color         — global color the user picked
  //   6. Hard-coded fallback   — '#efefef' if everything else is undefined

  // Determine the image source.  We build an ImageSourcePropType so that
  // ImageBackground can accept both a remote URI and a local require() asset.
  let activeSource: ImageSourcePropType | undefined;

  if (imageUrl !== undefined) {
    // A direct URL prop was passed — highest priority for images.
    activeSource = { uri: imageUrl };
  } else if (ctx.presetSource !== undefined) {
    // A built-in preset was selected by the user.
    activeSource = ctx.presetSource;
  } else if (ctx.imageUrl !== undefined) {
    // A custom URL was entered by the user in Settings.
    activeSource = { uri: ctx.imageUrl };
  }
  // If none of the above, activeSource stays undefined → fall through to color.

  // Determine the background color (used only when no image source is active).
  const activeColor = color !== undefined ? color : (ctx.color ?? '#efefef');

  // ── Render ────────────────────────────────────────────────────────────────
  if (activeSource !== undefined) {
    // An image is active — render ImageBackground so the children float on top.
    // resizeMode="cover" fills the entire container while preserving aspect
    // ratio, the same behavior as CSS background-size: cover.
    return (
      <ImageBackground
        source={activeSource}
        style={[styles.container, style]}
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    );
  }

  // No image — render a plain View with the solid background color.
  return (
    <View style={[styles.container, { backgroundColor: activeColor }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // flex: 1 ensures the container stretches to fill whatever space its parent
  // gives it, so children are not clipped.
  container: {
    flex: 1,
  },
});
