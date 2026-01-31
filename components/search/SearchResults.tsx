import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RecyclingSearchResult } from '@/data/types';
import { ItemCard } from '@/components/recyclability/ItemCard';

interface SearchResultsProps {
  results: RecyclingSearchResult[];
  isSearching: boolean;
  query: string;
  emptyMessage?: string;
}

export function SearchResults({
  results,
  isSearching,
  query,
  emptyMessage = 'No items found',
}: SearchResultsProps) {
  if (isSearching && query.length < 2) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          Type at least 2 characters to search
        </ThemedText>
      </ThemedView>
    );
  }

  if (isSearching && results.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyIcon}>🔍</ThemedText>
        <ThemedText style={styles.emptyText}>{emptyMessage}</ThemedText>
        {query && (
          <ThemedText style={styles.emptySubtext}>
            No results for "{query}"
          </ThemedText>
        )}
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={item => item.item.id}
      renderItem={({ item }) => <ItemCard result={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        results.length > 0 && query ? (
          <View style={styles.header}>
            <ThemedText style={styles.resultCount}>
              {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
            </ThemedText>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
  },
});
