import { CollectionZone, Town } from '@/data/types';
import { getSavedLocation, SavedLocation } from '@/services/storageService';
import { getTownById } from '@/data/locations';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Collection type keys used for indicators
type CollectionType = 'garbage' | 'paper' | 'commingled' | 'yardWaste';

// Indicator shape component for the calendar
const CollectionIndicator = ({ type }: { type: CollectionType }) => {
  switch (type) {
    case 'garbage':
      return <View style={styles.triangleIndicator} />;
    case 'paper':
      return <View style={[styles.circleIndicator, { backgroundColor: '#4CAF50' }]} />;
    case 'commingled':
      return <View style={[styles.squareIndicator, { backgroundColor: '#2196F3' }]} />;
    case 'yardWaste':
      return <View style={[styles.diamondIndicator, { backgroundColor: '#8B4513' }]} />;
  }
};

// Human-readable labels for collection types
const collectionLabels: Record<CollectionType, string> = {
  garbage: 'Garbage',
  paper: 'Paper & Cardboard Recycling',
  commingled: 'Commingled Recycling (Glass, Plastic, Metal)',
  yardWaste: 'Yard Waste',
};

export default function HomeScreen() {
  const router = useRouter();
  const [selectedZone, setSelectedZone] = useState<CollectionZone | null>(null);
  const [selectedTown, setSelectedTown] = useState<Town | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedLocation();
    }, [])
  );

  const loadSavedLocation = async () => {
    setIsLoading(true);
    const location = await getSavedLocation();
    setSavedLocation(location);

    if (location) {
      const town = getTownById(location.townId);
      setSelectedTown(town || null);

      if (town && town.zones.length > 0) {
        if (location.zoneId) {
          const zone = town.zones.find(z => z.id === location.zoneId);
          setSelectedZone(zone || town.zones[0]);
        } else {
          setSelectedZone(town.zones[0]);
        }
      } else {
        setSelectedZone(null);
      }
    } else {
      setSelectedZone(null);
      setSelectedTown(null);
    }

    setIsLoading(false);
  };

  // --- Calendar helpers ---

  const getMonthDates = (year: number, month: number): (Date | null)[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sun

    const dates: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      dates.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      dates.push(new Date(year, month, d));
    }

    // Pad to fill the last row
    while (dates.length % 7 !== 0) {
      dates.push(null);
    }

    return dates;
  };

  const goToPrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
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
    return dateNum >= startMonth * 100 + startDay && dateNum <= endMonth * 100 + endDay;
  };

  const getCollectionTypes = (date: Date): CollectionType[] => {
    if (!selectedZone) return [];
    const types: CollectionType[] = [];
    const day = date.getDay();

    if (selectedZone.schedule.garbage.days.includes(day)) {
      types.push('garbage');
    }

    if (selectedZone.schedule.recycling.day === day) {
      const weekNumber = getWeekNumber(date);
      const isEvenWeek = weekNumber % 2 === 0;
      const weekType = isEvenWeek
        ? selectedZone.schedule.recycling.weeks.even
        : selectedZone.schedule.recycling.weeks.odd;
      if (weekType !== 'none') {
        types.push(weekType);
      }
    }

    if (selectedZone.schedule.yardWaste) {
      const { days, seasonStart, seasonEnd } = selectedZone.schedule.yardWaste;
      if (days.includes(day) && isInSeason(date, seasonStart, seasonEnd)) {
        types.push('yardWaste');
      }
    }

    return types;
  };

  // --- Render helpers ---

  const renderMonthCalendar = (showIndicators: boolean) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthDates = getMonthDates(year, month);
    const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();

    // Chunk dates into weeks
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < monthDates.length; i += 7) {
      weeks.push(monthDates.slice(i, i + 7));
    }

    return (
      <View style={styles.calendarContainer}>
        {/* Month nav header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.monthNavButton}>
            <Text style={styles.monthNavText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavButton}>
            <Text style={styles.monthNavText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Day-of-week headers */}
        <View style={styles.dayHeaderRow}>
          {dayHeaders.map((d, i) => (
            <View key={i} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {weeks.map((week, weekIdx) => (
          <View key={weekIdx} style={styles.weekRow}>
            {week.map((date, dayIdx) => {
              if (!date) {
                return <View key={dayIdx} style={styles.dayCell} />;
              }

              const isCurrentDay = date.toDateString() === today.toDateString();
              const collections = showIndicators ? getCollectionTypes(date) : [];

              return (
                <View key={dayIdx} style={styles.dayCell}>
                  <Text style={[
                    styles.dayNumber,
                    isCurrentDay && styles.todayNumber,
                  ]}>
                    {date.getDate()}
                  </Text>
                  {collections.length > 0 && (
                    <View style={styles.indicatorRow}>
                      {collections.map((type, idx) => (
                        <CollectionIndicator key={idx} type={type} />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        {/* Legend */}
        {showIndicators && (
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={styles.legendTriangle} />
              <Text style={styles.legendText}>Garbage</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendCircle, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Paper Recycling</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSquare, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.legendText}>Commingled</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  // --- Loading state ---

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // --- State A: No location saved ---

  if (!savedLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recycle Pro</Text>
          <Text style={styles.subtitle}>Your Local Recycling & Waste Schedule</Text>
        </View>

        <ScrollView style={styles.contentScroll}>
          {renderMonthCalendar(false)}

          <View style={styles.promptCard}>
            <Text style={styles.promptTitle}>Set Your Location</Text>
            <Text style={styles.promptText}>
              Enter your location to see your personalized collection schedule.
            </Text>
            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => router.push('/location-search')}
            >
              <Text style={styles.setupButtonText}>Enter Location</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // --- State B: Location saved but no zone data ---

  if (!selectedZone) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recycle Pro</Text>
          <Text style={styles.subtitle}>{savedLocation.displayName}</Text>
        </View>

        <ScrollView style={styles.contentScroll}>
          {renderMonthCalendar(false)}

          <View style={styles.promptCard}>
            <Text style={styles.promptTitle}>Schedule Coming Soon</Text>
            <Text style={styles.promptText}>
              We don't have schedule data for your location yet. Check back later as we add more towns.
            </Text>
            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => router.push('/location-search')}
            >
              <Text style={styles.setupButtonText}>Change Location</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // --- State C: Location + zone loaded ---

  const todayCollections = getCollectionTypes(new Date());

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

      {/* Monthly Calendar */}
      {renderMonthCalendar(true)}

      {/* Today's Collection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Collection</Text>
        {todayCollections.length > 0 ? (
          <View>
            {todayCollections.map((type, idx) => (
              <View key={idx} style={styles.collectionDetailRow}>
                <CollectionIndicator type={type} />
                <Text style={styles.collectionDetailText}>
                  {collectionLabels[type]}
                </Text>
              </View>
            ))}
            <Text style={styles.collectionTime}>
              Place at curb by {selectedZone.schedule.garbage.time}
            </Text>
          </View>
        ) : (
          <Text style={styles.noCollectionText}>No collection scheduled for today</Text>
        )}
      </View>

      {/* Recycling Center Info */}
      {selectedTown?.recyclingCenter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recycling Center</Text>
          <Text style={styles.centerName}>{selectedTown.recyclingCenter.name}</Text>
          <Text style={styles.centerAddress}>{selectedTown.recyclingCenter.address}</Text>
          <Text style={styles.centerHours}>
            Hours: {selectedTown.recyclingCenter.hours.weekday}
          </Text>
          {selectedTown.recyclingCenter.hours.saturday && (
            <Text style={styles.centerHours}>{selectedTown.recyclingCenter.hours.saturday}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efefef',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  contentScroll: {
    flex: 1,
  },
  header: {
    backgroundColor: '#0051b3',
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

  // --- Calendar ---
  calendarContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthNavButton: {
    padding: 10,
  },
  monthNavText: {
    fontSize: 20,
    color: '#2E8B57',
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
    marginBottom: 4,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 44,
  },
  dayNumber: {
    fontSize: 16,
    color: '#333',
  },
  todayNumber: {
    color: '#2E8B57',
    fontWeight: 'bold',
    fontSize: 18,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
  },

  // --- Indicator shapes ---
  triangleIndicator: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#757575',
  },
  circleIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  squareIndicator: {
    width: 8,
    height: 8,
    borderRadius: 1,
  },
  diamondIndicator: {
    width: 8,
    height: 8,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },

  // --- Legend ---
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#757575',
  },
  legendCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 1,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },

  // --- Prompt card ---
  promptCard: {
    margin: 15,
    padding: 25,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  promptText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  setupButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
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

  // --- Section cards ---
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
  collectionDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  collectionDetailText: {
    fontSize: 16,
    color: '#333',
  },
  collectionTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  noCollectionText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
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
});
