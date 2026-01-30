import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  // State to track the current week
  const [currentDate] = useState(new Date());

  // Function to get the current week's dates
  const getWeekDates = () => {
    const week = [];
    const today = new Date(currentDate);
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Get Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    
    // Generate all 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    
    return week;
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get collection type for a specific date
  const getCollectionType = (date: Date) => {
    const day = date.getDay();
    
    // Example schedule for Oradell:
    // Monday & Thursday: Garbage
    // Wednesday: Recycling (alternating weeks)
    if (day === 1 || day === 4 || day === 5) return 'Garbage';
    if (day === 3) return 'Recycling';
    return null;
  };

  const weekDates = getWeekDates();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recycle Pro</Text>
        <Text style={styles.subtitle}>Oradell, NJ</Text>
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
                    collectionType === 'Garbage' ? styles.garbageBadge : styles.recyclingBadge
                  ]}>
                    <Text style={styles.badgeText}>
                      {collectionType === 'Garbage' ? '🗑️' : '♻️'}
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
          <Text style={styles.collectionText}>
            {getCollectionType(new Date())} Collection
          </Text>
        ) : (
          <Text style={styles.collectionText}>No collection today</Text>
        )}
      </View>

      {/* Next Collection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Collection</Text>
        <Text style={styles.collectionText}>Garbage - Thursday, Jan 30</Text>
      </View>
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
  badgeText: {
    fontSize: 16,
  },
});