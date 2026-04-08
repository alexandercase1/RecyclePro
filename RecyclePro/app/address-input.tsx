import { SavedLocation, saveLocation } from '@/services/storageService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getTownById } from '@/data/locations';
import { findMatchingZone } from '@/services/zoneMatchingService';

export default function AddressInputScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Location data passed from location-search
  const townId = params.townId as string;
  const displayName = params.displayName as string;
  const town = params.town as string;
  const county = params.county as string;
  const state = params.state as string;
  const stateCode = params.stateCode as string;
  const lat = params.lat ? parseFloat(params.lat as string) : undefined;
  const lng = params.lng ? parseFloat(params.lng as string) : undefined;

  const [streetAddress, setStreetAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveAddress = async () => {
    if (!streetAddress.trim()) {
      Alert.alert('Address Required', 'Please enter your street address.');
      return;
    }

    setIsLoading(true);

    try {
      const locationData: SavedLocation = {
        townId,
        displayName,
        town,
        county,
        state,
        stateCode,
        streetAddress: streetAddress.trim(),
        coordinates: lat && lng ? { lat, lng } : undefined,
      };

      // Try to automatically match the zone based on address
      const townData = getTownById(townId);
      if (townData && townData.zones.length > 0) {
        const matchedZone = findMatchingZone(
          streetAddress.trim(),
          townData.zones,
          locationData.coordinates
        );

        if (matchedZone) {
          // Zone matched successfully
          locationData.zoneId = matchedZone.id;
          await saveLocation(locationData);

          // Small delay to ensure AsyncStorage flush
          await new Promise(resolve => setTimeout(resolve, 100));

          router.replace('/(tabs)');
        } else {
          // No zone match - navigate to manual zone selector
          setIsLoading(false);

          router.replace({
            pathname: '/zone-selector' as any,
            params: {
              townId: locationData.townId,
              townName: townData.name,
              streetAddress: streetAddress.trim(),
              displayName: locationData.displayName,
              county: locationData.county,
              state: locationData.state,
              stateCode: locationData.stateCode,
              lat: lat?.toString(),
              lng: lng?.toString(),
            }
          });
        }
      } else {
        // Town has no zones - save without zoneId
        await saveLocation(locationData);

        // Small delay to ensure AsyncStorage flush
        await new Promise(resolve => setTimeout(resolve, 100));

        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save your location. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      // Save location without street address
      const savedLocation: SavedLocation = {
        townId,
        displayName,
        town,
        county,
        state,
        stateCode,
        coordinates: lat && lng ? { lat, lng } : undefined,
      };

      await saveLocation(savedLocation);

      // Small delay to ensure AsyncStorage flush
      await new Promise(resolve => setTimeout(resolve, 100));

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save your location. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Enter Your Address</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.locationInfo}>
          <Text style={styles.selectedLocationLabel}>Selected Location:</Text>
          <Text style={styles.selectedLocationText}>{displayName}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Street Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 123 Main Street"
            value={streetAddress}
            onChangeText={setStreetAddress}
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus
            editable={!isLoading}
          />
          <Text style={styles.helperText}>
            Your street address helps us show you the correct pickup schedule for your area.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveAddress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isLoading}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#473fb4',
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
  locationInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedLocationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  selectedLocationText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#354694',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
