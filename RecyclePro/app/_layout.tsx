import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { BackgroundProvider } from '@/components/BackgroundContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);


  // BackgroundProvider wraps everything — including modals — so any screen
  // in the entire app can safely call useBackground() without crashing.
  return (
    <BackgroundProvider>
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
    </ThemeProvider>
    </BackgroundProvider>
  );
}