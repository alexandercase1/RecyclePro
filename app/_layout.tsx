import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}