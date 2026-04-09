import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
//import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    // Dismiss the native splash immediately — it's just a plain blue background.
    // Our full-screen Image overlay below takes over as soon as RN is ready,
    // creating a seamless transition since the image background matches #1a2fa8.
    SplashScreen.hideAsync();
    const timer = setTimeout(() => setSplashVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="location-search"
          options={{
            presentation: 'modal',
            title: 'Find Your Location',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="address-input"
          options={{
            presentation: 'modal',
            title: 'Enter Address',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="zone-selector"
          options={{
            presentation: 'modal',
            title: 'Select Zone',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="item-detail"
          options={{
            presentation: 'modal',
            headerShown: false
          }}
        />
      </Stack>
      <StatusBar style="auto" />
      {splashVisible && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={require('../assets/images/splash-screen.jpg')}
            style={styles.splash}
            resizeMode="cover"
          />
        </View>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    width: '100%',
    height: '100%',
  },
});