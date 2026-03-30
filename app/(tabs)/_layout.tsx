import { BackgroundProvider } from '@/components/BackgroundContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <BackgroundProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#00da5e',
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cam"
          options={{
            title: 'Camera',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'camera' : 'camera-outline'} size={28} color={color} />
            ),
          }}
        />
      </Tabs>
    </BackgroundProvider>
  );
}