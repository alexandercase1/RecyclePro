import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { RecyclingSearchResult } from '@/data/types';
import { searchItems } from '@/services/searchService';
import { getSavedLocation, SavedLocation } from '@/services/storageService';
import { Fonts } from '@/constants/theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RecyclingSearchResult[]>([]);
  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Load user location on mount
  useEffect(() => {
    const loadLocation = async () => {
      const savedLocation = await getSavedLocation();
      setLocation(savedLocation);
    };
    loadLocation();
  }, []);

  // Handle search
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
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Search Recyclables
        </ThemedText>
        {location && (
          <ThemedText style={styles.locationText}>
            📍 {location.displayName}
          </ThemedText>
        )}
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search recyclable items..."
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  locationText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
});
