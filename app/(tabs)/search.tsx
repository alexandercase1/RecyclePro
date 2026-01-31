import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { CategoryGrid } from '@/components/search/CategoryGrid';
import { RecyclingSearchResult } from '@/data/types';
import { searchItems, getPopularItems } from '@/services/searchService';
import { getSavedLocation, SavedLocation } from '@/services/storageService';
import { Fonts } from '@/constants/theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RecyclingSearchResult[]>([]);
  const [popularItems, setPopularItems] = useState<RecyclingSearchResult[]>([]);
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

  // Load popular items when location changes
  useEffect(() => {
    const popular = getPopularItems(location, 10);
    setPopularItems(popular);
  }, [location]);

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
    <ThemedView style={styles.container}>
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

      {isSearching ? (
        <SearchResults
          results={results}
          isSearching={isSearching}
          query={query}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Popular Items Section */}
          {popularItems.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Popular Items
              </ThemedText>
              <View style={styles.popularItemsContainer}>
                {popularItems.slice(0, 5).map(item => (
                  <View key={item.item.id} style={styles.popularItem}>
                    <ThemedText style={styles.popularItemText}>
                      {item.item.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Category Grid */}
          <CategoryGrid />
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  popularItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  popularItemText: {
    fontSize: 14,
    color: '#007AFF',
  },
});
