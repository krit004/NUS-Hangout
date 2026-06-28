import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Event as FirebaseEvent, getEvents } from '@/firebase/events';
import { AVATAR_MAP } from './profile';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.75; 
const STICKY_HEADER_HEIGHT = 60;
const EVENT_TYPES = ['All', 'Studying', 'Sports', 'Hangout', 'Nature', 'Food'];

// Mock Data 
const MOCK_EVENTS = [
  { id: '1', name: 'CS2100 Midterm Grind', type: 'Studying', color: '#3B82F6', location: 'COM1 SR1', vacancy: 8, time: '14:00 - 18:00' },
  { id: '2', name: '3v3 Half-court Basketball', type: 'Sports', color: '#EF4444', location: 'MPSH 1', vacancy: 3, time: '16:30 - 19:00' },
  { id: '3', name: 'Dinner & Chill', type: 'Food', color: '#10B981', location: 'Frontier UTown', vacancy: 5, time: '18:30 - 20:30' },
  { id: '4', name: 'MacRitchie Evening Trek', type: 'Nature', color: '#059669', location: 'MacRitchie Reservoir', vacancy: 12, time: '17:00 - 19:30' },
  { id: '5', name: 'Board Games Night', type: 'Hangout', color: '#8B5CF6', location: 'UTown ERC', vacancy: 4, time: '19:00 - 23:00' },
];

// Type definition for our events
interface EventItem {
  id: string;
  name: string;
  type: string;
  color: string;
  location: string;
  vacancy: number;
  time: string;
  host: string;
  description: string;
}

export default function HomeScreen() {
  const [selectedDay, setSelectedDay] = useState('Today');
  const [selectedType, setSelectedType] = useState('All');
  const [showDropdownOptions, setShowDropdownOptions] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [firebaseEvents, setFirebaseEvents] = useState<FirebaseEvent[]>([]);
  
  useFocusEffect(
    useCallback(() => {
      getEvents().then(setFirebaseEvents).catch(console.error);
    }, [])
  );
  
  // Animation hooks
  const [scrollY] = useState(() => new Animated.Value(0));
  const [welcomeFade] = useState(() => new Animated.Value(1));
  const scrollRef = useRef<any>(null);
  
  const handleTypeFilter = useCallback((type: string) => {
    setSelectedType(type);
    // Scroll to the filter bar position so cards are visible
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: MAP_HEIGHT, animated: true });
    }
  }, []);
  

  // 1. Fade out the welcome text automatically on mount
  useEffect(() => {
    Animated.timing(welcomeFade, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  // 2. Parallax calculations for scrolling up
  // Map scrolls up faster than regular scroll rate
  const mapTranslateY = scrollY.interpolate({
    inputRange: [0, MAP_HEIGHT],
    outputRange: [0, -MAP_HEIGHT * 1.3],
    extrapolate: 'clamp',
  });

  const mapOpacity = scrollY.interpolate({
    inputRange: [0, MAP_HEIGHT * 0.8],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Welcome banner fade away based on manual scrolling if still visible
  const welcomeScrollOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Joining helper
  const handleJoinRequest = (eventId: string) => {
    if (joinedEvents.includes(eventId)) return;
    setJoinedEvents([...joinedEvents, eventId]);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Absolute Background Layer: Welcome Statement & Map */}
      <Animated.View style={[styles.backgroundLayer, { transform: [{ translateY: mapTranslateY }], opacity: mapOpacity }]}>
        
        {/* Fading Welcome Header */}
        <Animated.View style={[styles.welcomeContainer, { opacity: Animated.multiply(welcomeFade, welcomeScrollOpacity) }]}>
          <SafeAreaView edges={['top']}>
            <ThemedText type="title" style={styles.title}>Welcome to NUS Hangout</ThemedText>
            <ThemedText type="code" style={styles.codeText}>Check out events around you</ThemedText>
          </SafeAreaView>
        </Animated.View>

        {/* Interactive Map View */}
        <View style={styles.mapContainer}>
          <MapView
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            mapType="satellite"
            initialRegion={{
              latitude: 1.2966,
              longitude: 103.7764,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {firebaseEvents.map(evt => (
              <Marker
                key={evt.id}
                coordinate={{ latitude: evt.latitude || 1.2966, longitude: evt.longitude || 103.7764 }}
                title={evt.title}
                description={evt.location}
                onPress={() => {
                  // Auto-join since you created it
                  if (!joinedEvents.includes(evt.id)) {
                    setJoinedEvents(prev => [...prev, evt.id]);
                  }
                  setSelectedEvent({
                    id: evt.id,
                    name: evt.title,
                    type: evt.category || 'Hangout',
                    color: '#3B82F6',
                    location: evt.location || 'NUS',
                    vacancy: 10,
                    time: evt.startTime ? evt.startTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
                    host: 'You',
                    description: 'An event you created on the map.'
                  });
                }}
              >
                <View style={styles.markerContainer}>
                  {evt.avatar && AVATAR_MAP[evt.avatar] ? (
                    <Image source={AVATAR_MAP[evt.avatar]} style={styles.markerAvatar} />
                  ) : (
                    <View style={styles.markerDot} />
                  )}
                </View>
              </Marker>
            ))}
          </MapView>
          {/* Darker Map Overlay */}
          <View style={styles.darkOverlay} pointerEvents="none" />
        </View>
      </Animated.View>

      {/* Main Scrollable Event Content */}
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingTop: MAP_HEIGHT }]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        snapToOffsets={[0, MAP_HEIGHT]}
        decelerationRate="fast"
        stickyHeaderIndices={[0]}
      >
        {/* Sticky Header: Timeline + Type Filters */}
        <View style={styles.stickyHeaderContainer}>
          <View style={styles.dropdownBar}>
            <ThemedText type="defaultSemiBold">Timeline: </ThemedText>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => setShowDropdownOptions(!showDropdownOptions)}
            >
              <ThemedText style={styles.dropdownButtonText}>{selectedDay} (Upcoming)</ThemedText>
            </TouchableOpacity>
          </View>
          
          {showDropdownOptions && (
            <View style={styles.dropdownMenu}>
              {['Today', 'Tomorrow', 'Wednesday', 'Thursday'].map((day) => (
                <TouchableOpacity 
                  key={day} 
                  style={styles.dropdownItem} 
                  onPress={() => {
                    setSelectedDay(day);
                    setShowDropdownOptions(false);
                  }}
                >
                  <ThemedText>{day}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Type Filter Chips - inside sticky header */}
          <View style={styles.typeFilterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeFilterScroll}>
              {EVENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, selectedType === type && styles.typeChipActive]}
                  onPress={() => handleTypeFilter(type)}
                >
                  <ThemedText style={[styles.typeChipText, selectedType === type && styles.typeChipTextActive]}>{type}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Cards Content Section */}
        <ThemedView style={styles.cardsContainer}>
          {[...MOCK_EVENTS, ...firebaseEvents.map(evt => ({
            id: evt.id,
            name: evt.title,
            type: evt.category || 'Hangout',
            color: '#8B5CF6',
            location: evt.location || 'Campus',
            vacancy: 10,
            time: evt.startTime ? evt.startTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
            host: 'Community Member',
            description: 'A community-created event.'
          }))]
            .filter(event => selectedType === 'All' || event.type === selectedType)
            .map((event, index) => {
            // Cards start invisible and fade in as user scrolls past the map
            const cardInputRange = [-1, 0, MAP_HEIGHT * 0.6 + index * 20, MAP_HEIGHT + index * 25];
            const cardTranslateY = scrollY.interpolate({
              inputRange: cardInputRange,
              outputRange: [0, 0, 30, 0],
              extrapolate: 'clamp',
            });
            const cardOpacity = scrollY.interpolate({
              inputRange: cardInputRange,
              outputRange: [0, 0, 0, 1],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View 
                key={event.id} 
                style={[
                  styles.eventCard, 
                  { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }
                ]}
              >
                <TouchableOpacity onPress={() => setSelectedEvent(event as any)} activeOpacity={0.7}>
                  <View style={styles.cardHeader}>
                    <ThemedText type="subtitle" style={styles.eventName}>{event.name}</ThemedText>
                    <View style={[styles.badge, { backgroundColor: event.color }]}>
                      <ThemedText style={styles.badgeText}>{event.type}</ThemedText>
                    </View>
                  </View>

                  <View style={styles.cardDetailsRow}>
                    <ThemedText type="defaultSemiBold" style={styles.locationText}>📍 {event.location}</ThemedText>
                    <ThemedText style={styles.vacancyText}>👥 {event.vacancy} left</ThemedText>
                  </View>

                  <View style={styles.cardFooter}>
                    <ThemedText type="small" style={styles.timeText}>🕒 {event.time}</ThemedText>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
          
          {Platform.OS === 'web' && <WebBadge />}
          <View style={{ height: BottomTabInset + Spacing.four }} />
        </ThemedView>
      </Animated.ScrollView>
      <Modal
        visible={selectedEvent !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedEvent(null)}
      >
        {selectedEvent && (
          <SafeAreaView style={styles.detailContainer}>
            <View style={styles.detailHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedEvent(null)}>
                <ThemedText style={styles.closeButtonText}>✕ Close</ThemedText>
              </TouchableOpacity>
              <View style={[styles.badge, { backgroundColor: selectedEvent.color }]}>
                <ThemedText style={styles.badgeText}>{selectedEvent.type}</ThemedText>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.detailContent}>
              <ThemedText type="title" style={styles.detailTitle}>{selectedEvent.name}</ThemedText>
              <ThemedText style={styles.detailHost}>Hosted by {selectedEvent.host}</ThemedText>
              
              <View style={styles.divider} />
              
              <View style={styles.infoBlock}>
                <ThemedText type="defaultSemiBold" style={styles.infoLabel}>📍 Location</ThemedText>
                <ThemedText style={styles.infoValue}>{selectedEvent.location}</ThemedText>
              </View>

              <View style={styles.infoBlock}>
                <ThemedText type="defaultSemiBold" style={styles.infoLabel}>🕒 Timeframe</ThemedText>
                <ThemedText style={styles.infoValue}>{selectedEvent.time}</ThemedText>
              </View>

              <View style={styles.infoBlock}>
                <ThemedText type="defaultSemiBold" style={styles.infoLabel}>👥 Available Spots</ThemedText>
                <ThemedText style={styles.infoValue}>{selectedEvent.vacancy} vacancies remaining</ThemedText>
              </View>

              <View style={styles.infoBlock}>
                <ThemedText type="defaultSemiBold" style={styles.infoLabel}>📝 Description</ThemedText>
                <ThemedText style={styles.descriptionText}>{selectedEvent.description}</ThemedText>
              </View>
            </ScrollView>

            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={[
                  styles.joinButton, 
                  joinedEvents.includes(selectedEvent.id) && styles.joinedButton
                ]}
                onPress={() => handleJoinRequest(selectedEvent.id)}
                disabled={joinedEvents.includes(selectedEvent.id)}
              >
                <ThemedText style={styles.joinButtonText}>
                  {joinedEvents.includes(selectedEvent.id) ? '✓ Request Sent' : 'Request to Join Hangout'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: MAP_HEIGHT,
    zIndex: 0,
  },
  welcomeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(242, 242, 247, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: Spacing.four,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  codeText: {
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: 12,
    opacity: 0.7,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  darkOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerAvatar: {
    width: '100%',
    height: '100%',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  stickyHeaderContainer: {
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  dropdownBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: STICKY_HEADER_HEIGHT,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  dropdownButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    marginLeft: Spacing.two,
  },
  dropdownButtonText: {
    fontWeight: '600',
    color: '#2563EB',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'absolute',
    top: STICKY_HEADER_HEIGHT,
    left: 0,
    right: 0,
    elevation: 5,
    zIndex: 200,
  },
  dropdownItem: {
    padding: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  typeFilterContainer: {
    backgroundColor: '#F9FAFB',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  typeFilterScroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  typeChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  typeChipText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardsContainer: {
    minHeight: SCREEN_HEIGHT,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.one,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.one,
  },
  locationText: {
    color: '#4B5563',
    fontSize: 14,
  },
  vacancyText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  cardFooter: {
    marginTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
    paddingTop: Spacing.two,
  },
  timeText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  // Description View Styles
  detailContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  closeButton: { paddingVertical: Spacing.one },
  closeButtonText: { color: '#4B5563', fontSize: 16, fontWeight: '600' },
  detailContent: { padding: Spacing.four },
  detailTitle: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.one },
  detailHost: { fontSize: 14, color: '#6B7280', marginBottom: Spacing.three },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: Spacing.two },
  infoBlock: { marginBottom: Spacing.four },
  infoLabel: { fontSize: 15, color: '#4B5563', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#111827' },
  descriptionText: { fontSize: 16, color: '#374151', lineHeight: 22 },
  actionContainer: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB', marginBottom: Platform.OS === 'ios' ? 0 : Spacing.two },
  joinButton: { backgroundColor: '#2563EB', paddingVertical: Spacing.three, borderRadius: Spacing.three, alignItems: 'center', justifyContent: 'center' },
  joinedButton: { backgroundColor: '#10B981' },
  joinButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});