import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ItemCategory } from '@/data/types';
import { MATERIAL_CATEGORIES } from '@/data/recyclables';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface CategoryGridProps {
  onCategoryPress?: (category: ItemCategory) => void;
}

export function CategoryGrid({ onCategoryPress }: CategoryGridProps) {
  const router = useRouter();

  const handleCategoryPress = (category: ItemCategory) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    }
    // Note: Category detail page will be implemented in a future update
    // For now, categories are just displayed in the grid
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.header}>Browse by Category</ThemedText>
      <View style={styles.grid}>
        {MATERIAL_CATEGORIES.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            onPress={() => handleCategoryPress(category)}
          />
        ))}
      </View>
    </View>
  );
}

interface CategoryCardProps {
  category: ItemCategory;
  onPress: () => void;
}

function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardWrapper}>
      <ThemedView style={styles.card}>
        <ThemedText style={styles.icon}>{category.icon}</ThemedText>
        <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
        {category.description && (
          <ThemedText style={styles.description} numberOfLines={2}>
            {category.description}
          </ThemedText>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 140,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 16,
  },
});
