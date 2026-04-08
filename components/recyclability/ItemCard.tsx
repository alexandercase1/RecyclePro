import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RecyclingSearchResult } from '@/data/types';
import { DisposalMethodBadge } from './DisposalMethodBadge';
import { useRouter } from 'expo-router';

interface ItemCardProps {
  result: RecyclingSearchResult;
  onPress?: () => void;
}

export function ItemCard({ result, onPress }: ItemCardProps) {
  const router = useRouter();
  const { item, disposal, specialNotes, appliedRule } = result;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to item detail page
      router.push({
        pathname: '/item-detail' as any,
        params: { itemId: item.id },
      });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <ThemedView style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
            {item.subcategory && (
              <ThemedText style={styles.subcategory}>
                {item.subcategory}
              </ThemedText>
            )}
          </View>
          <DisposalMethodBadge method={disposal} size="small" />
        </View>

        {specialNotes && (
          <View style={styles.notesContainer}>
            <ThemedText style={styles.specialNotes}>ℹ️ {specialNotes}</ThemedText>
          </View>
        )}

        {appliedRule && (
          <View style={styles.ruleIndicator}>
            <ThemedText style={styles.ruleText}>
              📍 Location-specific rule applied
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subcategory: {
    fontSize: 14,
    opacity: 0.6,
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  specialNotes: {
    fontSize: 13,
    color: '#E65100',
  },
  ruleIndicator: {
    marginTop: 8,
    paddingVertical: 4,
  },
  ruleText: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});
