import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
import { useBackground } from './BackgroundContext';

interface BackgroundContainerProps {
  children: React.ReactNode;
  /** A hex code or color name (e.g., '#ff0000' or 'red') */
  color?: string;
  /** A URL string for the background image */
  imageUrl?: string;
  style?: ViewStyle;
}

export function BackgroundContainer({ children, color, imageUrl, style }: BackgroundContainerProps) {
  const backgroundContext = useBackground();

  // Use props if provided directly, otherwise fall back to global context state
  const activeImageUrl = imageUrl !== undefined ? imageUrl : backgroundContext.imageUrl;
  const activeColor = color !== undefined ? color : backgroundContext.color;

  // If an image URL is provided, render an ImageBackground
  if (activeImageUrl) {
    return (
      <ImageBackground source={{ uri: activeImageUrl }} style={[styles.container, style]} resizeMode="cover">
        {children}
      </ImageBackground>
    );
  }

  // Otherwise, default to a standard View with a background color
  return (
    <View style={[styles.container, { backgroundColor: activeColor || '#efefef' }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
