import { oradell } from '@/data/towns/oradell';
import { CollectionZone } from '@/data/types';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  // For now, we'll use the first zone as default
  // Later, we'll let users select their zone
  const [selectedZone] = useState<CollectionZone>(oradell.zones[0]);
  const [currentDate] = useState(new Date());

  // Function to get the current week's dates
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

  // Get collection type based on zone's schedule
  const getCollectionType = (date: Date) => {
    const day = date.getDay();
    
    // Check garbage days
    if (selectedZone.schedule.garbage.days.includes(day)) {
      return 'Garbage';
    }
    
    // Check recycling day
    if (selectedZone.schedule.recycling.day === day) {
      // Determine if it's even or odd week
      const weekNumber = getWeekNumber(date);
      const isEvenWeek = weekNumber % 2 === 0;
      return isEvenWeek ? 'Recycling (Commingled)' : 'Recycling (Paper)';
    }
    
    // Check yard waste (if in season)
    if (selectedZone.schedule.yardWaste) {
      const { days, seasonStart, seasonEnd } = selectedZone.schedule.yardWaste;
      if (days.includes(day) && isInSeason(date, seasonStart, seasonEnd)) {
        return 'Yard Waste';
      }
    }
    
    return null;
  };

  // Helper to get week number of the year
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Helper to check if date is in season
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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recycle Pro</Text>
        <Text style={styles.subtitle}>{oradell.name}, {oradell.state}</Text>
        <Text style={styles.zoneText}>{selectedZone.name}</Text>
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
  zoneText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
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
});
