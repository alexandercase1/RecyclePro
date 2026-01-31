import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { DisposalMethodBadge } from '@/components/recyclability/DisposalMethodBadge';
import { getItemByIdWithDisposal } from '@/services/searchService';
import { getSavedLocation, SavedLocation } from '@/services/storageService';
import { RecyclingSearchResult } from '@/data/types';
import { getRuleScopeDescription } from '@/services/recyclabilityService';
import { getCategoryName } from '@/data/recyclables';

export default function ItemDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const itemId = params.itemId as string;

  const [itemResult, setItemResult] = useState<RecyclingSearchResult | null>(null);
  const [location, setLocation] = useState<SavedLocation | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const savedLocation = await getSavedLocation();
      setLocation(savedLocation);

      const result = getItemByIdWithDisposal(itemId, savedLocation);
      setItemResult(result);
    };

    loadData();
  }, [itemId]);

  if (!itemResult) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backText}>← Back</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <ThemedText>Item not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const { item, disposal, instructions, specialNotes, appliedRule } = itemResult;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backText}>← Back</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Item Header */}
        <View style={styles.itemHeader}>
          <ThemedText style={styles.itemName}>{item.name}</ThemedText>
          {item.subcategory && (
            <ThemedText style={styles.subcategory}>
              {getCategoryName(item.category)} • {item.subcategory}
            </ThemedText>
          )}
        </View>

        {/* Disposal Method */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Disposal Method</ThemedText>
          <DisposalMethodBadge method={disposal} size="large" />
        </View>

        {/* Instructions */}
        {instructions && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Instructions</ThemedText>
            <View style={styles.instructionsBox}>
              <ThemedText style={styles.instructions}>{instructions}</ThemedText>
            </View>
          </View>
        )}

        {/* Special Notes */}
        {specialNotes && (
          <View style={styles.section}>
            <View style={styles.notesBox}>
              <ThemedText style={styles.notesIcon}>ℹ️</ThemedText>
              <ThemedText style={styles.notesText}>{specialNotes}</ThemedText>
            </View>
          </View>
        )}

        {/* Location Info */}
        {location && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Your Location</ThemedText>
            <ThemedText style={styles.locationText}>
              📍 {location.displayName}
            </ThemedText>
            {appliedRule && (
              <ThemedText style={styles.ruleText}>
                Rule applied: {getRuleScopeDescription(appliedRule)}
              </ThemedText>
            )}
          </View>
        )}

        {/* Aliases */}
        {item.aliases.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Also Known As</ThemedText>
            <View style={styles.aliasesContainer}>
              {item.aliases.map((alias, index) => (
                <View key={index} style={styles.aliasTag}>
                  <ThemedText style={styles.aliasText}>{alias}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* More Info Link */}
        {item.moreInfoUrl && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.linkButton}>
              <ThemedText style={styles.linkText}>
                More Information →
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemHeader: {
    marginBottom: 24,
  },
  itemName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subcategory: {
    fontSize: 16,
    opacity: 0.6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionsBox: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
  },
  notesBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  notesIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#E65100',
  },
  locationText: {
    fontSize: 16,
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  aliasesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  aliasTag: {
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  aliasText: {
    fontSize: 14,
  },
  linkButton: {
    padding: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
