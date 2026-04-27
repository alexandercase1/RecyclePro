import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { RecyclingSearchResult } from '@/data/types';
import { searchItems } from '@/services/searchService';
import { getSavedLocation, SavedLocation } from '@/services/storageService';


export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RecyclingSearchResult[]>([]);
  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadLocation = async () => {
      const savedLocation = await getSavedLocation();
      setLocation(savedLocation);
    };
    loadLocation();
  }, []);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      setIsSearching(searchQuery.length >= 2);

      if (searchQuery.length >= 2) {
        const searchResults = searchItems(searchQuery, location, 20);
        setResults(searchResults);
      } else {
        setResults([]);
      }
    },
    [location]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: Fonts.rounded }]}>
          Search Recyclables
        </Text>
        {location && (
          <Text style={styles.locationText}>
            📍 {location.displayName}
          </Text>
        )}
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search recyclable items..."
          onCameraPress={() => router.push('/(tabs)/cam')}
        />
      </View>

      <SearchResults
        results={results}
        isSearching={isSearching}
        query={query}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efefef',
  },
  header: {
    backgroundColor: '#0051b3',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
