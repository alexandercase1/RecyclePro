import { oradell } from '@/data/towns/oradell';
import { CollectionZone } from '@/data/types';
import { getSavedLocation, SavedLocation } from '@/services/storageService';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedZone] = useState<CollectionZone>(oradell.zones[0]);
  const [currentDate] = useState(new Date());
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved location on component mount and when screen gains focus
  useEffect(() => {
    loadSavedLocation();
  }, []);

  // Reload location when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, reloading location');
      loadSavedLocation();
    }, [])
  );

  const loadSavedLocation = async () => {
    console.log('Loading saved location...');
    setIsLoading(true);
    const location = await getSavedLocation();
    console.log('Got saved location:', location);
    setSavedLocation(location);
    setIsLoading(false);
  };

  const getWeekDates = () => {
    const week = [];
    const today = new Date(currentDate);
    const dayOfWeek = today.getDay();
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    
    return week;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getCollectionType = (date: Date) => {
    const day = date.getDay();
    
    if (selectedZone.schedule.garbage.days.includes(day)) {
      return 'Garbage';
    }
    
    if (selectedZone.schedule.recycling.day === day) {
      const weekNumber = getWeekNumber(date);
      const isEvenWeek = weekNumber % 2 === 0;
      return isEvenWeek ? 'Recycling (Commingled)' : 'Recycling (Paper)';
    }
    
    if (selectedZone.schedule.yardWaste) {
      const { days, seasonStart, seasonEnd } = selectedZone.schedule.yardWaste;
      if (days.includes(day) && isInSeason(date, seasonStart, seasonEnd)) {
        return 'Yard Waste';
      }
    }
    
    return null;
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const isInSeason = (date: Date, start: string, end: string): boolean => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const [startMonth, startDay] = start.split('-').map(Number);
    const [endMonth, endDay] = end.split('-').map(Number);
    
    const dateNum = month * 100 + day;
    const startNum = startMonth * 100 + startDay;
    const endNum = endMonth * 100 + endDay;
    
    return dateNum >= startNum && dateNum <= endNum;
  };

  const weekDates = getWeekDates();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Show loading state while checking for saved location
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If no location saved, show welcome screen
  if (!savedLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recycle Pro</Text>
          <Text style={styles.subtitle}>Your Local Recycling & Waste Schedule</Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeText}>
            Get your local trash and recycling pickup schedule delivered right to your device.
          </Text>

          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => router.push('/location-search')}
          >
            <Text style={styles.setupButtonText}>Enter Location</Text>
          </TouchableOpacity>

          <View style={styles.featuresContainer}>
            <Text style={styles.featureItem}>📅 View your weekly schedule</Text>
            <Text style={styles.featureItem}>♻️ Track recycling days</Text>
            <Text style={styles.featureItem}>🗑️ Never miss garbage day</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recycle Pro</Text>
        <Text style={styles.subtitle}>{savedLocation.displayName}</Text>
        {savedLocation.streetAddress && (
          <Text style={styles.addressText}>{savedLocation.streetAddress}</Text>
        )}
        <Text style={styles.zoneText}>{selectedZone.name}</Text>

        <TouchableOpacity
          style={styles.changeLocationButton}
          onPress={() => router.push('/location-search')}
        >
          <Text style={styles.changeLocationText}>Change Location</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Calendar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week's Schedule</Text>
        
        <View style={styles.weekContainer}>
          {weekDates.map((date, index) => {
            const collectionType = getCollectionType(date);
            const today = isToday(date);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCard,
                  today && styles.dayCardToday,
                  collectionType && styles.dayCardWithCollection,
                ]}
              >
                <Text style={[styles.dayName, today && styles.textToday]}>
                  {dayNames[index]}
                </Text>
                <Text style={[styles.dayNumber, today && styles.textToday]}>
                  {date.getDate()}
                </Text>
                {collectionType && (
                  <View style={[
                    styles.collectionBadge,
                    collectionType.includes('Garbage') ? styles.garbageBadge : 
                    collectionType.includes('Yard') ? styles.yardWasteBadge :
                    styles.recyclingBadge
                  ]}>
                    <Text style={styles.badgeText}>
                      {collectionType.includes('Garbage') ? '🗑️' : 
                       collectionType.includes('Yard') ? '🍂' : '♻️'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Today's Collection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Collection</Text>
        {getCollectionType(new Date()) ? (
          <View>
            <Text style={styles.collectionText}>
              {getCollectionType(new Date())}
            </Text>
            <Text style={styles.collectionTime}>
              Collection starts at {selectedZone.schedule.garbage.time}
            </Text>
          </View>
        ) : (
          <Text style={styles.collectionText}>No collection today</Text>
        )}
      </View>

      {/* Recycling Center Info */}
      {oradell.recyclingCenter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recycling Center</Text>
          <Text style={styles.centerName}>{oradell.recyclingCenter.name}</Text>
          <Text style={styles.centerAddress}>{oradell.recyclingCenter.address}</Text>
          <Text style={styles.centerHours}>
            Hours: {oradell.recyclingCenter.hours.weekday}
          </Text>
          {oradell.recyclingCenter.hours.saturday && (
            <Text style={styles.centerHours}>{oradell.recyclingCenter.hours.saturday}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    backgroundColor: '#2E7D8B',
    padding: 40,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginTop: 5,
  },
  addressText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 3,
  },
  zoneText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  changeLocationButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignItems: 'center',
  },
  changeLocationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  collectionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  collectionTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  dayCardToday: {
    backgroundColor: '#2E7D8B',
  },
  dayCardWithCollection: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  textToday: {
    color: 'white',
  },
  collectionBadge: {
    marginTop: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  garbageBadge: {
    backgroundColor: '#757575',
  },
  recyclingBadge: {
    backgroundColor: '#4CAF50',
  },
  yardWasteBadge: {
    backgroundColor: '#8B4513',
  },
  badgeText: {
    fontSize: 16,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  centerAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  centerHours: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  welcomeContainer: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  setupButton: {
    backgroundColor: '#2E7D8B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  setupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureItem: {
    fontSize: 16,
    color: '#333',
    marginVertical: 8,
    lineHeight: 24,
  },
});
