import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getTownById } from '@/data/locations';
import { CollectionZone } from '@/data/types';
import { SavedLocation, saveLocation } from '@/services/storageService';

export default function ZoneSelectorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Location data passed from address-input
  const townId = params.townId as string;
  const townName = params.townName as string;
  const streetAddress = params.streetAddress as string;
  const displayName = params.displayName as string;
  const county = params.county as string;
  const state = params.state as string;
  const stateCode = params.stateCode as string;
  const lat = params.lat ? parseFloat(params.lat as string) : undefined;
  const lng = params.lng ? parseFloat(params.lng as string) : undefined;

  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load town data
  const town = getTownById(townId);

  if (!town) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Zone Selection</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Town data not found.</Text>
        </View>
      </View>
    );
  }

  const handleZoneSelect = async (zone: CollectionZone) => {
    setIsLoading(true);

    try {
      const locationData: SavedLocation = {
        townId,
        displayName,
        town: townName,
        county,
        state,
        stateCode,
        streetAddress,
        zoneId: zone.id,
        coordinates: lat && lng ? { lat, lng } : undefined,
      };

      await saveLocation(locationData);

      // Small delay to ensure AsyncStorage flush
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving location:', error);
      setIsLoading(false);
    }
  };

  const toggleZoneExpansion = (zoneId: string) => {
    setExpandedZoneId(expandedZoneId === zoneId ? null : zoneId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Your Zone</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📍 We couldn't automatically match your address</Text>
          <Text style={styles.infoText}>
            Address: {streetAddress}
          </Text>
          <Text style={styles.infoSubtext}>
            Please select your collection zone from the list below.
          </Text>
        </View>

        {town.zones.map((zone, index) => (
          <View key={zone.id} style={styles.zoneCard}>
            <View style={styles.zoneHeader}>
              <View style={styles.zoneHeaderLeft}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                {zone.description && (
                  <Text style={styles.zoneDescription}>{zone.description}</Text>
                )}
              </View>
              <Text style={styles.zoneNumber}>Zone {index + 1}</Text>
            </View>

            {/* Streets in this zone */}
            {zone.streets && zone.streets.length > 0 && (
              <View style={styles.streetsContainer}>
                <TouchableOpacity
                  onPress={() => toggleZoneExpansion(zone.id)}
                  style={styles.streetsToggle}
                >
                  <Text style={styles.streetsToggleText}>
                    {expandedZoneId === zone.id ? '▼' : '▶'} View Streets ({zone.streets.length})
                  </Text>
                </TouchableOpacity>

                {expandedZoneId === zone.id && (
                  <View style={styles.streetsList}>
                    {zone.streets.slice(0, 10).map((street, idx) => (
                      <Text key={idx} style={styles.streetItem}>
                        • {street.name}
                        {street.rangeStart && street.rangeEnd
                          ? ` (${street.rangeStart}-${street.rangeEnd})`
                          : ''}
                      </Text>
                    ))}
                    {zone.streets.length > 10 && (
                      <Text style={styles.streetItem}>
                        ... and {zone.streets.length - 10} more streets
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Address ranges */}
            {zone.addressRanges && zone.addressRanges.length > 0 && (
              <View style={styles.rangesContainer}>
                <Text style={styles.rangesTitle}>Address Ranges:</Text>
                {zone.addressRanges.slice(0, 5).map((range, idx) => (
                  <Text key={idx} style={styles.rangeItem}>
                    • {range.street}
                    {range.fromNumber && range.toNumber
                      ? ` (${range.fromNumber}-${range.toNumber})`
                      : ''}
                    {range.parity && range.parity !== 'all' ? ` - ${range.parity} only` : ''}
                  </Text>
                ))}
              </View>
            )}

            {/* Select button */}
            <TouchableOpacity
              style={[styles.selectButton, isLoading && styles.selectButtonDisabled]}
              onPress={() => handleZoneSelect(zone)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.selectButtonText}>Select This Zone</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E8B57',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#856404',
    marginTop: 8,
  },
  zoneCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  zoneHeaderLeft: {
    flex: 1,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  zoneDescription: {
    fontSize: 14,
    color: '#666',
  },
  zoneNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E8B57',
    backgroundColor: '#E8F5F7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streetsContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  streetsToggle: {
    paddingVertical: 8,
  },
  streetsToggleText: {
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '600',
  },
  streetsList: {
    marginTop: 8,
    paddingLeft: 8,
  },
  streetItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  rangesContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  rangesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  rangeItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  selectButton: {
    backgroundColor: '#2E8B57',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  selectButtonDisabled: {
    opacity: 0.6,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
